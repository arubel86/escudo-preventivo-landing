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
const crypto = require('crypto');
const { cybersourceRequest } = require('./lib/cybersource-auth');

// Secret para firmar tokens de sesión de pago (1 hora)
const PAYMENT_SESSION_SECRET = process.env.CS_SHARED_SECRET_B64 || 'aizprua_secure_session_key_2026';

function generatePaymentSessionCookie(transactionId) {
  const timestamp = Date.now();
  const data = `${transactionId}:${timestamp}`;
  const sig = crypto.createHmac('sha256', PAYMENT_SESSION_SECRET).update(data).digest('hex');
  return `${data}:${sig}`;
}

function isValidPaymentSession(cookieHeader) {
  if (!cookieHeader) return false;
  const match = cookieHeader.match(/ep_paid_session=([^;]+)/);
  if (!match) return false;
  const parts = match[1].split(':');
  if (parts.length !== 3) return false;
  const [transactionId, timestampStr, sig] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;
  
  // Validar expiración (60 minutos)
  const maxAgeMs = 60 * 60 * 1000;
  if (Date.now() - timestamp > maxAgeMs) return false;
  
  // Validar firma HMAC
  const expectedSig = crypto.createHmac('sha256', PAYMENT_SESSION_SECRET).update(`${transactionId}:${timestamp}`).digest('hex');
  return sig === expectedSig;
}

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

function formatHttpsOrigin(str) {
  if (!str) return null;
  let s = str.trim();
  if (s.startsWith('http://')) {
    s = 'https://' + s.slice(7);
  } else if (!s.startsWith('https://')) {
    s = 'https://' + s;
  }
  return s.replace(/\/+$/, '');
}

const TARGET_ORIGINS = (process.env.TARGET_ORIGINS || 'https://escudo.aizpruase.com,https://localhost:3000').split(',').map(s => s.trim());
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
    
    // CyberSource exige que TODOS los targetOrigins sean utilizados por el navegador.
    // Solo enviamos el origen exacto desde el cual el usuario está navegando.
    const requestOrigin = req.headers.origin
      ? formatHttpsOrigin(req.headers.origin)
      : (req.headers.host ? formatHttpsOrigin(req.headers.host) : formatHttpsOrigin(TARGET_ORIGINS[0]));

    const payload = {
      targetOrigins: [requestOrigin],
      allowedCardNetworks: ['VISA', 'MASTERCARD'],
      clientReferenceInformation: {
        code: clientRefCode
      }
    };

    const result = await cybersourceRequest('/microform/v2/sessions', payload, CS_CONFIG);

    if (result.httpStatus === 200 || result.httpStatus === 201) {
      const jwtString = result.isRaw ? result.rawBody : (result.keyId ? JSON.stringify(result) : result);
      res.json({
        status: 'ok',
        captureContext: jwtString,
        clientReferenceCode: clientRefCode
      });
    } else {
      console.error('CyberSource Microform v2 Session Error:', JSON.stringify(result, null, 2));
      res.status(result.httpStatus || 500).json({
        error: 'Error generando Capture Context de CyberSource Microform',
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

  let { transientToken, firstName, lastName, email, phone, address, clientReferenceCode } = req.body;

  if (!transientToken) {
    return res.status(400).json({ error: 'transientToken es requerido.' });
  }

  // Asegurar que transientTokenJwt sea siempre un string JWT plano
  let jwtString = transientToken;
  if (typeof transientToken === 'object' && transientToken !== null) {
    jwtString = transientToken.token || transientToken.transientTokenJwt || transientToken.jwt || JSON.stringify(transientToken);
  }

  try {
    const payload = {
      clientReferenceInformation: {
        code: clientReferenceCode || ('EP-' + Date.now())
      },
      processingInformation: {
        commerceIndicator: 'internet',
        actionList: ['DECISION_SKIP']
      },
      tokenInformation: {
        transientTokenJwt: jwtString
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

      // 🛡️ Emitir Cookie de sesión de pago autorizada (Válida por 1 hora)
      const sessionToken = generatePaymentSessionCookie(result.id);
      res.setHeader('Set-Cookie', `ep_paid_session=${sessionToken}; Path=/; Max-Age=3600; HttpOnly; SameSite=Lax`);

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
      console.log('   ❌ Pago declinado por CyberSource. Detalle completo:', JSON.stringify(result, null, 2));
      const errorMsg = (result.errorInformation && result.errorInformation.message) ||
                        result.message ||
                        'Transacción declinada por CyberSource.';
      return res.json({
        status: 'decline',
        message: errorMsg,
        cybersource: {
          id: result.id,
          status: result.status,
          reason: result.errorInformation?.reason,
          details: result.errorInformation || result
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
// RUTAS LIMPIAS (Sin extensión .html)
// ============================================================

// 1. Inicio / Cuestionario
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/index.html', (req, res) => {
  const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
  res.redirect(301, '/' + query);
});

// 2. Página B: Video y Oferta
app.get('/escudo-preventivo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'escudo-preventivo.html'));
});

app.get('/escudo-preventivo.html', (req, res) => {
  const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
  res.redirect(301, '/escudo-preventivo' + query);
});

// 3. Página C: Recursos Gratuitos (Lead Magnet)
app.get('/recursos-gratuitos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'recursos-gratuitos.html'));
});

app.get('/recursos-gratuitos.html', (req, res) => {
  const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
  res.redirect(301, '/recursos-gratuitos' + query);
});

// 4. Hub Post-Descarga Guía Gratuita
app.get('/gracias-guia', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'gracias-guia.html'));
});

app.get('/gracias-guia.html', (req, res) => {
  const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
  res.redirect(301, '/gracias-guia' + query);
});

// 5. Hub Post-Pago (Protegido por Sesión Criptográfica)
app.get('/gracias', (req, res) => {
  if (!isValidPaymentSession(req.headers.cookie)) {
    console.log('🔒 Acceso no autorizado bloqueado a /gracias. Redirigiendo a /escudo-preventivo...');
    return res.redirect('/escudo-preventivo');
  }
  res.sendFile(path.join(__dirname, 'public', 'gracias.html'));
});

app.get('/gracias.html', (req, res) => {
  res.redirect(301, '/gracias');
});

// 6. Política de Privacidad
app.get('/privacidad', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacidad.html'));
});

app.get('/privacidad.html', (req, res) => {
  const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
  res.redirect(301, '/privacidad' + query);
});

// 7. Términos y Condiciones
app.get('/terminos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'terminos.html'));
});

app.get('/terminos.html', (req, res) => {
  const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
  res.redirect(301, '/terminos' + query);
});

// ARCHIVOS ESTÁTICOS (Landing Page)
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
