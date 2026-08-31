/**
 * ============================================================
 * AIZPRUA S.E. — ESCUDO PREVENTIVO SERVER
 * ============================================================
 * Express server que sirve la landing page estática y expone
 * los endpoints de la API de CyberSource Flex Microform v2.
 * 
 * Endpoints:
 *   GET  /api/capture-context   → Genera Capture Context JWT para Flex Microform
 *   POST /api/process-payment   → Cobra $79 USD usando el Transient Token
 *   GET  /api/health            → Health check para Coolify
 *   *    /*                     → Archivos estáticos de la landing page
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const { cybersourceRequest } = require('./lib/cybersource-auth');

const app = express();
app.use(express.json());

// ============================================================
// CONFIGURACIÓN DE CYBERSOURCE (desde variables de entorno)
// ============================================================
const CS_CONFIG = {
  merchantId: process.env.CS_MERCHANT_ID || 'bg_aizpruase',
  keyId: process.env.CS_KEY_ID || '',
  sharedSecretB64: process.env.CS_SHARED_SECRET_B64 || '',
  host: process.env.CS_HOST || 'apitest.cybersource.com'
};

const TARGET_ORIGINS = (process.env.TARGET_ORIGINS || 'https://escudo.aizpruase.com,http://localhost:3000').split(',').map(s => s.trim());
const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARE: Bloquear acceso a archivos del servidor
// ============================================================
app.use((req, res, next) => {
  const blocked = ['/server.js', '/package.json', '/package-lock.json', '/.env', '/.env.example', '/Dockerfile', '/.dockerignore'];
  if (blocked.includes(req.path) || req.path.startsWith('/lib/') || req.path.startsWith('/node_modules/')) {
    return res.status(404).send('Not Found');
  }
  next();
});

// ============================================================
// API: Health Check
// ============================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Aizprua S.E. Escudo Preventivo + CyberSource',
    environment: CS_CONFIG.host.includes('test') ? 'SANDBOX' : 'PRODUCTION',
    merchantId: CS_CONFIG.merchantId,
    configured: !!(CS_CONFIG.keyId && CS_CONFIG.sharedSecretB64)
  });
});

// ============================================================
// API: Generar Capture Context para CyberSource Unified Checkout
// ============================================================
app.get('/api/capture-context', async (req, res) => {
  if (!CS_CONFIG.keyId || !CS_CONFIG.sharedSecretB64) {
    return res.status(500).json({
      error: 'CyberSource credentials not configured. Set CS_KEY_ID and CS_SHARED_SECRET_B64 environment variables.'
    });
  }

  try {
    const clientRefCode = 'EP-' + Date.now();
    
    // Obtener origen dinámico de la petición para soportar dominios de Coolify y producción
    const originsSet = new Set(TARGET_ORIGINS.map(origin => origin.replace(/^http:\/\//, 'https://')));
    if (req.headers.origin) {
      originsSet.add(req.headers.origin.replace(/^http:\/\//, 'https://'));
    }
    if (req.headers.host) {
      originsSet.add(`https://${req.headers.host}`);
    }
    const finalOrigins = Array.from(originsSet);

    const payload = {
      targetOrigins: finalOrigins,
      allowedPaymentTypes: ['PANENTRY'],
      allowedCardNetworks: ['VISA', 'MASTERCARD'],
      country: 'PA',
      locale: 'es_PA',
      captureMandate: {
        billingType: 'FULL'
      },
      completeMandate: {
        type: 'CAPTURE',
        consumerAuthentication: '3DS',
        decisionManager: true
      },
      data: {
        orderInformation: {
          amountDetails: {
            totalAmount: '79.00',
            currency: 'USD'
          }
        },
        clientReferenceInformation: {
          code: clientRefCode
        }
      },
      buttonType: 'CHECKOUT'
    };

    const result = await cybersourceRequest('/uc/v1/sessions', payload, CS_CONFIG);

    if (result.httpStatus === 200 || result.httpStatus === 201) {
      const jwtString = result.isRaw ? result.rawBody : (result.keyId ? JSON.stringify(result) : result);
      res.json({
        status: 'ok',
        captureContext: jwtString,
        clientReferenceCode: clientRefCode
      });
    } else {
      console.error('CyberSource Unified Checkout Capture Context Error:', JSON.stringify(result, null, 2));
      res.status(result.httpStatus || 500).json({
        error: 'Error generando Capture Context de Unified Checkout',
        details: result.message || result
      });
    }
  } catch (err) {
    console.error('Capture Context Exception:', err);
    res.status(500).json({ error: 'Error de conexión con CyberSource', details: err.message });
  }
});

// ============================================================
// API: Procesar Pago con Transient Token
// ============================================================
app.post('/api/process-payment', async (req, res) => {
  if (!CS_CONFIG.keyId || !CS_CONFIG.sharedSecretB64) {
    return res.status(500).json({
      error: 'CyberSource credentials not configured.'
    });
  }

  const { transientToken, firstName, lastName, email, phone, address, clientReferenceCode } = req.body;

  if (!transientToken) {
    return res.status(400).json({ error: 'transientToken es requerido.' });
  }

  try {
    const payload = {
      clientReferenceInformation: {
        code: clientReferenceCode || ('EP-' + Date.now())
      },
      processingInformation: {
        commerceIndicator: 'internet'
      },
      tokenInformation: {
        transientTokenJwt: transientToken
      },
      orderInformation: {
        amountDetails: {
          totalAmount: '79.00',
          currency: 'USD'
        },
        billTo: {
          firstName: firstName || 'N/A',
          lastName: lastName || 'N/A',
          address1: address || 'Panamá',
          locality: 'Panamá',
          administrativeArea: 'Panamá',
          postalCode: '00000',
          country: 'PA',
          email: email || '',
          phoneNumber: phone || ''
        },
        lineItems: [
          {
            unitPrice: '79.00',
            totalAmount: '79.00',
            taxAmount: '0.00',
            amountIncludesTax: true
          }
        ],
        invoiceDetails: {
          purchaseOrderNumber: 'CUS' + (clientReferenceCode || 'EP-123456').replace(/[^\d]/g, '').slice(-6),
          taxable: false
        }
      }
    };

    console.log(`💳 Procesando pago de $79.00 USD para ${firstName} ${lastName} (${email})...`);

    const result = await cybersourceRequest('/pts/v2/payments', payload, CS_CONFIG);

    console.log(`   → CyberSource Response: HTTP ${result.httpStatus} | Status: ${result.status} | RID: ${result.id || 'N/A'}`);

    if (result.status === 'AUTHORIZED') {
      // ✅ Pago autorizado — Registrar en Google Sheets vía webhook
      try {
        const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK;
        if (webhookUrl) {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              sheet_id: 544966935, // ID de Hoja 2 (Asesorías y Diagnósticos)
              tipo: 'asesoria',
              nombre: `${firstName} ${lastName}`,
              email: email,
              telefono: phone,
              origen: 'Diagnóstico Escudo Preventivo ($79 USD) — CyberSource',
              detalles: `RID: ${result.id} | Ref: ${payload.clientReferenceInformation.code}`
            })
          });
          console.log(`   ✅ Cliente registrado en Google Sheets y MailerLite`);
        }
      } catch (webhookErr) {
        console.error('   ⚠️ Error registrando en Sheets:', webhookErr.message);
      }

      return res.json({
        status: 'success',
        message: '¡Pago autorizado por Banco General!',
        cybersource: {
          id: result.id,
          status: result.status,
          ref: payload.clientReferenceInformation.code
        }
      });
    } else {
      // ❌ Pago declinado
      const errorMsg = (result.errorInformation && result.errorInformation.message) ||
                        result.message ||
                        'Transacción declinada por CyberSource.';
      return res.json({
        status: 'decline',
        message: errorMsg,
        cybersource: {
          id: result.id,
          status: result.status,
          reason: result.errorInformation?.reason
        }
      });
    }
  } catch (err) {
    console.error('Process Payment Exception:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error de conexión con el procesador de pagos.',
      details: err.message
    });
  }
});

// ============================================================
// ARCHIVOS ESTÁTICOS (Landing Page)
// ============================================================
app.use(express.static(path.join(__dirname, 'public')));

// Fallback: cualquier ruta no-API sirve index.html
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================
app.listen(PORT, () => {
  console.log('');
  console.log('🛡️  Escudo Preventivo Server');
  console.log(`   URL:         http://localhost:${PORT}`);
  console.log(`   Ambiente:    ${CS_CONFIG.host.includes('test') ? '🟡 SANDBOX' : '🟢 PRODUCCIÓN'}`);
  console.log(`   Merchant ID: ${CS_CONFIG.merchantId}`);
  console.log(`   Credenciales: ${CS_CONFIG.keyId ? '✅ Configuradas' : '❌ FALTANTES (configurar .env)'}`);
  console.log(`   Origins:     ${TARGET_ORIGINS.join(', ')}`);
  console.log('');
});
