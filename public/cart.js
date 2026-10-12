/**
 * ============================================================================
 * AIZPRUA S.E. - Carrito de Compras Deslizante Multi-Producto (Slide-Over Cart)
 * ============================================================================
 * - Gestión de estado en LocalStorage
 * - Panel lateral derecho responsivo (Desktop & Móvil)
 * - Miniaturas compactas anti-descuadre (56x56 px)
 * - Barra superior dinámica de aumento de ticket (Solo Texto & Upsell 1-Clic)
 * - Mensaje emotivo de carrito vacío
 * - Generador de pedidos consolidados a WhatsApp (+507 6546-1527)
 */

const AIZPRUA_CART_STORAGE_KEY = 'aizprua_store_cart_v1';
const WHATSAPP_PHONE = '50765461527';

// Diccionario de variantes activas para productos configurables (suéter, taza)
window.selectedProductColors = window.selectedProductColors || {
    'sueter-metodo-4e': 'azul',
    'taza-metodo-4e': 'azul'
};

// Obtener carrito guardado
function getCart() {
    try {
        const stored = localStorage.getItem(AIZPRUA_CART_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Error leyendo carrito de localStorage:', e);
        return [];
    }
}

// Guardar carrito
function saveCart(cart) {
    try {
        localStorage.setItem(AIZPRUA_CART_STORAGE_KEY, JSON.stringify(cart));
        updateCartBadges();
    } catch (e) {
        console.error('Error guardando carrito:', e);
    }
}

// Añadir producto al carrito
function addToCart(productId) {
    if (typeof AIZPRUA_PRODUCTS === 'undefined') {
        console.error('Catálogo AIZPRUA_PRODUCTS no disponible');
        return;
    }

    const product = AIZPRUA_PRODUCTS.find(p => p.id === productId);
    if (!product || product.price === 0) return;

    let cart = getCart();

    // Determinar variante de color si aplica
    let variant = null;
    let itemImage = product.image;
    let cartItemId = product.id;

    if (product.colorImages) {
        const color = window.selectedProductColors[productId] || 'azul';
        variant = `Color: ${color.charAt(0).toUpperCase() + color.slice(1)}`;
        cartItemId = `${product.id}-${color}`;
        itemImage = (color === 'azul') ? product.colorImages.azul : product.colorImages.negro;
    }

    const existingIndex = cart.findIndex(item => item.cartItemId === cartItemId);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            cartItemId: cartItemId,
            productId: product.id,
            title: product.title,
            price: product.price,
            priceDisplay: product.priceDisplay,
            image: itemImage,
            delivery: product.delivery, // 'physical' | 'digital'
            variant: variant,
            quantity: 1
        });
    }

    saveCart(cart);
    renderCart();
    openCartDrawer();
    showToastFeedback(`"${product.title}" añadido al carrito`);
}

// Cambiar cantidad (+ o -)
function updateCartQuantity(cartItemId, delta) {
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.cartItemId === cartItemId);
    if (itemIndex === -1) return;

    cart[itemIndex].quantity += delta;
    if (cart[itemIndex].quantity <= 0) {
        cart.splice(itemIndex, 1);
    }

    saveCart(cart);
    renderCart();
}

// Eliminar producto
function removeFromCart(cartItemId) {
    let cart = getCart();
    cart = cart.filter(item => item.cartItemId !== cartItemId);
    saveCart(cart);
    renderCart();
}

// Vaciar carrito
function clearCart() {
    saveCart([]);
    renderCart();
}

// Calcular totales
function getCartTotals() {
    const cart = getCart();
    let totalItems = 0;
    let subtotal = 0;
    let hasPhysical = false;
    let hasDigital = false;

    cart.forEach(item => {
        totalItems += item.quantity;
        subtotal += (item.price * item.quantity);
        if (item.delivery === 'physical') hasPhysical = true;
        if (item.delivery === 'digital') hasDigital = true;
    });

    return {
        totalItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        hasPhysical,
        hasDigital
    };
}

// Actualizar contadores del Navbar y botón flotante móvil
function updateCartBadges() {
    const { totalItems } = getCartTotals();
    const desktopBadge = document.getElementById('cart-count-badge');
    const mobileBadge = document.getElementById('mobile-cart-count-badge');
    const mobileFloatingBtn = document.getElementById('mobile-floating-cart-btn');

    if (desktopBadge) {
        desktopBadge.textContent = totalItems;
        if (totalItems > 0) {
            desktopBadge.classList.remove('hidden');
        } else {
            desktopBadge.classList.add('hidden');
        }
    }

    if (mobileBadge) {
        mobileBadge.textContent = totalItems;
        if (totalItems > 0) {
            mobileBadge.classList.remove('hidden');
        } else {
            mobileBadge.classList.add('hidden');
        }
    }

    if (mobileFloatingBtn) {
        if (totalItems > 0) {
            mobileFloatingBtn.classList.remove('hidden');
        } else {
            mobileFloatingBtn.classList.add('hidden');
        }
    }
}

// Abrir Panel Lateral
function openCartDrawer() {
    const backdrop = document.getElementById('cart-drawer-backdrop');
    const panel = document.getElementById('cart-drawer-panel');
    if (!backdrop || !panel) return;

    renderCart();

    backdrop.classList.remove('pointer-events-none');
    backdrop.classList.remove('opacity-0');
    backdrop.classList.add('opacity-100');

    panel.classList.remove('translate-x-full');
    panel.classList.add('translate-x-0');

    document.body.classList.add('overflow-hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Cerrar Panel Lateral
function closeCartDrawer() {
    const backdrop = document.getElementById('cart-drawer-backdrop');
    const panel = document.getElementById('cart-drawer-panel');
    if (!backdrop || !panel) return;

    backdrop.classList.add('pointer-events-none');
    backdrop.classList.remove('opacity-100');
    backdrop.classList.add('opacity-0');

    panel.classList.remove('translate-x-0');
    panel.classList.add('translate-x-full');

    document.body.classList.remove('overflow-hidden');
}

// Obtener contenido de la Barra Dinámica Superior (Solo Texto y Upsell 1-Clic)
function getDynamicCartBannerHTML(cart, totals) {
    if (cart.length === 0) return '';

    const hasPhysical = totals.hasPhysical;
    const hasDigital = totals.hasDigital;
    const ids = cart.map(i => i.productId);

    // Caso A: Si tiene producto físico (Plan Físico o Suéter)
    if (hasPhysical) {
        const hasCup = ids.includes('taza-metodo-4e') || ids.includes('taza-plan-360');
        const hasHoodie = ids.includes('sueter-metodo-4e');

        if (totals.totalItems === 1) {
            // Solo 1 artículo físico en el carrito
            if (!hasCup) {
                return `
                    <div class="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-orange-200/80 p-3 sm:p-3.5 text-slate-800">
                        <div class="flex items-start gap-2.5">
                            <div class="w-6 h-6 rounded-lg bg-brand-orange/15 text-brand-orange flex items-center justify-center shrink-0 mt-0.5">
                                <i data-lucide="truck" class="w-3.5 h-3.5"></i>
                            </div>
                            <div class="flex-1 text-xs leading-relaxed">
                                <span class="font-bold text-slate-900 block">Agrega 1 artículo más y obtén Envío Gratis en Panamá.</span>
                                <div class="mt-1.5 flex items-center gap-2">
                                    <button type="button" onclick="addToCart('taza-metodo-4e')" 
                                        class="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-lg font-black text-[11px] shadow-xs transition active:scale-95 cursor-pointer">
                                        <span>+ Agregar Taza Oficial ($14)</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else if (!hasHoodie) {
                return `
                    <div class="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-orange-200/80 p-3 sm:p-3.5 text-slate-800">
                        <div class="flex items-start gap-2.5">
                            <div class="w-6 h-6 rounded-lg bg-brand-blue/15 text-brand-blue flex items-center justify-center shrink-0 mt-0.5">
                                <i data-lucide="truck" class="w-3.5 h-3.5"></i>
                            </div>
                            <div class="flex-1 text-xs leading-relaxed">
                                <span class="font-bold text-slate-900 block">Completa tu kit con el Suéter Oficial Método 4E:</span>
                                <div class="mt-1.5 flex items-center gap-2">
                                    <button type="button" onclick="addToCart('sueter-metodo-4e')" 
                                        class="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg font-black text-[11px] shadow-xs transition active:scale-95 cursor-pointer">
                                        <span>+ Agregar Suéter ($38)</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        // Si ya tiene más de 1 artículo físico
        return `
            <div class="bg-emerald-50 border-b border-emerald-200/80 p-2.5 sm:p-3 text-emerald-900">
                <div class="flex items-center gap-2 text-xs">
                    <div class="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
                    </div>
                    <span class="font-bold">¡Tu pedido califica para Envío Coordinado Prioritario en Panamá!</span>
                </div>
            </div>
        `;
    }

    // Caso B: Si solo tiene productos digitales
    if (hasDigital) {
        const hasPlanDigital = ids.includes('plan-360-digital');
        const hasKitProblemas = ids.includes('kit-resolucion-problemas');

        // Contratos
        const contractIds = ['pack-servicios-profesionales', 'pack-tiempo-indefinido', 'pack-tiempo-definido', 'pack-obra-determinada'];
        const hasAnyContract = contractIds.some(cId => ids.includes(cId));
        const hasSuperPack = ids.includes('super-pack-laboral');

        // Finanzas
        const hasFinCore = ids.includes('fincore');
        const hasFinPulse = ids.includes('finpulse');

        // B.1: Si tiene Plan 360 Digital y no el Kit de Resolución de Problemas
        if (hasPlanDigital && !hasKitProblemas) {
            return `
                <div class="bg-blue-50/90 border-b border-blue-200/80 p-3 sm:p-3.5 text-slate-800">
                    <div class="flex items-start gap-2.5">
                        <div class="w-6 h-6 rounded-lg bg-brand-blue/15 text-brand-blue flex items-center justify-center shrink-0 mt-0.5">
                            <i data-lucide="lightbulb" class="w-3.5 h-3.5"></i>
                        </div>
                        <div class="flex-1 text-xs leading-relaxed">
                            <span class="font-bold text-brand-blue-dark block">Recomendación de Blindaje:</span>
                            <span>Suma el Kit de Resolución de Problemas para blindar acuerdos, socios y clientes.</span>
                            <div class="mt-1.5 flex items-center gap-2">
                                <button type="button" onclick="addToCart('kit-resolucion-problemas')" 
                                    class="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg font-black text-[11px] shadow-xs transition active:scale-95 cursor-pointer">
                                    <span>+ Agregar Kit ($16.99)</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // B.2: Si tiene Kit de Problemas y no Plan 360 Digital
        if (hasKitProblemas && !hasPlanDigital) {
            return `
                <div class="bg-blue-50/90 border-b border-blue-200/80 p-3 sm:p-3.5 text-slate-800">
                    <div class="flex items-start gap-2.5">
                        <div class="w-6 h-6 rounded-lg bg-brand-orange/15 text-brand-orange flex items-center justify-center shrink-0 mt-0.5">
                            <i data-lucide="lightbulb" class="w-3.5 h-3.5"></i>
                        </div>
                        <div class="flex-1 text-xs leading-relaxed">
                            <span class="font-bold text-brand-blue-dark block">Añade el Plan 360 Digital:</span>
                            <span>La suite interactiva de estructuración estratégica y legal de tu empresa.</span>
                            <div class="mt-1.5 flex items-center gap-2">
                                <button type="button" onclick="addToCart('plan-360-digital')" 
                                    class="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-lg font-black text-[11px] shadow-xs transition active:scale-95 cursor-pointer">
                                    <span>+ Agregar Plan 360 ($24.99)</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // B.3: Si tiene un pack de contratos y no el Super Pack Laboral
        if (hasAnyContract && !hasSuperPack) {
            if (ids.includes('pack-servicios-profesionales') && !ids.includes('pack-tiempo-indefinido')) {
                return `
                    <div class="bg-blue-50/90 border-b border-blue-200/80 p-3 sm:p-3.5 text-slate-800">
                        <div class="flex items-start gap-2.5">
                            <div class="w-6 h-6 rounded-lg bg-brand-blue/15 text-brand-blue flex items-center justify-center shrink-0 mt-0.5">
                                <i data-lucide="scale" class="w-3.5 h-3.5"></i>
                            </div>
                            <div class="flex-1 text-xs leading-relaxed">
                                <span class="font-bold text-brand-blue-dark block">Pack Complementario:</span>
                                <span>Completa tu contratación con el Pack Laboral de Tiempo Indefinido.</span>
                                <div class="mt-1.5 flex items-center gap-2">
                                    <button type="button" onclick="addToCart('pack-tiempo-indefinido')" 
                                        class="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg font-black text-[11px] shadow-xs transition active:scale-95 cursor-pointer">
                                        <span>+ Agregar Pack Indefinido ($97)</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="bg-blue-50/90 border-b border-blue-200/80 p-3 sm:p-3.5 text-slate-800">
                        <div class="flex items-start gap-2.5">
                            <div class="w-6 h-6 rounded-lg bg-brand-blue/15 text-brand-blue flex items-center justify-center shrink-0 mt-0.5">
                                <i data-lucide="scale" class="w-3.5 h-3.5"></i>
                            </div>
                            <div class="flex-1 text-xs leading-relaxed">
                                <span class="font-bold text-brand-blue-dark block">Pack Complementario:</span>
                                <span>Suma el Pack de Contratación por Servicios Profesionales (Sin subordinación).</span>
                                <div class="mt-1.5 flex items-center gap-2">
                                    <button type="button" onclick="addToCart('pack-servicios-profesionales')" 
                                        class="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg font-black text-[11px] shadow-xs transition active:scale-95 cursor-pointer">
                                        <span>+ Agregar Servicios Prof. ($97)</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        // B.4: Si tiene FinCore y no FinPulse
        if (hasFinCore && !hasFinPulse) {
            return `
                <div class="bg-blue-50/90 border-b border-blue-200/80 p-3 sm:p-3.5 text-slate-800">
                    <div class="flex items-start gap-2.5">
                        <div class="w-6 h-6 rounded-lg bg-brand-blue/15 text-brand-blue flex items-center justify-center shrink-0 mt-0.5">
                            <i data-lucide="bar-chart-3" class="w-3.5 h-3.5"></i>
                        </div>
                        <div class="flex-1 text-xs leading-relaxed">
                            <span class="font-bold text-brand-blue-dark block">Complemento Financiero:</span>
                            <span>Separa tus finanzas del negocio de las personales con FinPulse.</span>
                            <div class="mt-1.5 flex items-center gap-2">
                                <button type="button" onclick="addToCart('finpulse')" 
                                    class="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg font-black text-[11px] shadow-xs transition active:scale-95 cursor-pointer">
                                    <span>+ Agregar FinPulse ($24.99)</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // B.5: Si tiene FinPulse y no FinCore
        if (hasFinPulse && !hasFinCore) {
            return `
                <div class="bg-blue-50/90 border-b border-blue-200/80 p-3 sm:p-3.5 text-slate-800">
                    <div class="flex items-start gap-2.5">
                        <div class="w-6 h-6 rounded-lg bg-brand-blue/15 text-brand-blue flex items-center justify-center shrink-0 mt-0.5">
                            <i data-lucide="bar-chart-3" class="w-3.5 h-3.5"></i>
                        </div>
                        <div class="flex-1 text-xs leading-relaxed">
                            <span class="font-bold text-brand-blue-dark block">Complemento Financiero:</span>
                            <span>Suma FinCore para controlar flujos, costos y punto de equilibrio de tu empresa.</span>
                            <div class="mt-1.5 flex items-center gap-2">
                                <button type="button" onclick="addToCart('fincore')" 
                                    class="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg font-black text-[11px] shadow-xs transition active:scale-95 cursor-pointer">
                                    <span>+ Agregar FinCore ($34.99)</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Si ya tiene una combinación completa
        return `
            <div class="bg-emerald-50 border-b border-emerald-200/80 p-2.5 sm:p-3 text-emerald-900">
                <div class="flex items-center gap-2 text-xs">
                    <div class="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <i data-lucide="zap" class="w-3.5 h-3.5"></i>
                    </div>
                    <span class="font-bold">Descarga Digital Inmediata garantizada al confirmar tu pago.</span>
                </div>
            </div>
        `;
    }

    return '';
}

// Generar enlace estructurado para WhatsApp
function generateCartWhatsAppURL() {
    const cart = getCart();
    const totals = getCartTotals();
    if (cart.length === 0) return '#';

    let message = 'Hola Aizprua S.E., deseo realizar el siguiente pedido en la tienda online:\n\n';

    cart.forEach(item => {
        const variantText = item.variant ? ` (${item.variant})` : '';
        const itemTotal = (item.price * item.quantity).toFixed(2);
        message += `• ${item.quantity}x ${item.title}${variantText} - $${itemTotal} USD\n`;
    });

    message += `\n----------------------------\n`;
    message += `Total a Pagar: $${totals.subtotal.toFixed(2)} USD\n`;

    if (totals.hasPhysical) {
        message += `\nDirección / Provincia para entrega en Panamá:\n[Escribe aquí tu ciudad o dirección]\n`;
    }

    message += `\n¿Cuáles son los métodos de pago disponibles (Yappy / Banco General / Tarjeta)?`;

    const encoded = encodeURIComponent(message);
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encoded}`;
}

// Renderizar todo el contenido del Carrito
function renderCart() {
    const container = document.getElementById('cart-items-container');
    const dynamicBanner = document.getElementById('cart-dynamic-banner');
    const emptyState = document.getElementById('cart-empty-state');
    const footerArea = document.getElementById('cart-footer-area');
    const itemsCountEl = document.getElementById('cart-items-count');
    const subtotalEl = document.getElementById('cart-subtotal-val');
    const deliveryNoticeEl = document.getElementById('cart-delivery-notice');
    const whatsappBtn = document.getElementById('cart-whatsapp-checkout-btn');

    const cart = getCart();
    const totals = getCartTotals();

    updateCartBadges();

    if (itemsCountEl) {
        itemsCountEl.textContent = `${totals.totalItems} ${totals.totalItems === 1 ? 'artículo' : 'artículos'}`;
    }

    // Estado vacío
    if (cart.length === 0) {
        if (dynamicBanner) dynamicBanner.innerHTML = '';
        if (container) container.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        if (footerArea) footerArea.classList.add('hidden');
        return;
    }

    // Carrito con productos
    if (emptyState) emptyState.classList.add('hidden');
    if (footerArea) footerArea.classList.remove('hidden');

    // Renderizar Banner Dinámico
    if (dynamicBanner) {
        dynamicBanner.innerHTML = getDynamicCartBannerHTML(cart, totals);
    }

    // Renderizar Lista de Productos
    if (container) {
        container.innerHTML = cart.map(item => {
            const itemTotal = (item.price * item.quantity).toFixed(2);
            const variantHTML = item.variant 
                ? `<span class="text-[11px] font-bold text-brand-blue block mt-0.5">${item.variant}</span>` 
                : '';
            const deliveryPill = item.delivery === 'physical'
                ? `<span class="inline-flex items-center gap-1 text-[10px] font-black uppercase text-brand-orange bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/50"><i data-lucide="package" class="w-3 h-3 shrink-0"></i> Físico</span>`
                : `<span class="inline-flex items-center gap-1 text-[10px] font-black uppercase text-brand-blue bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/50"><i data-lucide="zap" class="w-3 h-3 shrink-0"></i> Digital</span>`;

            // Miniatura panorámica 4:3 nativa de catálogo (72x54 px) para encaje exacto
            const imageHTML = item.image 
                ? `<img src="${item.image}" alt="${item.title}" onerror="this.onerror=null; this.src='assets/aizprua-shield-og.jpg';" class="w-full h-full object-cover">`
                : `<div class="w-full h-full bg-slate-900 flex items-center justify-center text-brand-orange font-bold text-xs"><i data-lucide="package" class="w-5 h-5"></i></div>`;

            return `
                <div class="flex items-start gap-3 p-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition">
                    <!-- Miniatura Panorámica 4:3 (72x54 px) Encaje 100% Borde a Borde -->
                    <div class="w-[72px] h-[54px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 flex items-center justify-center">
                        ${imageHTML}
                    </div>

                    <!-- Datos y Controles -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between gap-2">
                            <div>
                                <h4 class="text-xs font-black text-slate-900 leading-snug truncate max-w-[175px] sm:max-w-[200px]">${item.title}</h4>
                                ${variantHTML}
                            </div>
                            <button type="button" onclick="removeFromCart('${item.cartItemId}')" aria-label="Eliminar ${item.title}"
                                class="text-slate-400 hover:text-red-500 transition p-1 shrink-0 cursor-pointer">
                                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                            </button>
                        </div>

                        <div class="flex items-center justify-between mt-2.5">
                            <!-- Selector Compacto de Cantidad -->
                            <div class="inline-flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200/70">
                                <button type="button" onclick="updateCartQuantity('${item.cartItemId}', -1)" aria-label="Restar 1"
                                    class="w-6 h-6 rounded-md bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer">
                                    -
                                </button>
                                <span class="text-xs font-black text-slate-800 w-4 text-center">${item.quantity}</span>
                                <button type="button" onclick="updateCartQuantity('${item.cartItemId}', 1)" aria-label="Sumar 1"
                                    class="w-6 h-6 rounded-md bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer">
                                    +
                                </button>
                            </div>

                            <!-- Precio del Item -->
                            <div class="text-right">
                                <span class="text-xs font-black text-slate-900">$${itemTotal}</span>
                                <span class="text-[10px] font-bold text-slate-500">USD</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Actualizar Subtotal
    if (subtotalEl) {
        subtotalEl.textContent = `$${totals.subtotal.toFixed(2)}`;
    }

    // Aviso de Entrega en el footer con iconos vectoriales SVG
    if (deliveryNoticeEl) {
        if (totals.hasPhysical) {
            deliveryNoticeEl.innerHTML = `
                <div class="flex items-center gap-2 text-[11px] font-bold text-amber-900 bg-amber-50/90 p-2.5 rounded-xl border border-amber-200/70">
                    <i data-lucide="truck" class="w-4 h-4 text-amber-700 shrink-0"></i>
                    <span>Incluye productos físicos con entrega coordinada en Panamá.</span>
                </div>
            `;
        } else {
            deliveryNoticeEl.innerHTML = `
                <div class="flex items-center gap-2 text-[11px] font-bold text-emerald-900 bg-emerald-50/90 p-2.5 rounded-xl border border-emerald-200/70">
                    <i data-lucide="zap" class="w-4 h-4 text-emerald-600 shrink-0"></i>
                    <span>Entrega digital inmediata tras confirmar tu pago.</span>
                </div>
            `;
        }
    }

    // Actualizar Botón de WhatsApp
    if (whatsappBtn) {
        whatsappBtn.href = generateCartWhatsAppURL();
        const btnTextEl = whatsappBtn.querySelector('.cart-checkout-btn-text');
        if (btnTextEl) {
            btnTextEl.textContent = `Pedir por WhatsApp ($${totals.subtotal.toFixed(2)} USD)`;
        }
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Notificación Toast flotante
function showToastFeedback(message) {
    let toast = document.getElementById('cart-toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cart-toast-notification';
        toast.className = 'fixed top-24 right-5 z-[120] bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 transform transition-all duration-300 opacity-0 translate-y-2 pointer-events-none';
        document.body.appendChild(toast);
    }

    toast.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>${message}</span>
    `;

    toast.classList.remove('opacity-0', 'translate-y-2', 'pointer-events-none');
    toast.classList.add('opacity-100', 'translate-y-0');

    setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', 'translate-y-2', 'pointer-events-none');
    }, 2400);
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadges();
    renderCart();
});
