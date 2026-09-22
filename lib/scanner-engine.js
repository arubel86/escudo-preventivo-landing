const cheerio = require('cheerio');
const https = require('https');
const http = require('http');
const tls = require('tls');
const dns = require('dns');

// Configurar DNS públicos resilientes para resolución garantizada en Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // En caso de que no se permita cambiar servidores DNS
}

function customLookup(hostname, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  dns.resolve4(hostname, (err, addrs) => {
    if (err || !addrs || !addrs.length) {
      // Fallback a lookup estándar del sistema
      return dns.lookup(hostname, options, cb);
    }
    if (options && options.all) {
      return cb(null, addrs.map((a) => ({ address: a, family: 4 })));
    }
    cb(null, addrs[0], 4);
  });
}



// Función auxiliar para inspeccionar certificados SSL/TLS
function checkSslCertificate(hostname, timeoutMs = 5000) {
  return new Promise((resolve) => {
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return resolve({
        valid: true,
        issuer: 'Desarrollo Local / Localhost',
        daysRemaining: 365,
        protocol: 'TLSv1.3',
        validTo: 'Válido para entorno local',
      });
    }
    try {
      const socket = tls.connect(
        443,
        hostname,
        {
          servername: hostname,
          lookup: customLookup,
          rejectUnauthorized: false,
          timeout: timeoutMs,
        },
        () => {
          const cert = socket.getPeerCertificate();
          const protocol = socket.getProtocol();
          socket.destroy();
          if (!cert || Object.keys(cert).length === 0) {
            return resolve({ valid: false, error: 'No se obtuvo certificado SSL' });
          }
          const validTo = new Date(cert.valid_to);
          const daysRemaining = Math.floor((validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const issuer = cert.issuer ? (cert.issuer.O || cert.issuer.CN || 'Autoridad Certificadora') : 'Desconocido';
          resolve({
            valid: true,
            issuer,
            validTo: validTo.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
            daysRemaining,
            protocol: protocol || 'TLS 1.3',
          });
        }
      );
      socket.on('error', (err) => resolve({ valid: false, error: err.message }));
      socket.on('timeout', () => {
        socket.destroy();
        resolve({ valid: false, error: 'Tiempo de espera agotado en conexión SSL' });
      });
    } catch (e) {
      resolve({ valid: false, error: e.message });
    }
  });
}

// Función auxiliar para realizar peticiones HTTP/HTTPS con timeout y User-Agent realista
function fetchUrl(targetUrl, timeoutMs = 8000, redirectCount = 0) {
  return new Promise((resolve) => {
    if (redirectCount > 5) {
      return resolve({ ok: false, status: 310, error: 'Demasiadas redirecciones', duration: 0 });
    }
    try {
      const parsed = new URL(targetUrl);
      const client = parsed.protocol === 'https:' ? https : http;
      
      const startTime = Date.now();
      const req = client.get(
        targetUrl,
        {
          lookup: customLookup,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 AizpruaAgentScanner/1.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
          },
          rejectUnauthorized: false,
          timeout: timeoutMs,
        },
        (res) => {
          let data = '';
          
          // Si hay redirección
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            let redirectUrl = res.headers.location;
            if (!redirectUrl.startsWith('http')) {
              redirectUrl = new URL(redirectUrl, targetUrl).toString();
            }
            fetchUrl(redirectUrl, timeoutMs, redirectCount + 1).then(resolve);
            return;
          }

          res.on('data', (chunk) => {
            // Limitar lectura de HTML a 2.5MB para proteger memoria
            if (data.length < 2500000) {
              data += chunk;
            }
          });

          res.on('end', () => {
            const duration = Date.now() - startTime;
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              headers: res.headers,
              body: data,
              duration,
              finalUrl: targetUrl,
            });
          });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        resolve({ ok: false, status: 408, error: 'Tiempo de espera agotado (timeout)', duration: timeoutMs });
      });

      req.on('error', (err) => {
        resolve({ ok: false, status: 0, error: err.message, duration: Date.now() - startTime });
      });
    } catch (e) {
      resolve({ ok: false, status: 0, error: e.message, duration: 0 });
    }
  });
}

// Función para auditar enlaces de la página (rotos y seguridad en target=_blank)
async function auditPageLinks($, origin) {
  const links = $('a[href]');
  const totalLinks = links.length;
  const brokenLinks = [];
  const insecureBlankLinks = [];
  const candidateUrls = new Set();

  links.each((_, el) => {
    const href = $(el).attr('href');
    const target = $(el).attr('target');
    const rel = $(el).attr('rel') || '';

    if (!href) return;
    const trimmed = href.trim();

    // Ignorar anclas internas, javascript, mailto, tel
    if (trimmed.startsWith('#') || trimmed.startsWith('javascript:') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
      return;
    }

    // Verificar seguridad en enlaces que abren en nueva pestaña
    if (target === '_blank') {
      const isExternal = /^https?:\/\//i.test(trimmed) && !trimmed.startsWith(origin);
      if (isExternal && !rel.includes('noopener') && !rel.includes('noreferrer')) {
        insecureBlankLinks.push(trimmed);
      }
    }

    // Normalizar URL absoluta para probar si está rota (máximo 8 enlaces para no demorar la respuesta)
    let fullUrl = null;
    try {
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        fullUrl = trimmed;
      } else if (trimmed.startsWith('/')) {
        fullUrl = `${origin}${trimmed}`;
      }
    } catch (e) {}

    if (fullUrl && candidateUrls.size < 8) {
      candidateUrls.add(fullUrl);
    }
  });

  // Verificar estado de los enlaces candidatos en paralelo
  const testPromises = Array.from(candidateUrls).map(async (testUrl) => {
    try {
      const res = await fetchUrl(testUrl, 4000);
      if (!res.ok && (res.status === 404 || res.status >= 500 || res.status === 0)) {
        brokenLinks.push({ url: testUrl, status: res.status || 'Caído' });
      }
    } catch (err) {
      // Ignorar timeout en links externos
    }
  });

  await Promise.all(testPromises);

  return {
    totalLinks,
    brokenLinks,
    insecureBlankLinks,
  };
}


async function runAudit(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('Debes proporcionar una URL válida');
  }

    console.log(`[API /api/scan] Solicitud recibida para: "${url}"`);
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Debes proporcionar una URL válida' });
    }

  url = url.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (err) {
    return res.status(400).json({ error: 'Formato de URL inválido. Ejemplo: https://midominio.com' });
  }

  const origin = parsedUrl.origin;
  const domain = parsedUrl.hostname;

  // 1. Petición principal a la página
  const pageResult = await fetchUrl(url, 9000);
  if (!pageResult.ok && pageResult.status === 0) {
    return res.status(502).json({
      error: `No fue posible conectar con el sitio web (${url}). Error de red: ${pageResult.error}`,
    });
  }

  // 2. Peticiones paralelas secundarias para sitemap, robots, llms.txt, test de 404, redirección HTTP y Certificado SSL
  const notFoundPath = `/test-not-found-${Math.random().toString(36).substring(7)}`;
  const [robotsResult, sitemapResult, llmsResult, notFoundResult, httpRedirectResult, sslCertResult] = await Promise.all([
    fetchUrl(`${origin}/robots.txt`, 5000),
    fetchUrl(`${origin}/sitemap.xml`, 5000),
    fetchUrl(`${origin}/llms.txt`, 5000),
    fetchUrl(`${origin}${notFoundPath}`, 5000),
    fetchUrl(`http://${domain}/`, 5000),
    checkSslCertificate(domain, 5000),
  ]);

  // Parsing del HTML con Cheerio
  const rawHtml = pageResult.body || '';
  const $ = cheerio.load(rawHtml);

  // Auditoría concurrente de enlaces internos y externos
  const linksAudit = await auditPageLinks($, origin);

  // 3. Ejecución de auditoría por módulos
  const checks = [];

  // ==========================================
  // CATEGORÍA 1: SEO & ESTRUCTURA
  // ==========================================

  // 1.1 Título de la página
  const pageTitle = $('title').text().trim();
  const titleLength = pageTitle.length;
  if (!pageTitle) {
    checks.push({
      id: 'seo_title',
      category: 'seo',
      categoryName: 'SEO & Posicionamiento',
      title: 'Etiqueta Title (<title>)',
      status: 'fail',
      goal: 'Proveer un título claro y conciso para los motores de búsqueda y navegadores.',
      issue: 'La página no tiene ninguna etiqueta <title> definida en su sección <head>.',
      recommendedAction: 'Agrega una etiqueta <title> en el <head> de entre 45 y 60 caracteres que describa el servicio o empresa con su palabra clave principal.',
      prompt: `Actúa como especialista SEO y Frontend. Mi sitio web ${url} carece de la etiqueta <title>. Por favor redacta 3 opciones de títulos atractivos de entre 45 y 60 caracteres optimizados para posicionamiento orgánico, e indícame el código HTML exacto para pegarlo dentro del <head>.`,
      value: 'No encontrado'
    });
  } else if (titleLength < 25 || titleLength > 70) {
    checks.push({
      id: 'seo_title',
      category: 'seo',
      categoryName: 'SEO & Posicionamiento',
      title: 'Longitud del Title (<title>)',
      status: 'warning',
      goal: 'Mantener el título en el rango óptimo (30 a 65 caracteres) para evitar recortes en Google.',
      issue: `El título actual tiene ${titleLength} caracteres ("${pageTitle}"). ${titleLength < 25 ? 'Es demasiado corto y desaprovecha palabras clave.' : 'Es demasiado largo y se cortará en los resultados de búsqueda.'}`,
      recommendedAction: 'Ajusta la longitud del título entre 30 y 65 caracteres para máxima visibilidad en SERPs.',
      prompt: `Actúa como especialista SEO. El título de mi página ${url} mide ${titleLength} caracteres y dice: "${pageTitle}". Reescribe este título para que tenga exactamente entre 45 y 60 caracteres, manteniendo el mensaje de valor y la marca, y dame el código HTML listo para actualizar.`,
      value: `"${pageTitle}" (${titleLength} caracteres)`
    });
  } else {
    checks.push({
      id: 'seo_title',
      category: 'seo',
      categoryName: 'SEO & Posicionamiento',
      title: 'Etiqueta Title (<title>)',
      status: 'pass',
      goal: 'Título optimizado para motores de búsqueda.',
      issue: null,
      recommendedAction: 'Tu etiqueta <title> cumple con las dimensiones recomendadas.',
      prompt: null,
      value: `"${pageTitle}" (${titleLength} caracteres)`
    });
  }

  // 1.2 Meta Descripción
  const metaDesc = $('meta[name="description" i]').attr('content') || '';
  const descLength = metaDesc.trim().length;
  if (!metaDesc) {
    checks.push({
      id: 'seo_meta_desc',
      category: 'seo',
      categoryName: 'SEO & Posicionamiento',
      title: 'Meta Descripción (<meta name="description">)',
      status: 'fail',
      goal: 'Informar a los usuarios y a Google sobre el resumen de la página para aumentar el CTR.',
      issue: 'No se encontró la meta etiqueta de descripción en el código fuente.',
      recommendedAction: 'Agrega <meta name="description" content="..."> con un resumen persuasivo de 120 a 160 caracteres.',
      prompt: `Actúa como redactor publicitario y experto en SEO. Para mi sitio web ${url}, escribe una meta descripción persuasiva de entre 130 y 155 caracteres con llamado a la acción (CTA) y dame la línea de código HTML exacta para incluirla en el <head>.`,
      value: 'No encontrada'
    });
  } else if (descLength < 70 || descLength > 165) {
    checks.push({
      id: 'seo_meta_desc',
      category: 'seo',
      categoryName: 'SEO & Posicionamiento',
      title: 'Meta Descripción (<meta name="description">)',
      status: 'warning',
      goal: 'Mantener la descripción entre 120 y 160 caracteres.',
      issue: `La meta descripción mide ${descLength} caracteres. ${descLength < 70 ? 'Es demasiado breve para captar clics.' : 'Supera el límite visible en móviles y computadoras.'}`,
      recommendedAction: 'Optimiza la longitud para que quede entre 120 y 160 caracteres.',
      prompt: `Por favor optimiza la siguiente meta descripción de mi web ${url} para que tenga entre 130 y 155 caracteres exactos: "${metaDesc}". Debe ser atractiva e incluir una llamada a la acción.`,
      value: `"${metaDesc.substring(0, 70)}..." (${descLength} car.)`
    });
  } else {
    checks.push({
      id: 'seo_meta_desc',
      category: 'seo',
      categoryName: 'SEO & Posicionamiento',
      title: 'Meta Descripción (<meta name="description">)',
      status: 'pass',
      goal: 'Descripción persuasiva y optimizada.',
      issue: null,
      recommendedAction: 'La meta descripción tiene un tamaño ideal para los resultados de búsqueda.',
      prompt: null,
      value: `"${metaDesc.substring(0, 65)}..." (${descLength} car.)`
    });
  }

  // 1.3 Encabezados H1
  const h1Count = $('h1').length;
  const h1Text = $('h1').first().text().trim();
  if (h1Count === 0) {
    checks.push({
      id: 'seo_h1',
      category: 'seo',
      categoryName: 'SEO & Posicionamiento',
      title: 'Encabezado Principal (<h1>)',
      status: 'fail',
      goal: 'Definir el tema principal del documento HTML para jerarquía y accesibilidad.',
      issue: 'La página no cuenta con ninguna etiqueta <h1>.',
      recommendedAction: 'Incluye exactamente una etiqueta <h1> que describa la propuesta de valor principal de la página.',
      prompt: `Actúa como especialista SEO On-Page. Mi sitio web ${url} no tiene una etiqueta <h1> en su estructura HTML. Escribe un titular <h1> de alto impacto y enséñame cómo estructurarlo junto al Hero Section en HTML semántico.`,
      value: '0 etiquetas <h1>'
    });
  } else if (h1Count > 1) {
    checks.push({
      id: 'seo_h1',
      category: 'seo',
      categoryName: 'SEO & Posicionamiento',
      title: 'Jerarquía de Encabezados (<h1>)',
      status: 'warning',
      goal: 'Mantener un único <h1> por página para una arquitectura clara.',
      issue: `Se detectaron ${h1Count} etiquetas <h1>. Múltiples <h1> pueden diluir la relevancia temática.`,
      recommendedAction: 'Conserva solo 1 etiqueta <h1> principal y convierte las secundarias en <h2> o <h3>.',
      prompt: `Tengo ${h1Count} etiquetas <h1> en mi web ${url}. Explícame cómo reorganizar la jerarquía a un solo <h1> principal y convertir los otros en <h2> sin romper mis estilos CSS.`,
      value: `${h1Count} etiquetas <h1> encontradas`
    });
  } else {
    checks.push({
      id: 'seo_h1',
      category: 'seo',
      categoryName: 'SEO & Posicionamiento',
      title: 'Encabezado Principal (<h1>)',
      status: 'pass',
      goal: 'Jerarquía de encabezados limpia y semántica.',
      issue: null,
      recommendedAction: 'Estructura H1 única y correcta.',
      prompt: null,
      value: `1 etiqueta <h1>: "${h1Text.substring(0, 45)}..."`
    });
  }

  // 1.4 Enlace Canónico
  const canonical = $('link[rel="canonical"]').attr('href');
  if (!canonical) {
    checks.push({
      id: 'seo_canonical',
      category: 'seo',
      categoryName: 'SEO & Posicionamiento',
      title: 'URL Canónica (<link rel="canonical">)',
      status: 'warning',
      goal: 'Evitar problemas de contenido duplicado (ej. http vs https, www vs sin www).',
      issue: 'No se definió una etiqueta canónica explícita en el <head>.',
      recommendedAction: `Agrega <link rel="canonical" href="${url}"> en la cabecera.`,
      prompt: `Agrega la etiqueta canónica adecuada para mi web ${url} y explícame por qué es vital para evitar canibalización SEO y contenido duplicado. Dame el código exacto.`,
      value: 'No definida'
    });
  } else {
    checks.push({
      id: 'seo_canonical',
      category: 'seo',
      categoryName: 'SEO & Posicionamiento',
      title: 'URL Canónica (<link rel="canonical">)',
      status: 'pass',
      goal: 'Protección contra contenido duplicado.',
      issue: null,
      recommendedAction: 'Etiqueta canónica configurada correctamente.',
      prompt: null,
      value: canonical
    });
  }

  // 1.5 Idioma del Documento (<html lang="...">)
  const htmlLang = $('html').attr('lang');
  if (!htmlLang) {
    checks.push({
      id: 'seo_html_lang',
      category: 'seo',
      categoryName: 'SEO & Posicionamiento',
      title: 'Idioma del Documento (<html lang>)',
      status: 'fail',
      goal: 'Indicar a los buscadores y lectores de pantalla el idioma en que está redactada la página.',
      issue: 'La etiqueta <html> no tiene el atributo lang definido (ej. <html lang="es">).',
      recommendedAction: 'Agrega el atributo lang="es" (o el idioma principal de tu audiencia) en la etiqueta raíz <html>.',
      prompt: `En mi sitio web ${url}, la etiqueta raíz <html> carece del atributo "lang". Explícame por qué esto afecta el SEO internacional y los lectores de pantalla de accesibilidad, y dame la línea exacta de código para declarar el idioma español o el correspondiente.`,
      value: 'No declarado'
    });
  } else {
    checks.push({
      id: 'seo_html_lang',
      category: 'seo',
      categoryName: 'SEO & Posicionamiento',
      title: 'Idioma del Documento (<html lang>)',
      status: 'pass',
      goal: 'Accesibilidad y localización lingüística.',
      issue: null,
      recommendedAction: `Idioma correctamente declarado (${htmlLang}).`,
      prompt: null,
      value: `lang="${htmlLang}"`
    });
  }

  // 1.6 Accesibilidad & SEO de Imágenes (Atributos alt)
  const allImages = $('img');
  const totalImgCount = allImages.length;
  let imagesWithAlt = 0;
  allImages.each((_, img) => {
    const altText = $(img).attr('alt');
    if (altText && altText.trim().length > 0) {
      imagesWithAlt++;
    }
  });

  if (totalImgCount === 0) {
    checks.push({
      id: 'seo_img_alt',
      category: 'seo',
      categoryName: 'SEO & Posicionamiento',
      title: 'Texto Alternativo en Imágenes (alt)',
      status: 'pass',
      goal: 'Describir el contenido de las imágenes para personas con discapacidad visual y Google Images.',
      issue: null,
      recommendedAction: 'No se detectaron etiquetas <img> en la página analizada.',
      prompt: null,
      value: 'Sin imágenes estándar'
    });
  } else if (imagesWithAlt < totalImgCount) {
    const missingAltCount = totalImgCount - imagesWithAlt;
    const isSevere = missingAltCount > 3 || (imagesWithAlt === 0 && totalImgCount > 0);
    checks.push({
      id: 'seo_img_alt',
      category: 'seo',
      categoryName: 'SEO & Posicionamiento',
      title: 'Texto Alternativo en Imágenes (alt)',
      status: isSevere ? 'fail' : 'warning',
      goal: 'Describir el contenido gráfico para accesibilidad y posicionamiento en Google Images.',
      issue: `Se encontraron ${totalImgCount} imágenes y ${missingAltCount} de ellas no tienen atributo alt descriptivo.`,
      recommendedAction: 'Agrega un atributo alt descriptivo y relevante a cada imagen de tu página.',
      prompt: `Actúa como auditor de Accesibilidad Web (WCAG) y SEO. En mi web ${url} hay ${missingAltCount} imágenes sin la etiqueta alt descriptiva. Dame una guía de cómo redactar textos alternativos óptimos para SEO y dame un script en JavaScript para auditar en consola cuáles imágenes carecen de este atributo.`,
      value: `${imagesWithAlt} de ${totalImgCount} con alt`
    });
  } else {
    checks.push({
      id: 'seo_img_alt',
      category: 'seo',
      categoryName: 'SEO & Posicionamiento',
      title: 'Texto Alternativo en Imágenes (alt)',
      status: 'pass',
      goal: 'Accesibilidad visual y SEO gráfico.',
      issue: null,
      recommendedAction: 'Todas las imágenes cuentan con atributo alt descriptivo.',
      prompt: null,
      value: `${totalImgCount} imágenes optimizadas`
    });
  }

  // ==========================================
  // CATEGORÍA 2: IDENTIDAD, ASSETS & SOCIAL
  // ==========================================

  // 2.1 Favicon
  const favicon = $('link[rel="icon"], link[rel="shortcut icon"]').attr('href');
  if (!favicon) {
    checks.push({
      id: 'asset_favicon',
      category: 'identity',
      categoryName: 'Identidad & Social Media',
      title: 'Favicon del Sitio Web',
      status: 'fail',
      goal: 'Identificar la pestaña del navegador y dar apariencia profesional y de confianza.',
      issue: 'No se detectó etiqueta <link rel="icon"> en el código fuente.',
      recommendedAction: 'Crea un favicon en formato .svg o .png (mínimo 32x32px) y enlázalo en el <head>.',
      prompt: `Genera el código HTML completo y las mejores prácticas para vincular un favicon moderno (SVG para pantallas vectoriales y fallback PNG 32x32) en el <head> de mi página ${url}.`,
      value: 'No detectado en HTML'
    });
  } else {
    checks.push({
      id: 'asset_favicon',
      category: 'identity',
      categoryName: 'Identidad & Social Media',
      title: 'Favicon del Sitio Web',
      status: 'pass',
      goal: 'Branding visual en pestañas del navegador.',
      issue: null,
      recommendedAction: 'Favicon vinculado correctamente.',
      prompt: null,
      value: favicon
    });
  }

  // 2.2 Apple Touch Icon
  const appleIcon = $('link[rel="apple-touch-icon"]').attr('href');
  if (!appleIcon) {
    checks.push({
      id: 'asset_apple_icon',
      category: 'identity',
      categoryName: 'Identidad & Social Media',
      title: 'Ícono para Móviles (Apple Touch Icon)',
      status: 'warning',
      goal: 'Proveer un ícono nítido cuando un usuario agrega la web a la pantalla de inicio de su teléfono.',
      issue: 'Falta la etiqueta <link rel="apple-touch-icon"> de 180x180px.',
      recommendedAction: 'Agrega <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">.',
      prompt: `Por favor proporcióname la etiqueta HTML recomendada para el Apple Touch Icon de mi web ${url} y cuáles son las dimensiones y formatos exigidos por iOS y Android.`,
      value: 'Falta configurar'
    });
  } else {
    checks.push({
      id: 'asset_apple_icon',
      category: 'identity',
      categoryName: 'Identidad & Social Media',
      title: 'Ícono para Móviles (Apple Touch Icon)',
      status: 'pass',
      goal: 'Experiencia táctil y guardado en pantalla de inicio.',
      issue: null,
      recommendedAction: 'Icono móvil configurado.',
      prompt: null,
      value: appleIcon
    });
  }

  // 2.3 Open Graph (Redes Sociales)
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogImage = $('meta[property="og:image"]').attr('content');
  const ogDesc = $('meta[property="og:description"]').attr('content');
  if (!ogTitle || !ogImage) {
    checks.push({
      id: 'asset_opengraph',
      category: 'identity',
      categoryName: 'Identidad & Social Media',
      title: 'Open Graph (Previsualización WhatsApp/LinkedIn)',
      status: 'fail',
      goal: 'Mostrar tarjeta con imagen, título y resumen al compartir el enlace en WhatsApp, Facebook o LinkedIn.',
      issue: `Faltan meta etiquetas clave: ${!ogTitle ? 'og:title ' : ''}${!ogImage ? 'og:image ' : ''}${!ogDesc ? 'og:description' : ''}. El enlace se verá plano y sin imagen previa.`,
      recommendedAction: 'Configura las etiquetas Open Graph completas con una imagen atractiva de 1200x630 píxeles.',
      prompt: `Crea un bloque completo de meta etiquetas Open Graph (og:title, og:description, og:image, og:url, og:type) y Twitter Cards para mi web ${url}. La imagen recomendada debe ser 1200x630px. Proporcióname el código listo para copiar en mi <head>.`,
      value: !ogTitle ? 'Sin Open Graph' : 'Parcialmente incompleto'
    });
  } else {
    checks.push({
      id: 'asset_opengraph',
      category: 'identity',
      categoryName: 'Identidad & Social Media',
      title: 'Open Graph (Previsualización WhatsApp/LinkedIn)',
      status: 'pass',
      goal: 'Previsualización profesional en redes sociales.',
      issue: null,
      recommendedAction: 'Etiquetas sociales og:title y og:image configuradas.',
      prompt: null,
      value: 'Configurado con imagen y título'
    });
  }

  // 2.4 Analítica de Tráfico (Google Analytics 4 / GTM)
  const hasGa4 = /googletagmanager\.com\/gtag\/js|gtag\(|G-[a-zA-Z0-9]{5,}/i.test(rawHtml);
  const hasGtm = /googletagmanager\.com\/gtm\.js|GTM-[a-zA-Z0-9]{5,}/i.test(rawHtml);
  const hasAltAnalytics = /plausible\.io|umami\.is|simpleanalytics/i.test(rawHtml);
  const hasTrafficAnalytics = hasGa4 || hasGtm || hasAltAnalytics;
  if (!hasTrafficAnalytics) {
    checks.push({
      id: 'analytics_traffic',
      category: 'identity',
      categoryName: 'Identidad & Social Media',
      title: 'Analítica de Tráfico (Google Analytics 4 / GTM)',
      status: 'warning',
      goal: 'Medir el volumen de visitantes, canales de adquisición y páginas más visitadas.',
      issue: 'No se detectó ningún código de Google Analytics (GA4) o Google Tag Manager en la página.',
      recommendedAction: 'Instala la etiqueta de Google Analytics 4 (código G-XXXXX) en el <head> para medir tus visitas y conversiones.',
      prompt: `Actúa como analista web y especialista en marketing digital. Para mi sitio web ${url}, dame el código HTML estándar de Google Analytics 4 (gtag.js) listo para copiar en el <head>, y una guía paso a paso de cómo crear el flujo de datos en Google Analytics para obtener mi ID de medición (G-XXXXX).`,
      value: 'No detectado'
    });
  } else {
    const tagFound = hasGa4 ? 'Google Analytics 4 (GA4)' : hasGtm ? 'Google Tag Manager (GTM)' : 'Analítica de Privacidad';
    checks.push({
      id: 'analytics_traffic',
      category: 'identity',
      categoryName: 'Identidad & Social Media',
      title: 'Analítica de Tráfico (Google Analytics 4 / GTM)',
      status: 'pass',
      goal: 'Seguimiento de visitas y comportamiento general.',
      issue: null,
      recommendedAction: `Sistema de medición activo (${tagFound}).`,
      prompt: null,
      value: tagFound
    });
  }

  // 2.5 Grabación de Sesiones & Mapas de Calor (Microsoft Clarity)
  const hasClarity = /clarity\.ms\/tag\/|window\[["']clarity["']\]|\.clarity\s*=|clarity\.ms/i.test(rawHtml);
  if (!hasClarity) {
    checks.push({
      id: 'analytics_clarity',
      category: 'identity',
      categoryName: 'Identidad & Social Media',
      title: 'Grabación de Sesiones & Mapas de Calor (Microsoft Clarity)',
      status: 'warning',
      goal: 'Visualizar grabaciones de video reales y mapas de clics/scroll para entender qué hacen los usuarios.',
      issue: 'No se detectó la herramienta gratuita Microsoft Clarity ni software de mapas de calor.',
      recommendedAction: 'Integra Microsoft Clarity (100% gratuito) para identificar dónde se confunden o hacen clic tus clientes.',
      prompt: `Explícame cómo configurar e instalar gratis Microsoft Clarity (https://clarity.microsoft.com/) en mi sitio web ${url}. Proporcióname el fragmento de código JavaScript oficial para insertar en el <head> y cuáles son los 3 principales reportes que debo revisar para optimizar la tasa de conversión.`,
      value: 'No detectado'
    });
  } else {
    checks.push({
      id: 'analytics_clarity',
      category: 'identity',
      categoryName: 'Identidad & Social Media',
      title: 'Grabación de Sesiones & Mapas de Calor (Microsoft Clarity)',
      status: 'pass',
      goal: 'Optimización de conversión y análisis visual de comportamiento.',
      issue: null,
      recommendedAction: 'Microsoft Clarity activo para mapas de calor y grabaciones.',
      prompt: null,
      value: 'Clarity Detectado (Activo)'
    });
  }

  // 2.6 Píxeles de Conversión & Publicidad (Meta Pixel)
  const hasMetaPixel = /connect\.facebook\.net\/.*\/fbevents\.js|fbq\(['"]init/i.test(rawHtml);
  const hasOtherPixel = /analytics\.tiktok\.com|snap\.licdn\.com/i.test(rawHtml);
  const hasPixel = hasMetaPixel || hasOtherPixel;
  if (!hasPixel) {
    checks.push({
      id: 'analytics_pixel',
      category: 'identity',
      categoryName: 'Identidad & Social Media',
      title: 'Píxeles de Conversión & Anuncios (Meta Pixel)',
      status: 'warning',
      goal: 'Rastrear ventas y crear públicos de remarketing para campañas en Facebook, Instagram y redes.',
      issue: 'No se detectó Meta Pixel (Facebook Pixel) ni etiquetas de conversión publicitaria.',
      recommendedAction: 'Si realizas o planeas pauta digital, añade el código base de Meta Pixel para medir el retorno de inversión publicitaria.',
      prompt: `Genera el código HTML oficial de Meta Pixel (Facebook Pixel) para mi sitio web ${url}. Explícame dónde pegarlo en el <head> y cómo verificar con la extensión 'Meta Pixel Helper' que los eventos de visualización (PageView) y contacto se registren correctamente.`,
      value: 'Sin píxel publicitario'
    });
  } else {
    const pixelName = hasMetaPixel ? 'Meta Pixel (Facebook/Instagram)' : 'Píxel Publicitario';
    checks.push({
      id: 'analytics_pixel',
      category: 'identity',
      categoryName: 'Identidad & Social Media',
      title: 'Píxeles de Conversión & Anuncios (Meta Pixel)',
      status: 'pass',
      goal: 'Medición de retorno de inversión publicitaria y remarketing.',
      issue: null,
      recommendedAction: `Píxel activo para atribución publicitaria (${pixelName}).`,
      prompt: null,
      value: pixelName
    });
  }

  // ==========================================
  // CATEGORÍA 3: RASTREABILIDAD & INDEXACIÓN
  // ==========================================

  // 3.1 robots.txt
  if (!robotsResult.ok) {
    checks.push({
      id: 'index_robots',
      category: 'indexing',
      categoryName: 'Rastreabilidad & Robots',
      title: 'Archivo robots.txt',
      status: 'fail',
      goal: 'Indicar a los rastreadores qué carpetas y archivos pueden o no explorar.',
      issue: `El archivo ${origin}/robots.txt no existe o devolvió estado ${robotsResult.status}.`,
      recommendedAction: 'Crea un archivo robots.txt en la raíz del servidor permitiendo el rastreo y enlazando el sitemap.',
      prompt: `Crea un archivo robots.txt profesional para mi sitio web ${url}. Debe permitir el rastreo a buscadores estándar, enlazar mi sitemap.xml en ${origin}/sitemap.xml y bloquear carpetas administrativas o sensibles.`,
      value: `HTTP ${robotsResult.status}`
    });
  } else {
    const hasSitemapInRobots = /sitemap:\s*http/i.test(robotsResult.body);
    checks.push({
      id: 'index_robots',
      category: 'indexing',
      categoryName: 'Rastreabilidad & Robots',
      title: 'Archivo robots.txt',
      status: 'pass',
      goal: 'Control de rastreo para bots y buscadores.',
      issue: null,
      recommendedAction: `robots.txt activo.${hasSitemapInRobots ? ' Incluye referencia al Sitemap.' : ' (Consejo: agrega "Sitemap: ...").'}`,
      prompt: null,
      value: 'Detectado correctamente (200 OK)'
    });
  }

  // 3.2 sitemap.xml
  if (!sitemapResult.ok) {
    checks.push({
      id: 'index_sitemap',
      category: 'indexing',
      categoryName: 'Rastreabilidad & Robots',
      title: 'Mapa del Sitio (sitemap.xml)',
      status: 'fail',
      goal: 'Acelerar la indexación de todas las páginas de tu sitio web en Google y Bing.',
      issue: `No se pudo encontrar el mapa del sitio en ${origin}/sitemap.xml (HTTP ${sitemapResult.status}).`,
      recommendedAction: 'Genera un sitemap.xml con las URLs públicas de tu web y colócalo en la raíz del dominio.',
      prompt: `Explícame cómo generar un archivo sitemap.xml automatizado para mi sitio ${url}. Dame un ejemplo de estructura XML estándar con <urlset>, <url>, <loc>, <lastmod> y <changefreq> listo para subir a mi hosting.`,
      value: `No encontrado (HTTP ${sitemapResult.status})`
    });
  } else {
    checks.push({
      id: 'index_sitemap',
      category: 'indexing',
      categoryName: 'Rastreabilidad & Robots',
      title: 'Mapa del Sitio (sitemap.xml)',
      status: 'pass',
      goal: 'Facilidad de indexación en buscadores.',
      issue: null,
      recommendedAction: 'sitemap.xml disponible públicamente.',
      prompt: null,
      value: 'Detectado (200 OK)'
    });
  }

  // 3.3 Directiva NoIndex involuntaria
  const metaRobots = $('meta[name="robots" i]').attr('content') || '';
  if (/noindex/i.test(metaRobots)) {
    checks.push({
      id: 'index_noindex',
      category: 'indexing',
      categoryName: 'Rastreabilidad & Robots',
      title: 'Bloqueo de Indexación (noindex)',
      status: 'fail',
      goal: 'Permitir que los buscadores muestren la página a los usuarios.',
      issue: `¡Alerta! Tu página tiene <meta name="robots" content="${metaRobots}">. Esto prohíbe que Google y otros motores muestren tu web en sus resultados.`,
      recommendedAction: 'Retira la directiva "noindex" si deseas que tu sitio web sea encontrado en internet.',
      prompt: `¡Urgente! Mi sitio ${url} tiene la etiqueta meta robots configurada en noindex: "${metaRobots}". Explícame cómo eliminarla o cambiarla a "index, follow" para que los buscadores puedan indexar mi página inmediatamente.`,
      value: `Detectado: "${metaRobots}"`
    });
  } else {
    checks.push({
      id: 'index_noindex',
      category: 'indexing',
      categoryName: 'Rastreabilidad & Robots',
      title: 'Visibilidad en Buscadores (Indexable)',
      status: 'pass',
      goal: 'Página libre de bloqueos de indexación.',
      issue: null,
      recommendedAction: 'No hay etiquetas noindex bloqueando el tráfico.',
      prompt: null,
      value: 'Indexable (Permitido)'
    });
  }

  // 3.4 Página de Error 404 Personalizada
  const status404 = notFoundResult.status;
  const isCorrect404Code = status404 === 404;
  const body404 = (notFoundResult.body || '').toLowerCase();
  const isGenericServerDefault = /apache.*server|nginx\/|iis.*server/i.test(body404) && body404.length < 500;
  const hasHelpfulNavigation = body404.includes('inicio') || body404.includes('home') || body404.includes('href="/"') || body404.includes('buscar');

  if (status404 === 200) {
    checks.push({
      id: 'index_custom_404',
      category: 'indexing',
      categoryName: 'Rastreabilidad & Robots',
      title: 'Gestión de Enlaces Rotos (Error 404)',
      status: 'warning',
      goal: 'Devolver código de estado HTTP 404 ante rutas inexistentes para evitar "Soft 404".',
      issue: 'El servidor devuelve código HTTP 200 (éxito) ante URLs inexistentes. Esto genera un Soft 404 perjudicial para el rastreo de Google.',
      recommendedAction: 'Configura tu servidor web o framework para emitir el encabezado HTTP 404 Not Found ante páginas no encontradas.',
      prompt: `Mi sitio web ${url} responde con código HTTP 200 a rutas no existentes (Soft 404). Explícame cómo corregir esto para que devuelva un código 404 estricto en mi servidor (Apache, Nginx o Next.js/Express) y cómo diseñar una página 404 amigable.`,
      value: 'Soft 404 detectado (HTTP 200)'
    });
  } else if (!isCorrect404Code) {
    checks.push({
      id: 'index_custom_404',
      category: 'indexing',
      categoryName: 'Rastreabilidad & Robots',
      title: 'Página de Error 404',
      status: 'fail',
      goal: 'Manejar URLs incorrectas de forma limpia y controlada.',
      issue: `La ruta inexistente devolvió un estado inesperado: HTTP ${status404 || 'Fallo de conexión'}.`,
      recommendedAction: 'Configura el enrutamiento para atrapar rutas desconocidas y devolver un código 404.',
      prompt: `Explícame cómo configurar el manejo de errores 404 en ${url} para evitar códigos de fallo 500 o caídas y asegurar que siempre entregue una respuesta 404 limpia.`,
      value: `Estado: HTTP ${status404}`
    });
  } else if (isGenericServerDefault || !hasHelpfulNavigation) {
    checks.push({
      id: 'index_custom_404',
      category: 'indexing',
      categoryName: 'Rastreabilidad & Robots',
      title: 'Página de Error 404 Personalizada',
      status: 'warning',
      goal: 'Ofrecer una experiencia de rescate con la identidad de marca cuando un visitante llega a un enlace roto.',
      issue: 'El código 404 es correcto, pero la página mostrada parece ser la plantilla predeterminada y vacía del servidor sin enlaces de regreso.',
      recommendedAction: 'Crea una página 404 personalizada con el logo de tu empresa, mensaje amigable y un botón para volver a la página de inicio.',
      prompt: `Diseña una página de error 404 moderna y personalizada para mi web ${url}. Debe incluir un diseño responsive premium con HTML y CSS en línea, mensaje empático, botón de llamada a la acción para "Regresar al Inicio" y enlaces a soporte.`,
      value: '404 genérico sin navegación'
    });
  } else {
    checks.push({
      id: 'index_custom_404',
      category: 'indexing',
      categoryName: 'Rastreabilidad & Robots',
      title: 'Página de Error 404 Personalizada',
      status: 'pass',
      goal: 'Experiencia de rescate de usuario ante enlaces rotos.',
      issue: null,
      recommendedAction: 'Página 404 personalizada y con navegación detectada.',
      prompt: null,
      value: '404 personalizado activo'
    });
  }

  // 3.5 Enlaces Rotos (Broken Links / Error 404 Interno)
  if (linksAudit.brokenLinks.length > 0) {
    const listBroken = linksAudit.brokenLinks.map((b) => `${b.url} (${b.status})`).join(', ');
    checks.push({
      id: 'index_broken_links',
      category: 'indexing',
      categoryName: 'Rastreabilidad & Robots',
      title: 'Detección de Enlaces Rotos (Broken Links)',
      status: 'fail',
      goal: 'Garantizar que todos los hipervínculos de la página lleven a destinos activos y válidos.',
      issue: `Se detectaron ${linksAudit.brokenLinks.length} enlace(s) rotos que devuelven error: ${listBroken}. Esto deteriora la experiencia de usuario y el posicionamiento en Google.`,
      recommendedAction: 'Actualiza o elimina las etiquetas <a href="..."> que apuntan a páginas inexistentes o caídas.',
      prompt: `Actúa como especialista SEO y Desarrollador Web. En mi página ${url} se detectaron los siguientes enlaces rotos: ${listBroken}. Dame una estrategia para: 1) Corregir o sustituir los enlaces rotos en el código fuente, y 2) Configurar redirecciones 301 para usuarios que lleguen desde marcadores o enlaces antiguos.`,
      value: `¡${linksAudit.brokenLinks.length} enlace(s) roto(s)!`
    });
  } else {
    checks.push({
      id: 'index_broken_links',
      category: 'indexing',
      categoryName: 'Rastreabilidad & Robots',
      title: 'Detección de Enlaces Rotos (Broken Links)',
      status: 'pass',
      goal: 'Hipervínculos funcionales y sin callejones sin salida.',
      issue: null,
      recommendedAction: 'No se detectaron enlaces rotos en la página.',
      prompt: null,
      value: `${linksAudit.totalLinks} enlaces comprobados (0 rotos)`
    });
  }

  // 3.6 Seguridad en Enlaces Externos (rel="noopener noreferrer")
  if (linksAudit.insecureBlankLinks.length > 0) {
    checks.push({
      id: 'sec_external_links',
      category: 'indexing',
      categoryName: 'Rastreabilidad & Robots',
      title: 'Seguridad en Enlaces Externos (rel="noopener")',
      status: 'warning',
      goal: 'Prevenir vulnerabilidades de suplantación de pestaña (Reverse Tabnabbing) al abrir enlaces en pestañas nuevas.',
      issue: `Se encontraron ${linksAudit.insecureBlankLinks.length} enlace(s) con target="_blank" que carecen de rel="noopener noreferrer". La página enlazada podría manipular la pestaña de origen mediante window.opener.`,
      recommendedAction: 'Agrega rel="noopener noreferrer" a cada enlace que abra en una nueva ventana (target="_blank").',
      prompt: `Explícame qué es la vulnerabilidad 'Reverse Tabnabbing' en enlaces con target="_blank" en mi sitio ${url}. Dame el código HTML exacto para agregar rel="noopener noreferrer" a todos mis enlaces salientes y un script en JavaScript para aplicarlo automáticamente si uso un CMS o framework.`,
      value: `${linksAudit.insecureBlankLinks.length} enlace(s) sin rel="noopener"`
    });
  } else {
    checks.push({
      id: 'sec_external_links',
      category: 'indexing',
      categoryName: 'Rastreabilidad & Robots',
      title: 'Seguridad en Enlaces Externos (rel="noopener")',
      status: 'pass',
      goal: 'Navegación externa protegida contra phishing.',
      issue: null,
      recommendedAction: 'Todos los enlaces externos con target="_blank" están protegidos.',
      prompt: null,
      value: 'Enlaces externos seguros'
    });
  }

  // ==========================================
  // CATEGORÍA 4: RENDIMIENTO & SEGURIDAD
  // ==========================================

  // 4.1 HTTPS y SSL
  const isLocalhost = parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1';
  const isHttps = parsedUrl.protocol === 'https:' || isLocalhost;
  if (!isHttps) {
    checks.push({
      id: 'perf_https',
      category: 'performance',
      categoryName: 'Rendimiento & Seguridad',
      title: 'Cifrado de Seguridad (HTTPS/SSL)',
      status: 'fail',
      goal: 'Cifrar las conexiones de los usuarios y evitar advertencias de "Sitio no seguro".',
      issue: 'El sitio no utiliza el protocolo seguro HTTPS.',
      recommendedAction: 'Instala un certificado SSL (ej. gratuito con Let\'s Encrypt o Cloudflare) y fuerza la redirección de HTTP a HTTPS.',
      prompt: `¿Cómo instalo y configuro un certificado SSL gratuito (Let's Encrypt o Cloudflare) para mi web ${url} y cómo aplico una redirección 301 forzada de HTTP a HTTPS en Apache o Nginx?`,
      value: 'HTTP inseguro'
    });
  } else {
    checks.push({
      id: 'perf_https',
      category: 'performance',
      categoryName: 'Rendimiento & Seguridad',
      title: 'Cifrado de Seguridad (HTTPS/SSL)',
      status: 'pass',
      goal: 'Transmisión cifrada y confianza del navegador.',
      issue: null,
      recommendedAction: 'Certificado de seguridad HTTPS activo.',
      prompt: null,
      value: 'HTTPS Seguro'
    });
  }

  // 4.2 Vigencia y Emisor del Certificado SSL/TLS
  if (!sslCertResult.valid && !isLocalhost) {
    checks.push({
      id: 'sec_ssl_validity',
      category: 'performance',
      categoryName: 'Rendimiento & Seguridad',
      title: 'Vigencia y Emisor del Certificado SSL',
      status: 'fail',
      goal: 'Garantizar que el certificado sea legítimo, reconocido y válido para los navegadores.',
      issue: `Fallo de validación SSL: ${sslCertResult.error || 'Certificado inválido o no reconocido'}.`,
      recommendedAction: 'Instala o renueva el certificado SSL utilizando Let\'s Encrypt o Cloudflare SSL Universal.',
      prompt: `Actúa como especialista en seguridad web. Mi sitio ${url} presenta un error de certificado SSL: "${sslCertResult.error}". Explícame cómo reinstalar un certificado SSL gratuito y válido paso a paso en mi servidor o CDN.`,
      value: 'Error de certificado'
    });
  } else if (sslCertResult.daysRemaining <= 0 && !isLocalhost) {
    checks.push({
      id: 'sec_ssl_validity',
      category: 'performance',
      categoryName: 'Rendimiento & Seguridad',
      title: 'Vigencia del Certificado SSL (¡Caducado!)',
      status: 'fail',
      goal: 'Evitar que la web quede bloqueada por navegadores con pantalla roja de peligro.',
      issue: `¡PELIGRO! El certificado SSL ha expirado (${sslCertResult.validTo}). Todos los visitantes ven alertas de advertencia.`,
      recommendedAction: 'Renueva de inmediato el certificado SSL con Certbot o en el panel de tu hosting.',
      prompt: `¡URGENTE! El certificado SSL de ${url} ha expirado. Dame los comandos inmediatos en consola Linux (Certbot Let's Encrypt) para renovar el certificado SSL y reiniciar Apache/Nginx.`,
      value: `Caducado (${sslCertResult.validTo})`
    });
  } else if (sslCertResult.daysRemaining <= 30 && !isLocalhost) {
    checks.push({
      id: 'sec_ssl_validity',
      category: 'performance',
      categoryName: 'Rendimiento & Seguridad',
      title: 'Vigencia del Certificado SSL (Por vencer)',
      status: 'warning',
      goal: 'Renovar el certificado antes de que expire para no perder tráfico ni ventas.',
      issue: `El certificado SSL vence pronto: quedan solo ${sslCertResult.daysRemaining} días de vigencia (Vence: ${sslCertResult.validTo}).`,
      recommendedAction: 'Programa o ejecuta la renovación del certificado antes de la fecha límite.',
      prompt: `El certificado SSL de mi página ${url} vence en ${sslCertResult.daysRemaining} días (el ${sslCertResult.validTo}). ¿Cómo configuro un cron job automatizado en Linux con Certbot para que se renueve solo cada 60 días?`,
      value: `Vence en ${sslCertResult.daysRemaining} días (${sslCertResult.validTo})`
    });
  } else {
    checks.push({
      id: 'sec_ssl_validity',
      category: 'performance',
      categoryName: 'Rendimiento & Seguridad',
      title: 'Vigencia y Emisor del Certificado SSL',
      status: 'pass',
      goal: 'Certificado legítimo, vigente y con protocolo moderno.',
      issue: null,
      recommendedAction: `Certificado SSL activo y vigente (Emisor: ${sslCertResult.issuer}, vence: ${sslCertResult.validTo}).`,
      prompt: null,
      value: `Vigente (${sslCertResult.daysRemaining} días) • ${sslCertResult.issuer} (${sslCertResult.protocol})`
    });
  }

  // 4.2 Tiempo de respuesta del servidor (TTFB / Latencia)
  const responseTime = pageResult.duration;
  if (responseTime > 1500) {
    checks.push({
      id: 'perf_ttfb',
      category: 'performance',
      categoryName: 'Rendimiento & Seguridad',
      title: 'Tiempo de Respuesta del Servidor (TTFB)',
      status: 'warning',
      goal: 'Servir la página en menos de 800ms para evitar abandonos.',
      issue: `El servidor tardó ${responseTime}ms en responder. Esto puede empeorar el Core Web Vitals y la experiencia de usuario.`,
      recommendedAction: 'Implementa caché en servidor, optimiza tu hosting o utiliza un CDN como Cloudflare.',
      prompt: `El tiempo de respuesta inicial (TTFB) de mi sitio ${url} fue de ${responseTime}ms. Dame una lista priorizada de 4 optimizaciones de servidor y CDN para reducir este tiempo por debajo de 500ms.`,
      value: `${responseTime} ms (Lento)`
    });
  } else {
    checks.push({
      id: 'perf_ttfb',
      category: 'performance',
      categoryName: 'Rendimiento & Seguridad',
      title: 'Tiempo de Respuesta del Servidor (TTFB)',
      status: 'pass',
      goal: 'Respuesta veloz para retener visitantes.',
      issue: null,
      recommendedAction: `Excelente velocidad de respuesta (${responseTime}ms).`,
      prompt: null,
      value: `${responseTime} ms (Rápido)`
    });
  }

  // 4.3 Viewport Móvil
  const viewport = $('meta[name="viewport"]').attr('content');
  if (!viewport) {
    checks.push({
      id: 'perf_viewport',
      category: 'performance',
      categoryName: 'Rendimiento & Seguridad',
      title: 'Diseño Adaptativo Móvil (Viewport)',
      status: 'fail',
      goal: 'Asegurar que la web se adapte correctamente a pantallas de smartphones y tablets.',
      issue: 'Falta la etiqueta <meta name="viewport">.',
      recommendedAction: 'Agrega <meta name="viewport" content="width=device-width, initial-scale=1.0"> en tu <head>.',
      prompt: `Dame la etiqueta meta viewport estándar para colocar en el <head> de ${url} y explica brevemente cómo influye en la prueba de optimización para móviles de Google.`,
      value: 'No definida'
    });
  } else {
    checks.push({
      id: 'perf_viewport',
      category: 'performance',
      categoryName: 'Rendimiento & Seguridad',
      title: 'Diseño Adaptativo Móvil (Viewport)',
      status: 'pass',
      goal: 'Compatibilidad con dispositivos móviles.',
      issue: null,
      recommendedAction: 'Viewport responsive configurado.',
      prompt: null,
      value: viewport
    });
  }

  // 4.4 Consistencia de Dominio y Redirección HTTP -> HTTPS
  const httpRedirected = isLocalhost || httpRedirectResult.ok || (httpRedirectResult.status >= 300 && httpRedirectResult.status < 400);
  const finalIsHttps = isLocalhost || (httpRedirectResult.finalUrl && httpRedirectResult.finalUrl.startsWith('https://'));
  if (!httpRedirected || (!finalIsHttps && isHttps)) {
    checks.push({
      id: 'sec_domain_redirects',
      category: 'performance',
      categoryName: 'Rendimiento & Seguridad',
      title: 'Redirección Forzada a HTTPS',
      status: 'warning',
      goal: 'Forzar que cualquier usuario que escriba "http://" sea redirigido de inmediato a "https://".',
      issue: `El intento de conexión sin cifrar (http://${domain}/) no redirigió automáticamente a HTTPS.`,
      recommendedAction: 'Aplica una regla 301 permanente en tu servidor o CDN para forzar HTTPS en todo el tráfico.',
      prompt: `Escribe las reglas de redirección 301 obligatoria de HTTP a HTTPS para mi sitio ${url}. Dame la configuración tanto para el archivo .htaccess de Apache como para el bloque server {} de Nginx y Cloudflare Page Rules.`,
      value: 'Sin redirección 301 forzada'
    });
  } else {
    checks.push({
      id: 'sec_domain_redirects',
      category: 'performance',
      categoryName: 'Rendimiento & Seguridad',
      title: 'Redirección Forzada a HTTPS',
      status: 'pass',
      goal: 'Seguridad en tráfico y unificación de autoridad de dominio.',
      issue: null,
      recommendedAction: 'Redirección automática de HTTP a HTTPS activa.',
      prompt: null,
      value: 'Redirección segura activa'
    });
  }

  // 4.5 Cabeceras de Seguridad Avanzadas (HSTS, CSP, X-Frame-Options)
  const headers = pageResult.headers || {};
  let hasHsts = !!headers['strict-transport-security'] || isLocalhost;
  let hasXFrame = !!headers['x-frame-options'] || isLocalhost;
  let hasCsp = !!headers['content-security-policy'] || isLocalhost;
  let hasContentTypeOpt = !!headers['x-content-type-options'] || isLocalhost;

  const missingSecHeaders = [];
  if (!hasHsts) missingSecHeaders.push('HSTS');
  if (!hasXFrame) missingSecHeaders.push('X-Frame-Options');
  if (!hasCsp) missingSecHeaders.push('CSP');
  if (!hasContentTypeOpt) missingSecHeaders.push('X-Content-Type-Options');

  if (missingSecHeaders.length >= 3) {
    checks.push({
      id: 'sec_headers',
      category: 'performance',
      categoryName: 'Rendimiento & Seguridad',
      title: 'Cabeceras de Seguridad (HSTS / CSP / Clickjacking)',
      status: 'warning',
      goal: 'Proteger a los usuarios contra ataques de inyección (XSS), clickjacking y ataques Man-in-the-Middle.',
      issue: `Faltan cabeceras de seguridad fundamentales: ${missingSecHeaders.join(', ')}.`,
      recommendedAction: 'Configura las cabeceras HTTP de protección en tu servidor o proxy inverso (Cloudflare/Nginx).',
      prompt: `Actúa como especialista en Ciberseguridad Web. En mi sitio ${url} faltan las siguientes cabeceras: ${missingSecHeaders.join(', ')}. Por favor genera el código de configuración exacto para implementarlas con los valores recomendados por OWASP en mi servidor.`,
      value: `Faltan: ${missingSecHeaders.join(', ')}`
    });
  } else {
    checks.push({
      id: 'sec_headers',
      category: 'performance',
      categoryName: 'Rendimiento & Seguridad',
      title: 'Cabeceras de Seguridad (HSTS / CSP / Clickjacking)',
      status: 'pass',
      goal: 'Protección contra ciberataques comunes.',
      issue: null,
      recommendedAction: 'Cabeceras de protección activas en el servidor.',
      prompt: null,
      value: 'Cabeceras de seguridad detectadas'
    });
  }

  // 4.6 Compresión y Peso del Documento
  const contentEncoding = headers['content-encoding'] || '';
  const htmlLengthBytes = (pageResult.body || '').length;
  const htmlSizeKb = Math.round(htmlLengthBytes / 1024);
  const isCompressed = /gzip|br|deflate/i.test(contentEncoding);

  if (!isCompressed && htmlSizeKb > 120) {
    checks.push({
      id: 'perf_compression',
      category: 'performance',
      categoryName: 'Rendimiento & Seguridad',
      title: 'Compresión de Recursos (Gzip / Brotli)',
      status: 'warning',
      goal: 'Comprimir el HTML para acelerar la carga en redes móviles y ahorrar ancho de banda.',
      issue: `El archivo HTML pesa ${htmlSizeKb} KB y no se detectó compresión activa (Gzip o Brotli).`,
      recommendedAction: 'Habilita compresión Brotli (br) o Gzip en tu servidor web o CDN para reducir el peso hasta un 70%.',
      prompt: `¿Cómo habilito compresión Gzip y Brotli para los archivos HTML, CSS y JS de mi sitio web ${url}? Explícame cómo activarlo paso a paso en Cloudflare o en la configuración de mi servidor.`,
      value: `${htmlSizeKb} KB (Sin compresión)`
    });
  } else {
    checks.push({
      id: 'perf_compression',
      category: 'performance',
      categoryName: 'Rendimiento & Seguridad',
      title: 'Compresión de Recursos (Gzip / Brotli)',
      status: 'pass',
      goal: 'Transferencia rápida y ligera de datos.',
      issue: null,
      recommendedAction: `HTML optimizado (${htmlSizeKb} KB${contentEncoding ? `, formato: ${contentEncoding}` : ''}).`,
      prompt: null,
      value: `${htmlSizeKb} KB ${contentEncoding ? `(${contentEncoding})` : 'Óptimo'}`
    });
  }

  // 4.7 Optimización y Formato Moderno de Imágenes (WebP / Lazy Loading)
  let modernFormatCount = 0;
  let lazyLoadCount = 0;
  allImages.each((_, img) => {
    const src = ($(img).attr('src') || '').toLowerCase();
    if (src.endsWith('.webp') || src.endsWith('.avif') || src.endsWith('.svg')) {
      modernFormatCount++;
    }
    const loading = $(img).attr('loading');
    if (loading === 'lazy') {
      lazyLoadCount++;
    }
  });

  if (totalImgCount > 2 && modernFormatCount === 0) {
    checks.push({
      id: 'perf_img_optimization',
      category: 'performance',
      categoryName: 'Rendimiento & Seguridad',
      title: 'Formatos Modernos de Imágenes (WebP / AVIF)',
      status: 'warning',
      goal: 'Servir imágenes de alta compresión visual para reducir el tiempo de renderizado.',
      issue: `Se detectaron ${totalImgCount} imágenes y ninguna utiliza formatos modernos comprimidos (WebP o AVIF).`,
      recommendedAction: 'Convierte tus imágenes JPG/PNG a WebP o AVIF y utiliza el atributo loading="lazy" para diferir la carga.',
      prompt: `En mi página ${url} las imágenes usan formatos tradicionales (JPG/PNG). Explícame cuál es la forma más rápida de convertirlas a WebP o AVIF, cómo usar la etiqueta <picture> con fallback y cómo agregar loading="lazy" de forma masiva.`,
      value: `${totalImgCount} imágenes tradicionales (PNG/JPG)`
    });
  } else {
    checks.push({
      id: 'perf_img_optimization',
      category: 'performance',
      categoryName: 'Rendimiento & Seguridad',
      title: 'Formatos Modernos de Imágenes (WebP / AVIF)',
      status: 'pass',
      goal: 'Carga eficiente de recursos multimedia.',
      issue: null,
      recommendedAction: totalImgCount === 0 ? 'Sin imágenes pesadas.' : 'Imágenes optimizadas en formatos modernos.',
      prompt: null,
      value: `${modernFormatCount} de ${totalImgCount} en formatos modernos`
    });
  }

  // 4.8 Detección Defensiva de Secretos y Llaves API Expuestas
  const detectedSecrets = [];

  // Patrones defensivos de inspección de credenciales y API keys privadas
  if (/(?:sk-[a-zA-Z0-9_-]{20,}|sk-proj-[a-zA-Z0-9_-]{20,})/i.test(rawHtml)) {
    detectedSecrets.push('OpenAI Secret Key (sk-...)');
  }
  if (/sk_live_[0-9a-zA-Z]{20,}/i.test(rawHtml)) {
    detectedSecrets.push('Stripe Live Secret Key (sk_live_...)');
  }
  if (/AKIA[0-9A-Z]{16}/.test(rawHtml)) {
    detectedSecrets.push('AWS Access Key ID (AKIA...)');
  }
  if (/ghp_[a-zA-Z0-9]{30,}/i.test(rawHtml)) {
    detectedSecrets.push('GitHub Personal Access Token (ghp_...)');
  }
  if (/(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql):\/\/[^:\s]+:[^@\s]+@[^\s"']+/i.test(rawHtml)) {
    detectedSecrets.push('Cadena de Conexión de Base de Datos con contraseña (URI)');
  }
  if (/(?:DB_PASSWORD|DATABASE_PASSWORD|API_SECRET|PRIVATE_KEY)\s*[:=]\s*["'][^"'\s]{4,}["']/i.test(rawHtml)) {
    detectedSecrets.push('Variable de entorno confidencial hardcodeada en frontend');
  }

  if (detectedSecrets.length > 0) {
    checks.push({
      id: 'sec_exposed_secrets',
      category: 'performance',
      categoryName: 'Rendimiento & Seguridad',
      title: '¡Fuga de Secretos & Llaves Privadas!',
      status: 'fail',
      goal: 'Prevenir el robo de credenciales, hackeo de bases de datos o cargos no autorizados en cuentas de API.',
      issue: `¡PELIGRO CRÍTICO! Se detectaron patrones de credenciales privadas visibles en el código HTML público: ${detectedSecrets.join(', ')}. Cualquier atacante o bot malicioso puede extraerlas inspeccionando el código fuente.`,
      recommendedAction: '1. Revoca y elimina de inmediato esas llaves en sus respectivos paneles (OpenAI, Stripe, AWS). 2. Mueve todas las llamadas con llaves secretas y credenciales a un backend seguro y usa variables de entorno (.env). Nunca dejes llaves privadas en el frontend.',
      prompt: `¡ALERTA DE SEGURIDAD URGENTE! Mi sitio web ${url} expone accidentalmente en su frontend: ${detectedSecrets.join(', ')}. Dame un plan de acción paso a paso de emergencia para: 1) Revocar y rotar estas llaves ahora mismo, 2) Crear un endpoint backend seguro en Node.js/Express o Next.js API Routes para intermediar las peticiones, y 3) Ocultar todas las credenciales mediante un archivo .env en el servidor.`,
      value: `¡${detectedSecrets.length} secreto(s) detectado(s)!`
    });
  } else {
    checks.push({
      id: 'sec_exposed_secrets',
      category: 'performance',
      categoryName: 'Rendimiento & Seguridad',
      title: 'Protección de Llaves & Secretos API',
      status: 'pass',
      goal: 'Código limpio de credenciales privadas y contraseñas.',
      issue: null,
      recommendedAction: 'No se encontraron llaves API privadas ni cadenas de conexión expuestas en el código fuente.',
      prompt: null,
      value: 'Código público protegido'
    });
  }

  // ==========================================
  // CATEGORÍA 5: PREPARACIÓN PARA AGENTES DE IA
  // ==========================================

  // 5.1 llms.txt (Nuevo estándar para Agentes de IA)
  if (!llmsResult.ok) {
    checks.push({
      id: 'ai_llms_txt',
      category: 'ai_agents',
      categoryName: 'Preparación para Agentes de IA',
      title: 'Archivo de Contexto IA (llms.txt)',
      status: 'fail',
      goal: 'Proveer un resumen en Markdown limpio para que modelos como Claude, ChatGPT y Gemini entiendan tu sitio en segundos sin parsear código HTML pesado.',
      issue: `No se encontró el archivo ${origin}/llms.txt (HTTP ${llmsResult.status}).`,
      recommendedAction: 'Crea un archivo /llms.txt en la raíz con un resumen estructurado en Markdown de tus productos, servicios y documentación.',
      prompt: `Actúa como arquitecto de sistemas de Inteligencia Artificial. Para mi sitio web ${url}, escribe el contenido completo de un archivo "llms.txt" siguiendo el estándar oficial de llmstxt.org. Debe resumir mi negocio, los servicios clave y enlaces principales en Markdown limpio para agentes autónomos.`,
      value: 'Ausente (/llms.txt 404)'
    });
  } else {
    checks.push({
      id: 'ai_llms_txt',
      category: 'ai_agents',
      categoryName: 'Preparación para Agentes de IA',
      title: 'Archivo de Contexto IA (llms.txt)',
      status: 'pass',
      goal: 'Alimentar con contexto directo a agentes de lenguaje.',
      issue: null,
      recommendedAction: 'Tu sitio implementa el estándar emergente llms.txt.',
      prompt: null,
      value: 'Presente (200 OK)'
    });
  }

  // 5.2 Directivas de Bots de IA en robots.txt
  const robotsText = robotsResult.ok ? robotsResult.body : '';
  const mentionsAiBots = /GPTBot|ClaudeBot|PerplexityBot|Google-Extended|Applebot-Extended/i.test(robotsText);
  if (!mentionsAiBots) {
    checks.push({
      id: 'ai_bot_rules',
      category: 'ai_agents',
      categoryName: 'Preparación para Agentes de IA',
      title: 'Reglas para Bots de IA (GPTBot, ClaudeBot, etc.)',
      status: 'warning',
      goal: 'Definir explícitamente si autorizas o restringes que rastreadores de IA lean tu contenido para respuestas y resúmenes.',
      issue: 'Tu robots.txt no tiene directivas específicas para agentes de IA modernos (GPTBot, ClaudeBot, PerplexityBot).',
      recommendedAction: 'Declara directivas User-agent para los principales bots de IA en tu robots.txt permitiendo o restringiendo su acceso.',
      prompt: `Escribe las directivas recomendadas de robots.txt para gestionar el acceso de los bots de IA más populares (GPTBot de OpenAI, ClaudeBot de Anthropic, PerplexityBot y Google-Extended). Dame dos alternativas: una para permitirles citar mi negocio y otra para bloquearlos si prefiero privacidad.`,
      value: 'Sin mención explícita'
    });
  } else {
    checks.push({
      id: 'ai_bot_rules',
      category: 'ai_agents',
      categoryName: 'Preparación para Agentes de IA',
      title: 'Reglas para Bots de IA (GPTBot, ClaudeBot, etc.)',
      status: 'pass',
      goal: 'Políticas de IA claramente definidas.',
      issue: null,
      recommendedAction: 'Tu robots.txt incluye instrucciones para rastreadores de IA.',
      prompt: null,
      value: 'Directivas encontradas'
    });
  }

  // 5.3 Datos Estructurados JSON-LD / Schema.org
  const hasJsonLd = $('script[type="application/ld+json"]').length > 0;
  if (!hasJsonLd) {
    checks.push({
      id: 'ai_schema_jsonld',
      category: 'ai_agents',
      categoryName: 'Preparación para Agentes de IA',
      title: 'Datos Estructurados (Schema JSON-LD)',
      status: 'fail',
      goal: 'Permitir a los agentes y a los motores de búsqueda entender qué tipo de entidad eres (Organización, Empresa Local, Software, Producto).',
      issue: 'No se encontraron etiquetas <script type="application/ld+json"> en la página.',
      recommendedAction: 'Agrega un esquema JSON-LD (ej. Organization o LocalBusiness) con nombre, teléfono, logo y descripción.',
      prompt: `Actúa como especialista en datos estructurados y SEO semántico. Para mi web ${url}, genera un bloque de Schema.org en formato JSON-LD (tipo "Organization" o "LocalBusiness") con todos los campos esenciales (name, url, logo, contactPoint, sameAs). Dame el código listo para incluir en el <head>.`,
      value: 'No encontrado'
    });
  } else {
    checks.push({
      id: 'ai_schema_jsonld',
      category: 'ai_agents',
      categoryName: 'Preparación para Agentes de IA',
      title: 'Datos Estructurados (Schema JSON-LD)',
      status: 'pass',
      goal: 'Comprensión semántica de tu negocio.',
      issue: null,
      recommendedAction: 'Datos estructurados JSON-LD detectados.',
      prompt: null,
      value: 'Schema JSON-LD detectado'
    });
  }

  // ==========================================
  // CÁLCULO DE PUNTUACIÓN GLOBAL Y CATEGORÍAS
  // ==========================================
  let totalPoints = 0;
  let maxPoints = 0;

  const categories = {
    seo: { name: 'SEO & Posicionamiento', score: 0, total: 0, passed: 0 },
    identity: { name: 'Identidad & Social Media', score: 0, total: 0, passed: 0 },
    indexing: { name: 'Rastreabilidad & Robots', score: 0, total: 0, passed: 0 },
    performance: { name: 'Rendimiento & Seguridad', score: 0, total: 0, passed: 0 },
    ai_agents: { name: 'Preparación para Agentes IA', score: 0, total: 0, passed: 0 },
  };

  checks.forEach((chk) => {
    const weight = chk.status === 'fail' ? 0 : chk.status === 'warning' ? 0.5 : 1;
    totalPoints += weight;
    maxPoints += 1;

    if (categories[chk.category]) {
      categories[chk.category].total += 1;
      categories[chk.category].score += weight;
      if (chk.status === 'pass') {
        categories[chk.category].passed += 1;
      }
    }
  });

  const overallScore = Math.round((totalPoints / maxPoints) * 100);

  // Clasificación cualitativa
  let grade = 'Critico';
  let gradeBadge = 'Poor';
  let gradeColor = '#ef4444'; // rojo
  if (overallScore >= 85) {
    grade = 'Excelente';
    gradeBadge = 'Agent-Ready';
    gradeColor = '#10b981'; // verde
  } else if (overallScore >= 65) {
    grade = 'Aceptable';
    gradeBadge = 'Moderate';
    gradeColor = '#f59e0b'; // amarillo/naranja
  } else if (overallScore >= 40) {
    grade = 'Requiere Atención';
    gradeBadge = 'Needs Work';
    gradeColor = '#FF8A1E'; // naranja Aizprua
  }

  return {
    url,
    domain,
    scannedAt: new Date().toISOString(),
    overallScore,
    grade,
    gradeBadge,
    gradeColor,
    stats: {
      totalChecks: checks.length,
      passed: checks.filter((c) => c.status === 'pass').length,
      warnings: checks.filter((c) => c.status === 'warning').length,
      failed: checks.filter((c) => c.status === 'fail').length,
    },
    categories,
    checks,
  };
}

module.exports = {
  runAudit,
  checkSslCertificate,
  fetchUrl,
  auditPageLinks
};