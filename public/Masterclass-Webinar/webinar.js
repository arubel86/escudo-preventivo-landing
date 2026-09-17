/**
 * ============================================================
 * AIZPRUA S.E. — MASTERCLASS / WEBINAR (ESCUDO PREVENTIVO)
 * ============================================================
 * Lógica del embudo de alta conversión:
 * - Detección y selector internacional de WhatsApp
 * - Validación anti-errores (Levenshtein para dominios de correo)
 * - Envío asíncrono al Webhook de Google Sheets
 * - Generador de enlaces dinámicos para Google Calendar
 * - Persistencia de datos del asistente para Thank You Pages
 */

const WEBINAR_CONFIG = {
    titulo: 'Cómo blindar tu negocio en Panamá contra multas y demandas',
    fechaTexto: 'Jueves 24 de Septiembre, 2026',
    horaTexto: '7:00 PM (Hora de Panamá / Bogotá)',
    fechaISOInicio: '20260924T190000',
    fechaISOFin: '20260924T203000',
    expositor: 'Aizprua S.E. — Firma de Trámites Legales & Blindaje',
    
    // Webhook real de Google Apps Script (Sheets + MailerLite)
    webhook: 'https://script.google.com/macros/s/AKfycbymJiNqZ2uXepyPrr0S-Pn1NH_1f75VuCHA6bi5TYshWxDS7DQgat8Qv3TAx20_yPJ5/exec',
    
    // Enlaces del evento (provisionales editables)
    enlaces: {
        zoom: 'https://zoom.us/j/98765432100?pwd=escudopreventivo',
        whatsappGrupo: 'https://chat.whatsapp.com/FicticioEscudoPreventivoVIP',
        soporteWhatsApp: 'https://wa.me/50765461527?text=Hola%20Aizprua%20S.E.%2C%20tengo%20una%20consulta%20sobre%20la%20Masterclass'
    },
    
    // Wistia Media Hashed ID (reemplazar con el ID de Wistia cuando esté listo)
    wistiaId: 'abc123demo'
};

// ============================================================
// MÓDULO DE VALIDACIÓN Y BLINDAJE DE DATOS (Anti-Errores)
// ============================================================
const Validador = {
    calcularLevenshtein(a, b) {
        if (!a || !b) return (a || b).length;
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    },

    validarNombre(nombre) {
        if (!nombre || typeof nombre !== 'string') return { valido: false, error: 'Por favor, ingresa tu nombre completo.' };
        const limpio = nombre.trim();
        if (limpio.length < 2) return { valido: false, error: 'El nombre es demasiado corto.' };
        if (limpio.length > 80) return { valido: false, error: 'El nombre no debe superar 80 caracteres.' };
        const partes = limpio.split(/\s+/);
        if (partes.length < 2) return { valido: false, error: 'Por favor, escribe al menos tu nombre y apellido.' };
        return { valido: true, nombreLimpio: limpio };
    },

    validarEmail(email) {
        if (!email || typeof email !== 'string') return { valido: false, error: 'Por favor, ingresa tu correo electrónico.' };
        const limpio = email.trim().toLowerCase();
        const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!regexEmail.test(limpio)) return { valido: false, error: 'Ingresa un formato de correo válido (ej: nombre@empresa.com).' };
        
        // Detección de errores comunes de tipeo
        const partes = limpio.split('@');
        if (partes.length === 2) {
            const dominio = partes[1];
            const dominiosComunes = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com'];
            for (const d of dominiosComunes) {
                const dist = this.calcularLevenshtein(dominio, d);
                if (dist > 0 && dist <= 2 && dominio !== d) {
                    return { valido: false, error: `¿Quisiste escribir @${d}? Corrige tu correo antes de continuar.` };
                }
            }
        }
        return { valido: true, emailLimpio: limpio };
    },

    validarTelefono(telefono, codigoPais = '+507') {
        if (!telefono || typeof telefono !== 'string') return { valido: false, error: 'Por favor, ingresa tu número de WhatsApp.' };
        const soloDigitos = telefono.replace(/\D/g, '');
        if (soloDigitos.length < 7 || soloDigitos.length > 15) {
            return { valido: false, error: 'El número de WhatsApp no parece ser válido.' };
        }
        return {
            valido: true,
            telefonoFormateado: `${codigoPais} ${soloDigitos}`
        };
    }
};

// ============================================================
// SELECTOR DE PAÍS Y AUTO-DETECCIÓN
// ============================================================
function initCountryPicker() {
    const container = document.querySelector('.country-picker-container');
    if (!container) return;

    const btn = container.querySelector('.country-picker-btn');
    const dropdown = container.querySelector('.country-dropdown');
    const hiddenInput = container.querySelector('input[name="country_code"]');
    const valSpan = container.querySelector('.country-code-val');

    if (!btn || !dropdown) return;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
    });

    dropdown.querySelectorAll('.country-item').forEach(item => {
        item.addEventListener('click', () => {
            const code = item.getAttribute('data-code');
            if (code && valSpan && hiddenInput) {
                valSpan.textContent = code;
                hiddenInput.value = code;
            }
            dropdown.classList.add('hidden');
        });
    });

    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });

    // Auto-detección por IP
    if (location.protocol !== 'file:') {
        fetch('https://ipapi.co/json/')
            .then(r => r.json())
            .then(d => {
                if (!d || !d.country_code) return;
                const map = {
                    'PA': '+507', 'CO': '+57', 'US': '+1', 'CR': '+506',
                    'MX': '+52', 'ES': '+34', 'VE': '+58', 'EC': '+593',
                    'PE': '+51', 'AR': '+54', 'CL': '+56', 'GT': '+502'
                };
                const pref = map[d.country_code];
                if (pref && hiddenInput && valSpan) {
                    hiddenInput.value = pref;
                    valSpan.textContent = pref;
                }
            })
            .catch(() => {});
    }
}

// ============================================================
// ENVÍO DE LEADS A GOOGLE SHEETS
// ============================================================
async function enviarLeadWebinar(datos) {
    if (!WEBINAR_CONFIG.webhook) return;
    
    // Evitar fórmulas automáticas de Excel con el signo +
    if (datos.telefono && typeof datos.telefono === 'string' && datos.telefono.startsWith('+')) {
        datos.telefono = "'" + datos.telefono;
    }

    try {
        await fetch(WEBINAR_CONFIG.webhook, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(datos)
        });
    } catch (err) {
        console.warn('Registro enviado con fallback offline:', err);
    }
}

// ============================================================
// GESTOR DE FORMULARIO DE REGISTRO
// ============================================================
function initWebinarForm(perfil) {
    const form = document.getElementById('webinar-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const inputNombre = form.querySelector('[name="name"]');
        const inputEmail = form.querySelector('[name="email"]');
        const inputTel = form.querySelector('[name="phone"]') || form.querySelector('[name="whatsapp"]');
        const inputCargo = form.querySelector('[name="company_role"]');
        const rawCodigo = form.querySelector('[name="country_code"]')?.value || '+507';
        const submitBtn = form.querySelector('button[type="submit"]');

        const errorEl = document.getElementById('form-error-msg');
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.add('hidden');
        }

        // Validaciones
        const resNombre = Validador.validarNombre(inputNombre?.value);
        if (!resNombre.valido) return mostrarError(resNombre.error, inputNombre);

        const resEmail = Validador.validarEmail(inputEmail?.value);
        if (!resEmail.valido) return mostrarError(resEmail.error, inputEmail);

        const resTel = Validador.validarTelefono(inputTel?.value, rawCodigo);
        if (!resTel.valido) return mostrarError(resTel.error, inputTel);

        // Estado visual de carga
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Asegurando tu cupo...
            `;
        }

        const payload = {
            sheet_id: 2, // ID de pestaña para Webinar
            tipo: 'webinar',
            formulario: `masterclass-${perfil}`,
            nombre: resNombre.nombreLimpio,
            email: resEmail.emailLimpio,
            telefono: resTel.telefonoFormateado,
            origen: `Masterclass: Escudo Preventivo 2026 (${perfil})`,
            detalles: `Perfil: ${perfil} | Detalle/Empresa: ${inputCargo?.value || 'No especificado'}`
        };

        // Guardar para personalizar página de gracias
        try {
            sessionStorage.setItem('webinar_lead', JSON.stringify({
                nombre: resNombre.nombreLimpio,
                email: resEmail.emailLimpio,
                telefono: resTel.telefonoFormateado,
                perfil: perfil
            }));
        } catch (e) {}

        // Enviar al webhook
        await enviarLeadWebinar(payload);

        // Redirigir a página de gracias correspondiente
        const targetPage = perfil === 'empresa' ? '/masterclass/gracias-empresa' : '/masterclass/gracias-profesional';
        window.location.href = targetPage;
    });

    function mostrarError(mensaje, inputTarget) {
        const errorEl = document.getElementById('form-error-msg');
        if (errorEl) {
            errorEl.textContent = mensaje;
            errorEl.classList.remove('hidden');
        }
        if (inputTarget) {
            inputTarget.focus();
            inputTarget.classList.add('border-red-500', 'ring-1', 'ring-red-500');
            setTimeout(() => {
                inputTarget.classList.remove('border-red-500', 'ring-1', 'ring-red-500');
            }, 3000);
        }
    }
}

// ============================================================
// GENERADOR DE GOOGLE CALENDAR
// ============================================================
function getGoogleCalendarUrl() {
    const title = encodeURIComponent('Masterclass: Cómo blindar tu negocio en Panamá (Aizprua S.E.)');
    const details = encodeURIComponent('Sesión en vivo de 90 minutos con Aizprua S.E. para blindar contratos, nómina y patrimonio contra multas y demandas.\n\nAcceso a Zoom: ' + WEBINAR_CONFIG.enlaces.zoom);
    const location = encodeURIComponent('Zoom (En vivo)');
    const dates = `${WEBINAR_CONFIG.fechaISOInicio}/${WEBINAR_CONFIG.fechaISOFin}`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

// ============================================================
// INICIALIZACIÓN GENERAL EN DOM
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // Activar íconos Lucide con reintentos para evitar condiciones de carrera con el CDN en móvil
    function initLucideSafe() {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
            return true;
        }
        return false;
    }
    if (!initLucideSafe()) {
        const lucideTimer = setInterval(() => {
            if (initLucideSafe()) clearInterval(lucideTimer);
        }, 100);
        setTimeout(() => clearInterval(lucideTimer), 3000);
    }

    // Inicializar selector de país si existe
    initCountryPicker();

    // Personalización en Thank You Pages
    const userNameDisplay = document.getElementById('attendee-name');
    if (userNameDisplay) {
        try {
            const lead = JSON.parse(sessionStorage.getItem('webinar_lead') || '{}');
            if (lead.nombre) {
                const primerNombre = lead.nombre.split(' ')[0];
                userNameDisplay.textContent = primerNombre ? `, ${primerNombre}` : '';
            }
        } catch (e) {}
    }

    // Configurar enlaces en Thank You Pages
    const zoomBtn = document.getElementById('btn-zoom-access');
    if (zoomBtn) {
        zoomBtn.href = WEBINAR_CONFIG.enlaces.zoom;
    }

    const whatsappBtn = document.getElementById('btn-whatsapp-group');
    if (whatsappBtn) {
        whatsappBtn.href = WEBINAR_CONFIG.enlaces.whatsappGrupo;
    }

    const gcalBtn = document.getElementById('btn-google-calendar');
    if (gcalBtn) {
        gcalBtn.href = getGoogleCalendarUrl();
    }
});
