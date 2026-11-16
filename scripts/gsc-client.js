/**
 * AIZPRUA S.E. — CLIENTE COMPLETO GOOGLE SEARCH CONSOLE API
 * Permite consultar métricas de rendimiento, palabras clave,
 * inspección de indexación y sitemaps.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const credsPath = path.join(__dirname, '..', 'gsc-credentials.json');
if (!fs.existsSync(credsPath)) {
    console.error('Error: No se encontró gsc-credentials.json');
    process.exit(1);
}

const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
const SITE_URL = 'sc-domain:aizprua.com';

function getSignedJWT() {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const claim = {
        iss: creds.client_email,
        scope: 'https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/webmasters.readonly',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now
    };

    const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
    const b64Claim = Buffer.from(JSON.stringify(claim)).toString('base64url');
    const signatureInput = `${b64Header}.${b64Claim}`;

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signatureInput);
    sign.end();

    const signature = sign.sign(creds.private_key, 'base64url');
    return `${signatureInput}.${signature}`;
}

function getAccessToken() {
    return new Promise((resolve, reject) => {
        const jwt = getSignedJWT();
        const postData = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;

        const req = https.request({
            hostname: 'oauth2.googleapis.com',
            path: '/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data).access_token);
                } else {
                    reject(new Error(`Error al autenticar (${res.statusCode}): ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

function callGSC(accessToken, endpoint, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'searchconsole.googleapis.com',
            path: endpoint,
            method: method,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        };

        let postBody = null;
        if (body) {
            postBody = JSON.stringify(body);
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = Buffer.byteLength(postBody);
        }

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, raw: data });
                }
            });
        });

        req.on('error', reject);
        if (postBody) req.write(postBody);
        req.end();
    });
}

// Consultar Analítica de Búsqueda (Últimos 28 días)
async function getSearchAnalytics(accessToken) {
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    const startDateObj = new Date();
    startDateObj.setDate(today.getDate() - 28);
    const startDate = startDateObj.toISOString().split('T')[0];

    const encodedSite = encodeURIComponent(SITE_URL);
    const endpoint = `/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`;

    const body = {
        startDate: startDate,
        endDate: endDate,
        dimensions: ['query'],
        rowLimit: 10
    };

    return await callGSC(accessToken, endpoint, 'POST', body);
}

// Consultar Sitemaps registrados
async function getSitemaps(accessToken) {
    const encodedSite = encodeURIComponent(SITE_URL);
    const endpoint = `/webmasters/v3/sites/${encodedSite}/sitemaps`;
    return await callGSC(accessToken, endpoint, 'GET');
}

async function main() {
    console.log('Autenticando con Google Search Console API...');
    try {
        const token = await getAccessToken();
        console.log('Autenticacion exitosa.\n');

        console.log('Consultando estado de sitemaps...');
        const sitemapsRes = await getSitemaps(token);
        if (sitemapsRes.data && sitemapsRes.data.sitemap) {
            console.log('Sitemaps activos:');
            sitemapsRes.data.sitemap.forEach(s => {
                console.log(` - ${s.path} (Ultima descarga: ${s.lastDownloaded || 'N/A'}, Errores: ${s.errors || 0})`);
            });
        } else {
            console.log('Sitemaps encontrados:', JSON.stringify(sitemapsRes.data));
        }

        console.log('\nConsultando rendimiento de busquedas organicas (ultimos 28 dias)...');
        const analyticsRes = await getSearchAnalytics(token);
        if (analyticsRes.data && analyticsRes.data.rows && analyticsRes.data.rows.length > 0) {
            console.log('Top consultas de busqueda:');
            analyticsRes.data.rows.forEach(r => {
                console.log(` - "${r.keys[0]}": Clics: ${r.clicks}, Impresiones: ${r.impressions}, Posicion media: ${r.position.toFixed(1)}`);
            });
        } else {
            console.log('Aun no hay datos de clics acumulados en este periodo (los datos tardan 48-72h en reflejarse tras la indexacion).');
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
}

if (require.main === module) {
    main();
}

module.exports = { getAccessToken, callGSC, SITE_URL };
