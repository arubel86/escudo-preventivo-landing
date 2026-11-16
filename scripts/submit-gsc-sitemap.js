const { getAccessToken, callGSC, SITE_URL } = require('./gsc-client');

async function submitSitemap() {
    try {
        const token = await getAccessToken();
        const encodedSite = encodeURIComponent(SITE_URL);
        const sitemapUrl = 'https://aizprua.com/sitemap.xml';
        const encodedFeed = encodeURIComponent(sitemapUrl);

        console.log(`Enviando ${sitemapUrl} a Google Search Console...`);
        const res = await callGSC(token, `/webmasters/v3/sites/${encodedSite}/sitemaps/${encodedFeed}`, 'PUT');
        console.log('Respuesta de envío de sitemap:');
        console.log(res);
        console.log('\nSitemap https://aizprua.com/sitemap.xml enviado exitosamente a Google!');
    } catch (e) {
        console.error('Error:', e.message);
    }
}

submitSitemap();

