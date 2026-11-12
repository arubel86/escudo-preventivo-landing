/**
 * AIZPRUA S.E. — ENVÍO AUTOMÁTICO DE URLS A BING WEBMASTER API
 * 
 * Lee todas las URLs activas desde public/sitemap.xml y las envía
 * en bloque a la API de Bing Webmaster / IndexNow para indexación
 * prioritaria en Bing y buscadores basados en IA (Copilot, ChatGPT).
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');

const apiKey = process.env.BING_WEBMASTER_API_KEY || 'f9b9181b8e8c403f9bd225b100274059';
const siteUrl = 'https://aizprua.com';

if (!apiKey) {
    console.error('Error: BING_WEBMASTER_API_KEY no encontrada en variables de entorno.');
    process.exit(1);
}

const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
if (!fs.existsSync(sitemapPath)) {
    console.error('Error: sitemap.xml no encontrado en public/sitemap.xml');
    process.exit(1);
}

const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
const locMatches = sitemapContent.matchAll(/<loc>(https:\/\/aizprua\.com[^<]*)<\/loc>/g);
const urls = Array.from(locMatches, m => m[1]);

if (urls.length === 0) {
    console.warn('Advertencia: No se encontraron URLs de aizprua.com en el sitemap.');
    process.exit(0);
}

// Limitar a máximo 500 URLs por lote según cuota de Bing
const batchUrls = urls.slice(0, 500);

console.log(`Enviando ${batchUrls.length} URLs de ${siteUrl} a Bing Webmaster API...`);

const payload = JSON.stringify({
    siteUrl: siteUrl,
    urlList: batchUrls
});

const options = {
    hostname: 'ssl.bing.com',
    path: `/webmaster/api.svc/json/SubmitUrlbatch?apikey=${apiKey}`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload)
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log('Exito: Lote de URLs recibido y encolado en Bing con exito.');
            console.log(`Estado HTTP: ${res.statusCode} OK`);
            console.log('URLs indexadas:', batchUrls.length);
        } else {
            console.error(`Error de Bing API (${res.statusCode}):`, data);
        }
    });
});

req.on('error', (err) => {
    console.error('Error de red al conectar con Bing:', err.message);
});

req.write(payload);
req.end();

