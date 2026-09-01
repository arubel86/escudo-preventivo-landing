/**
 * ============================================================
 * CYBERSOURCE HMAC-SHA256 AUTHENTICATION (Node.js)
 * ============================================================
 * Puerto directo y exacto de test_cs_conn.py a Node.js.
 * Usa el módulo nativo `crypto` de Node.js — sin dependencias externas.
 * 
 * Genera las cabeceras HTTP requeridas por la REST API de CyberSource:
 *   - Digest (SHA-256 del body)
 *   - Date (formato GMT HTTP estándar)
 *   - Signature (HMAC-SHA256 firmada con el Shared Secret de Banco General)
 *   - v-c-merchant-id
 */

const crypto = require('crypto');
const https = require('https');

/**
 * Genera las cabeceras de autenticación firmadas para una petición a CyberSource.
 * 
 * @param {string} method - Método HTTP ('post' o 'get')
 * @param {string} resource - Ruta del recurso (ej: '/pts/v2/payments')
 * @param {string} bodyString - Body JSON stringificado (vacío para GET)
 * @param {Object} config - Configuración con merchantId, keyId, sharedSecretB64, host
 * @returns {Object} Headers listos para usar con fetch/https
 */
function generateCyberSourceHeaders(method, resource, bodyString, config) {
  const merchantId = (config.merchantId || '').trim();
  const keyId = (config.keyId || '').trim();
  const sharedSecretB64 = (config.sharedSecretB64 || '').trim();
  const host = (config.host || '').trim();

  // 1. Calcular Digest (SHA-256 del body en Base64)
  const digestHash = crypto.createHash('sha256').update(bodyString, 'utf-8').digest('base64');
  const digestHeader = `SHA-256=${digestHash}`;

  // 2. Fecha GMT en formato HTTP estándar (idéntico a Python: "%a, %d %b %Y %H:%M:%S GMT")
  const gmtDate = new Date().toUTCString();

  // 3. Cadena de firmado (orden exacto exigido por CyberSource)
  const signatureString = [
    `host: ${host}`,
    `date: ${gmtDate}`,
    `(request-target): ${method.toLowerCase()} ${resource}`,
    `digest: ${digestHeader}`,
    `v-c-merchant-id: ${merchantId}`
  ].join('\n');

  // 4. Firmar con HMAC-SHA256 usando el Shared Secret decodificado de Base64
  const sharedSecretBytes = Buffer.from(sharedSecretB64, 'base64');
  const sigHmac = crypto.createHmac('sha256', sharedSecretBytes)
    .update(signatureString, 'utf-8')
    .digest('base64');

  // 5. Construir cabecera Signature
  const signatureHeader = `keyid="${keyId}", algorithm="HmacSHA256", headers="host date (request-target) digest v-c-merchant-id", signature="${sigHmac}"`;

  return {
    'v-c-merchant-id': merchantId,
    'Date': gmtDate,
    'Host': host,
    'Digest': digestHeader,
    'Signature': signatureHeader,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
}

/**
 * Realiza una petición autenticada a la REST API de CyberSource usando https nativo.
 * Preserva las mayúsculas/minúsculas exactas en las cabeceras HTTP que exigen las pasarelas bancarias.
 * 
 * @param {string} resource - Ruta del recurso (ej: '/pts/v2/payments')
 * @param {Object} payload - Objeto JS que se enviará como JSON
 * @param {Object} config - Configuración de CyberSource
 * @returns {Promise<Object>} Respuesta parseada de CyberSource
 */
function cybersourceRequest(resource, payload, config) {
  return new Promise((resolve, reject) => {
    const bodyString = JSON.stringify(payload);
    const headers = generateCyberSourceHeaders('post', resource, bodyString, config);

    const req = https.request({
      hostname: config.host,
      path: resource,
      method: 'POST',
      headers: headers
    }, (res) => {
      let responseText = '';
      res.on('data', chunk => responseText += chunk);
      res.on('end', () => {
        try {
          resolve({
            httpStatus: res.statusCode,
            ...JSON.parse(responseText)
          });
        } catch (e) {
          resolve({
            httpStatus: res.statusCode,
            isRaw: true,
            rawBody: responseText
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(bodyString);
    req.end();
  });
}

module.exports = { generateCyberSourceHeaders, cybersourceRequest };
