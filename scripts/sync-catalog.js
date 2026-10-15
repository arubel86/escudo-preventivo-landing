/**
 * ============================================================================
 * SINCRONIZADOR DE CATÁLOGO TIENDA ONLINE ↔ CSV DEL CRM (AIZPRUA S.E.)
 * ============================================================================
 * Script oficial para garantizar la "Única Fuente de Verdad" (Single Source of Truth).
 * Lee el catálogo maestro de products-data.js y genera de forma automática y
 * matemática el archivo public/assets/modelo-catalogo.csv para importación al CRM.
 *
 * Ejecución:
 *   node scripts/sync-catalog.js
 *   npm run sync-catalog
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const PRODUCTS_DATA_PATH = path.join(__dirname, '..', 'public', 'products-data.js');
const CSV_OUTPUT_PATH = path.join(__dirname, '..', 'public', 'assets', 'modelo-catalogo.csv');

function escapeCsvField(val) {
    if (val === null || val === undefined) return '';
    const str = String(val).trim();
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

function syncCatalogToCsv() {
    console.log('🔄 Iniciando sincronización de catálogo...');

    if (!fs.existsSync(PRODUCTS_DATA_PATH)) {
        console.error(`❌ Error: No se encontró el archivo de datos en ${PRODUCTS_DATA_PATH}`);
        process.exit(1);
    }

    // Cargar AIZPRUA_PRODUCTS
    const { AIZPRUA_PRODUCTS } = require(PRODUCTS_DATA_PATH);

    if (!Array.isArray(AIZPRUA_PRODUCTS)) {
        console.error('❌ Error: AIZPRUA_PRODUCTS no es un arreglo válido.');
        process.exit(1);
    }

    const headers = ['codigo', 'nome', 'marca', 'categoria', 'preco', 'custo', 'estoque'];
    const rows = [headers.join(',')];
    let totalItems = 0;

    AIZPRUA_PRODUCTS.forEach(product => {
        const brand = 'Aizprua S.E.';
        const category = product.crmCategory || 'Soluciones';
        const price = Number(product.price || 0).toFixed(2);
        const cost = Number(product.cost || 0).toFixed(2);

        // Si el producto tiene variantes específicas de CRM (ej. tazas o hoodies por color)
        if (Array.isArray(product.crmVariants) && product.crmVariants.length > 0) {
            product.crmVariants.forEach(variant => {
                const varCost = Number(variant.cost !== undefined ? variant.cost : product.cost || 0).toFixed(2);
                const varStock = variant.stock !== undefined ? variant.stock : product.stock || 0;
                const row = [
                    escapeCsvField(variant.sku),
                    escapeCsvField(variant.name),
                    escapeCsvField(brand),
                    escapeCsvField(category),
                    price,
                    varCost,
                    varStock
                ];
                rows.push(row.join(','));
                totalItems++;
            });
        } else {
            // Producto estándar único
            const sku = product.sku || product.id.toUpperCase();
            const stock = product.stock !== undefined ? product.stock : (product.delivery === 'free' || product.delivery === 'digital' ? 999 : 10);
            const row = [
                escapeCsvField(sku),
                escapeCsvField(product.title),
                escapeCsvField(brand),
                escapeCsvField(category),
                price,
                cost,
                stock
            ];
            rows.push(row.join(','));
            totalItems++;
        }
    });

    const csvContent = rows.join('\n') + '\n';

    // Escribir archivo CSV
    fs.writeFileSync(CSV_OUTPUT_PATH, csvContent, 'utf8');

    console.log(`✅ Catálogo sincronizado con éxito!`);
    console.log(`📦 Total de productos/variantes exportados: ${totalItems}`);
    console.log(`📄 Archivo actualizado: ${CSV_OUTPUT_PATH}`);
}

if (require.main === module) {
    syncCatalogToCsv();
}

module.exports = { syncCatalogToCsv };
