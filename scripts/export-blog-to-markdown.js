/**
 * ============================================================================
 * EXPORTADOR Y SINCRONIZADOR EDITORIAL BLOG ↔ MARKDOWN (AIZPRUA S.E.)
 * ============================================================================
 * Extrae el contenido completo y limpio de los artículos HTML de la web y genera
 * documentos Markdown (.md) puros en la carpeta corporativa:
 * C:\Users\Arubel Aizprua\Downloads\Business\Aizprua S.E\4. Blog y Afiliaciones
 *
 * Ejecución:
 *   node scripts/export-blog-to-markdown.js
 *   npm run sync-blog
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const DEST_DIR = 'C:\\Users\\Arubel Aizprua\\Downloads\\Business\\Aizprua S.E\\4. Blog y Afiliaciones';
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const ARTICLES_CONFIG = [
    {
        htmlFile: 'articulo-emprender.html',
        mdFilename: '01_Como_empezar_a_emprender_en_Panama.md',
        defaultCategory: 'Emprendimiento & Formalización'
    },
    {
        htmlFile: 'articulo-mentalidad.html',
        mdFilename: '02_5_consejos_para_cambiar_nuestra_manera_de_pensar.md',
        defaultCategory: 'Mentalidad Empresarial'
    },
    {
        htmlFile: 'articulo-multas-panama.html',
        mdFilename: '03_Las_7_multas_ocultas_de_la_DGI_y_CSS_en_Panama.md',
        defaultCategory: 'Blindaje & Cumplimiento'
    },
    {
        htmlFile: 'articulo-credito-bancario.html',
        mdFilename: '04_Los_5_requisitos_reales_para_credito_comercial.md',
        defaultCategory: 'Finanzas & Bancarización'
    },
    {
        htmlFile: 'articulo-contratos-comerciales.html',
        mdFilename: '05_4_errores_fatales_al_firmar_contratos_comerciales.md',
        defaultCategory: 'Blindaje Legal & Contratos'
    }
];

function cleanText(text) {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
}

function convertHtmlToMarkdown(htmlPath, config) {
    const rawHtml = fs.readFileSync(htmlPath, 'utf8');
    const $ = cheerio.load(rawHtml);

    // Metadata básica
    const pageTitle = cleanText($('h1').first().text()) || cleanText($('title').text());
    const category = config.defaultCategory;
    const author = 'Arubel Aizprua';
    const edition = 'Edición Panamá 2026';

    let md = '';
    md += `# ${pageTitle}\n\n`;
    md += `**Categoría:** ${category}  \n`;
    md += `**Autor:** ${author} | Firma Legal y Empresarial Aizprua S.E.  \n`;
    md += `**Edición:** ${edition}  \n`;
    md += `**URL Oficial:** https://aizprua.com/${config.htmlFile.replace('.html', '')}\n\n`;
    md += `---\n\n`;

    // Localizar el artículo editorial principal
    const articleElem = $('article.prose, main article').first();
    if (articleElem.length === 0) {
        return md;
    }

    // Procesar cada tarjeta o bloque de contenido (.doc-card o hijos directos)
    const cards = articleElem.find('.doc-card');
    
    // Si hay doc-cards estructurados
    if (cards.length > 0) {
        cards.each((idx, cardEl) => {
            const card = $(cardEl);
            const cardId = card.attr('id') || '';

            // Manejo especial de Resumen Ejecutivo (TL;DR)
            if (cardId === 'resumen-ejecutivo' || card.text().includes('Resumen Ejecutivo')) {
                md += `## 📌 Resumen Ejecutivo (TL;DR)\n\n`;
                const points = card.find('.grid > div');
                if (points.length > 0) {
                    points.each((pIdx, pEl) => {
                        const point = $(pEl);
                        const pointTitle = cleanText(point.find('h3, h4, strong').first().text());
                        const pointDesc = cleanText(point.find('p').first().text());
                        if (pointTitle || pointDesc) {
                            md += `* **${pointTitle || `Punto ${pIdx + 1}`}:** ${pointDesc}\n`;
                        }
                    });
                    md += `\n---\n\n`;
                }
                return;
            }

            // Encabezado de la tarjeta (H2 / H3)
            const heading = card.find('h2, h3, h4').first();
            if (heading.length > 0) {
                const headingText = cleanText(heading.text());
                if (headingText && !headingText.toLowerCase().includes('contenido del artículo')) {
                    md += `## ${headingText}\n\n`;
                }
            }

            // Párrafos dentro de la tarjeta
            card.find('p').each((pIdx, pEl) => {
                const p = $(pEl);
                // Evitar párrafos que estén dentro de callouts o tablas ya procesados
                if (p.closest('.callout, table, details, .grid').length > 0) return;
                const pText = cleanText(p.text());
                if (pText && pText.length > 10 && !pText.includes('Por Arubel Aizprua')) {
                    md += `${pText}\n\n`;
                }
            });

            // Listas dentro de la tarjeta
            card.find('ul, ol').each((lIdx, lEl) => {
                const list = $(lEl);
                if (list.closest('table').length > 0) return;
                list.find('li').each((liIdx, liEl) => {
                    const liText = cleanText($(liEl).text());
                    if (liText) {
                        md += `* ${liText}\n`;
                    }
                });
                md += `\n`;
            });

            // Callouts destacados (alertas, principios legales, etc.)
            card.find('div.border-l-4, div.bg-orange-50\\/60, div.bg-blue-50, div.bg-amber-50, div.bg-red-50').each((cIdx, cEl) => {
                const callout = $(cEl);
                const calloutTitle = cleanText(callout.find('h3, h4, strong').first().text());
                const calloutText = cleanText(callout.find('p').text());
                if (calloutText || calloutTitle) {
                    md += `> [!NOTE]\n`;
                    if (calloutTitle) md += `> **${calloutTitle}**\n`;
                    md += `> ${calloutText || calloutTitle}\n\n`;
                }
            });

            // Tablas dentro de la tarjeta
            card.find('table').each((tIdx, tEl) => {
                const table = $(tEl);
                const headers = [];
                table.find('thead th, tr:first-child th, tr:first-child td').each((thIdx, thEl) => {
                    headers.push(cleanText($(thEl).text()));
                });
                if (headers.length > 0) {
                    md += `| ${headers.join(' | ')} |\n`;
                    md += `| ${headers.map(() => '---').join(' | ')} |\n`;

                    table.find('tbody tr, tr:gt(0)').each((rIdx, rEl) => {
                        const cells = [];
                        $(rEl).find('td').each((cIdx, cEl) => {
                            cells.push(cleanText($(cEl).text()));
                        });
                        if (cells.length > 0) {
                            md += `| ${cells.join(' | ')} |\n`;
                        }
                    });
                    md += `\n`;
                }
            });

            // Preguntas frecuentes (FAQ)
            card.find('details').each((dIdx, dEl) => {
                const details = $(dEl);
                const question = cleanText(details.find('summary').text());
                const answer = cleanText(details.find('p, div').not('summary').text());
                if (question && answer) {
                    md += `### ❓ ${question}\n\n${answer}\n\n`;
                }
            });
        });
    }

    // Limpieza final de espacios y saltos de línea
    md = md.replace(/\n{3,}/g, '\n\n').trim() + '\n';
    return md;
}

function syncAllArticles() {
    console.log('📚 Iniciando exportación de artículos del blog a Markdown...');

    if (!fs.existsSync(DEST_DIR)) {
        console.log(`📁 Creando directorio destino: ${DEST_DIR}`);
        fs.mkdirSync(DEST_DIR, { recursive: true });
    }

    let exportedCount = 0;

    for (const article of ARTICLES_CONFIG) {
        const htmlPath = path.join(PUBLIC_DIR, article.htmlFile);
        if (!fs.existsSync(htmlPath)) {
            console.warn(`⚠️ Archivo no encontrado: ${htmlPath}`);
            continue;
        }

        const mdContent = convertHtmlToMarkdown(htmlPath, article);
        const destPath = path.join(DEST_DIR, article.mdFilename);

        fs.writeFileSync(destPath, mdContent, 'utf8');
        console.log(`✅ [${article.htmlFile}] → [${article.mdFilename}] (${mdContent.length} caracteres)`);
        exportedCount++;
    }

    console.log(`\n🎉 Exportación completada con éxito: ${exportedCount} artículos convertidos.`);
    console.log(`📁 Destino: ${DEST_DIR}\n`);
}

if (require.main === module) {
    syncAllArticles();
}

module.exports = { syncAllArticles, convertHtmlToMarkdown };
