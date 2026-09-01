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
 * 
 * IMPORTANTE: Usa raw TLS socket en lugar de https.request porque
 * Node.js https.request convierte los headers a Title-Case (ej: v-c-merchant-id → V-C-Merchant-Id),
 * y CyberSource rechaza la firma cuando el header no es exactamente "v-c-merchant-id" en minúsculas.
 */

const crypto = require('crypto');
const tls = require('tls');

/**
 * Genera las cabeceras de autenticación firmadas para una petición a CyberSource.
 * 
 * @param {string} method - Método HTTP ('post' o 'get')
 * @param {string} resource - Ruta del recurso (ej: '/pts/v2/payments')
 * @param {string} bodyString - Body JSON stringificado (vacío para GET)
 * @param {Object} config - Configuración con merchantId, keyId, sharedSecretB64, host
 * @returns {Object} Headers listos para usar
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
    'Content-Type': 'application/json'
  };
}

/**
 * Realiza una petición autenticada a la REST API de CyberSource usando raw TLS socket.
 * 
 * Usa TLS directo en lugar de https.request para PRESERVAR las mayúsculas/minúsculas
 * exactas de los headers HTTP. Node.js https.request normaliza headers a Title-Case,
 * lo cual rompe la firma HMAC que CyberSource valida.
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
    const host = (config.host || '').trim();

    // Construir petición HTTP/1.1 RAW para preservar casing exacto de headers
    const rawRequest = [
      `POST ${resource} HTTP/1.1`,
      `Host: ${host}`,
      `Date: ${headers['Date']}`,
      `Digest: ${headers['Digest']}`,
      `Signature: ${headers['Signature']}`,
      `v-c-merchant-id: ${headers['v-c-merchant-id']}`,
      `Content-Type: application/json`,
      `Content-Length: ${Buffer.byteLength(bodyString)}`,
      `Connection: close`,
      '',
      bodyString
    ].join('\r\n');

    const socket = tls.connect(443, host, { servername: host }, () => {
      socket.write(rawRequest);
    });

    let response = '';
    socket.on('data', (chunk) => {
      response += chunk.toString();
    });

    socket.on('end', () => {
      try {
        // Separar headers de body en la respuesta HTTP raw
        const headerBodySplit = response.indexOf('\r\n\r\n');
        if (headerBodySplit === -1) {
          resolve({ httpStatus: 0, isRaw: true, rawBody: response });
          return;
        }

        const headerSection = response.substring(0, headerBodySplit);
        const bodySection = response.substring(headerBodySplit + 4);

        // Extraer HTTP status code
        const statusLine = headerSection.split('\r\n')[0];
        const statusMatch = statusLine.match(/HTTP\/[\d.]+ (\d+)/);
        const httpStatus = statusMatch ? parseInt(statusMatch[1], 10) : 0;

        // Parsear body JSON
        try {
          const parsed = JSON.parse(bodySection);
          resolve({ httpStatus, ...parsed });
        } catch (e) {
          resolve({ httpStatus, isRaw: true, rawBody: bodySection });
        }
      } catch (e) {
        resolve({ httpStatus: 0, isRaw: true, rawBody: response, parseError: e.message });
      }
    });

    socket.on('error', (err) => {
      reject(err);
    });

    // Timeout de 30 segundos
    socket.setTimeout(30000, () => {
      socket.destroy();
      reject(new Error('CyberSource request timed out after 30s'));
    });
  });
}

module.exports = { generateCyberSourceHeaders, cybersourceRequest };
