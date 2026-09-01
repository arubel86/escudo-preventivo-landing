// ============================================================
// Aizprua S.E. — Embudo "Escudo Preventivo" v3.0 (3 páginas)
// Página A (index.html)            → Cuestionario dinámico
// Página B (escudo-preventivo.html)→ Video (gate 80%) + Oferta $79
// Página C (recursos-gratuitos.html)→ Lead Magnet (Guía Preventiva 2026)
// gracias.html                     → Hub post-pago (Calendly mar/jue)
// ============================================================
// BLOQUE CONFIG — editar aquí todo lo que cambia con el tiempo
// ============================================================
const CONFIG = {
    // Cupos semanales (el número baja según el día y se reinicia cada lunes)
    cuposSemanales: 4,
    cuposPorDia: { 0: 4, 1: 4, 2: 3, 3: 3, 4: 2, 5: 1, 6: 1 },

    // VIDEO DEL EMBUDO REAL:
    // https://youtu.be/INnV3KF1soI
    youtubeId: 'INnV3KF1soI',  // ← ID real de tu video en YouTube
    umbralVideo: 0.80,      // 80% visto para desbloquear la oferta

    enlaces: {
        webhook: 'https://script.google.com/macros/s/AKfycbymJiNqZ2uXepyPrr0S-Pn1NH_1f75VuCHA6bi5TYshWxDS7DQgat8Qv3TAx20_yPJ5/exec', // Webhook de Google Apps Script (Sheets + MailerLite)
        // Pasarela de pago automática (Hotmart / mPOS). Debe estar configurada
        // en la pasarela la redirección automática a gracias.html tras el pago.
        pago: 'https://secure.mposglobal.com/mailpos/#/MPREQ-V0buJaOU-XWICI68IRNME',
        whatsapp: 'https://wa.me/50765461527',
        paginaVideo: '/escudo-preventivo',       // Página B limpia sin .html
        paginaRecursos: 'recursos-gratuitos.html', // Página C
        gracias: 'gracias.html'
    },

    // Social Proof Toast
    toastMensajes: [
        'María de Panamá Oeste agendó su <strong>Diagnóstico Escudo Preventivo</strong>',
        'Carlos de La Chorrera completó su <strong>diagnóstico de 40 min</strong>',
        'Ana de Ciudad de Panamá detectó <strong>2 riesgos de multa</strong> a tiempo',
        'José de Panamá Oeste recibió su <strong>hoja de ruta legal</strong>',
        'Sofía de Arraiján agendó su <strong>Diagnóstico Escudo Preventivo</strong>',
        'Luis de Colón regularizó su <strong>Aviso de Operación</strong>'
    ],
    toastDelayInicial: 4000,    // 4 segundos antes del primer toast
    toastDuracion: 5000,        // 5 segundos visible
    toastMaxPorSesion: 3,       // Máximo 3 notificaciones por visita

    // Exit-Intent (solo Página A): en móvil no hay "mouse fuera", hay respaldo por tiempo/scroll
    exitIntent: { segundosEnPagina: 45, scrollPorcentaje: 70 }
};

// ============================================================
// MÁQUINA DE ESTADOS (persistencia del embudo)
// ============================================================
const STATE_KEY = 'ep_state';           // estado general del embudo
const VIDEO_KEY = 'ep_video_progress';  // progreso del video (Página B)
const PERFIL_KEY = 'ep_perfil';         // handoff del quiz A → B (sessionStorage)

function loadState() {
    try {
        return Object.assign(
            { quiz: null, videoVisto: false, contactoEnviado: false, pagado: false, entidad: null, estado: null, urgencia: null, nombre: '', email: '' },
            JSON.parse(localStorage.getItem(STATE_KEY) || '{}')
        );
    } catch { return { quiz: null, videoVisto: false, contactoEnviado: false, pagado: false }; }
}
function saveState(patch) {
    const current = loadState();
    localStorage.setItem(STATE_KEY, JSON.stringify(Object.assign(current, patch)));
}
let state = loadState();

function loadVideoProgress() {
    try {
        return Object.assign({ t: 0, unlocked: false }, JSON.parse(localStorage.getItem(VIDEO_KEY) || '{}'));
    } catch { return { t: 0, unlocked: false }; }
}
function saveVideoProgress(patch) {
    const current = loadVideoProgress();
    localStorage.setItem(VIDEO_KEY, JSON.stringify(Object.assign(current, patch)));
}

function savePerfil(perfil) {
    try { sessionStorage.setItem(PERFIL_KEY, JSON.stringify(perfil)); } catch { }
}
function readPerfil() {
    // Prioridad: URL params → sessionStorage → estado guardado
    const params = new URLSearchParams(location.search);
    let perfil = null;
    try { perfil = JSON.parse(sessionStorage.getItem(PERFIL_KEY) || 'null'); } catch { }
    return {
        entidad: params.get('e') || perfil?.entidad || state.entidad || null,
        estado: params.get('s') || perfil?.estado || state.estado || null,
        urgencia: params.get('u') || perfil?.urgencia || state.urgencia || null,
        motivo: perfil?.motivo || null
    };
}

function redirectTo(page, params) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    window.location.href = page + qs;
}

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    const pageStart = Date.now();
    let quizStarted = false; // evita que el exit-popup tape el cuestionario en uso

    // ============================================================
    // CUPOS AUTO-ACTUALIZABLES
    // ============================================================
    const cuposHoy = CONFIG.cuposPorDia[new Date().getDay()] ?? CONFIG.cuposSemanales;
    document.querySelectorAll('.spots-count').forEach(el => { el.textContent = cuposHoy; });

    // ============================================================
    // NAVEGACIÓN GENERAL
    // ============================================================
    const mobileMenu = document.getElementById('mobile-menu');
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => mobileMenu?.classList.toggle('hidden'));

    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            mobileMenu?.classList.add('hidden');
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const delay = e.target.dataset.delay || 0;
                setTimeout(() => e.target.classList.add('visible'), delay * 100);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in').forEach((el, i) => { el.dataset.delay = i % 4; observer.observe(el); });

    window.addEventListener('scroll', () => {
        const bar = document.getElementById('progress-bar');
        if (!bar) return;
        const prog = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        bar.style.width = prog + '%';
    });

    document.getElementById('close-announcement')?.addEventListener('click', () => {
        document.getElementById('announcement-bar')?.remove();
    });

    // Banner "ya pagaste" si vuelve a la landing después del pago
    if (state.pagado) document.getElementById('paid-banner')?.classList.remove('hidden');

    // ============================================================
    // PÁGINA A — CUESTIONARIO DINÁMICO (filtro del embudo)
    // Califica → Página B | Descarta → Página C
    // ============================================================
    const quizActive = document.getElementById('quiz-active');

    if (quizActive) {
        const quizAnswers = { entidad: null, estado: null, urgencia: null };

        const QUIZ = [
            {
                id: 'entidad',
                pregunta: '¿Qué tipo de entidad o negocio manejas o vas a crear en Panamá?',
                microcopy: '🔒 Tus respuestas son confidenciales — solo toma 30 segundos.',
                opciones: [
                    { valor: 'sociedad', texto: 'Sociedad Jurídica (S.A., S.E.P., SRL, etc.)', icono: 'building-2' },
                    { valor: 'profesional', texto: 'Persona Natural / Profesional (contador, abogado, etc.)', icono: 'briefcase' },
                    { valor: 'emprendimiento', texto: 'Emprendimiento nuevo, aún sin operar', icono: 'rocket' },
                    { valor: 'idea', texto: 'Todavía es solo una idea', icono: 'lightbulb', descarte: 'solo-idea' }
                ]
            },
            {
                id: 'estado',
                preguntas: {
                    sociedad: '¿Tus trámites de Aviso de Operación, agente residente y CSS están al día?',
                    profesional: '¿Tu Aviso de Operación y facturación están al día?',
                    emprendimiento: '¿Ya tienes claro el nombre y el capital de tu empresa?'
                },
                microcopy: 'No necesitas tener documentos a la mano para responder.',
                opciones: [
                    { valor: 'ok', texto: 'Sí, todo al día / necesito blindaje', icono: 'check-circle' },
                    { valor: 'inseguro', texto: 'No estoy seguro', icono: 'help-circle' },
                    { valor: 'falta', texto: 'Sé que me falta algo / necesito orientación', icono: 'alert-circle' }
                ],
                opcionesPor: {
                    emprendimiento: [
                        { valor: 'ok', texto: 'Sí, tengo todo definido / necesito blindaje', icono: 'check-circle' },
                        { valor: 'inseguro', texto: 'Aún me faltan detalles', icono: 'help-circle' },
                        { valor: 'falta', texto: 'No sé por dónde empezar', icono: 'alert-circle' }
                    ]
                }
            },
            {
                id: 'urgencia',
                pregunta: '¿Para cuándo necesitas tener esto resuelto?',
                microcopy: 'Última pregunta — ya casi terminamos.',
                opciones: [
                    { valor: 'semana', texto: 'Esta semana', icono: 'zap' },
                    { valor: 'mes', texto: 'Este mes', icono: 'calendar' },
                    { valor: 'meses', texto: 'En los próximos 2-3 meses', icono: 'calendar-clock' },
                    { valor: 'comparando', texto: 'Solo estoy comparando opciones', icono: 'search', descarte: 'comparando' }
                ]
            }
        ];

        let quizStep = 0;
        const quizDiscard = document.getElementById('quiz-discard');
        const quizQualified = document.getElementById('quiz-qualified');
        const quizQuestion = document.getElementById('quiz-question');
        const quizOptions = document.getElementById('quiz-options');
        const quizStepLabel = document.getElementById('quiz-step-label');
        const quizProgressFill = document.getElementById('quiz-progress-fill');

        const quizBack = document.getElementById('quiz-back');

        function renderQuizStep() {
            const step = QUIZ[quizStep];
            const textoPregunta = step.preguntas ? step.preguntas[quizAnswers.entidad] : step.pregunta;

            quizStepLabel.textContent = `Pregunta ${quizStep + 1} de ${QUIZ.length}`;
            quizProgressFill.style.width = `${((quizStep + 1) / QUIZ.length) * 100}%`;
            quizQuestion.textContent = textoPregunta;

            // Micro-copy de tranquilidad
            const mcEl = document.getElementById('quiz-microcopy');
            if (mcEl) mcEl.textContent = step.microcopy || '';

            // Opciones: usa variantes por entidad si existen (ej. P2 para emprendimiento)
            const opcionesActivas = (step.opcionesPor && step.opcionesPor[quizAnswers.entidad]) || step.opciones;

            quizOptions.innerHTML = opcionesActivas.map(o => `
                <button class="quiz-opt w-full py-4 px-5 bg-white border-2 border-slate-200 rounded-xl text-left font-medium flex items-center gap-3 hover:border-brand-blue hover:bg-blue-50/50" data-valor="${o.valor}" data-descarte="${o.descarte || ''}">
                    <i data-lucide="${o.icono}" class="w-5 h-5 text-brand-blue flex-shrink-0"></i>
                    <span>${o.texto}</span>
                </button>
            `).join('');

            // Botón "Volver" — solo visible a partir de la pregunta 2
            if (quizBack) {
                if (quizStep > 0) {
                    quizBack.innerHTML = `
                        <button id="quiz-back-btn" class="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-brand-blue transition-colors font-medium group">
                            <i data-lucide="arrow-left" class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"></i>
                            Pregunta anterior
                        </button>`;
                } else {
                    quizBack.innerHTML = '';
                }
            }

            lucide.createIcons();

            // Listeners de opciones
            quizOptions.querySelectorAll('.quiz-opt').forEach(btn => {
                btn.addEventListener('click', () => {
                    const valor = btn.dataset.valor;
                    const descarte = btn.dataset.descarte;
                    quizAnswers[step.id] = valor;
                    quizStarted = true;

                    if (descarte) return goToRecursos(descarte);
                    if (quizStep < QUIZ.length - 1) {
                        quizStep++;
                        renderQuizStep();
                    } else {
                        goToVideo();
                    }
                });
            });

            // Listener del botón "Volver"
            document.getElementById('quiz-back-btn')?.addEventListener('click', () => {
                const prevStep = QUIZ[quizStep];
                quizAnswers[prevStep.id] = null; // limpiar respuesta actual
                quizStep--;
                renderQuizStep();
            });
        }

        // Descartado → transición breve y redirect a Página C (lead magnet)
        function goToRecursos(motivo) {
            saveState({ quiz: 'discarded', motivoDescarte: motivo, entidad: quizAnswers.entidad, estado: quizAnswers.estado, urgencia: quizAnswers.urgencia });
            savePerfil(Object.assign({}, quizAnswers, { motivo }));
            quizActive.classList.add('hidden');
            quizDiscard?.classList.remove('hidden');
            lucide.createIcons();
            setTimeout(() => redirectTo(CONFIG.enlaces.paginaRecursos), 1800);
        }

        // Calificado → transición breve y redirect a Página B (video + oferta)
        function goToVideo() {
            saveState({ quiz: 'passed', entidad: quizAnswers.entidad, estado: quizAnswers.estado, urgencia: quizAnswers.urgencia });
            savePerfil(quizAnswers);
            quizActive.classList.add('hidden');
            quizQualified?.classList.remove('hidden');
            lucide.createIcons();
            setTimeout(() => redirectTo(CONFIG.enlaces.paginaVideo, {
                e: quizAnswers.entidad, s: quizAnswers.estado, u: quizAnswers.urgencia
            }), 1800);
        }

        renderQuizStep();
    }

    // ============================================================
    // PÁGINA B — VIDEO (gate 80%) + OFERTA $79
    // ============================================================
    let ytPlayer = null;
    let videoDuration = 0;
    let maxWatched = 0;          // tiempo MÁXIMO visto (base del anti-adelanto)
    let pendingResumeAt = null;  // resume pendiente hasta conocer la duración real
    let trackingTimer = null;
    let videoGateStarted = false;
    let offerUnlocked = true; // Oferta siempre visible sin bloqueo de tiempo

    const videoZona = document.getElementById('video-zona');

    if (videoZona) {
        const perfil = readPerfil();

        // Encabezado dinámico según Pregunta 1
        const OFFER_HEADINGS = {
            sociedad: 'Análisis preliminar para tu Sociedad Jurídica',
            profesional: 'Análisis preliminar para tu actividad profesional',
            emprendimiento: 'Análisis preliminar para tu nuevo negocio'
        };
        const heading = document.getElementById('offer-heading');
        if (heading) heading.textContent = OFFER_HEADINGS[perfil.entidad] || 'Análisis preliminar para tu negocio en Panamá';

        // Alerta de riesgo si en Pregunta 2 indicó dudas o trámites faltantes
        if (perfil.estado === 'inseguro' || perfil.estado === 'falta') {
            document.getElementById('risk-alert')?.classList.remove('hidden');
        }

        // Pasar respuestas del quiz al formulario de contacto (campos ocultos)
        const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
        setVal('quiz-entidad', perfil.entidad);
        setVal('quiz-estado', perfil.estado);
        setVal('quiz-urgencia', perfil.urgencia);

        // Prefill de contacto si ya envió datos antes
        if (state.nombre) setVal('contact-name', state.nombre);
        if (state.email) setVal('contact-email', state.email);
        if (state.contactoEnviado) {
            document.getElementById('contact-form')?.classList.add('hidden');
            document.getElementById('payment-block')?.classList.remove('hidden');
        }

        // Si ya vio el video antes, desbloquear oferta directo (sin repetir)
        if (offerUnlocked) showOfferUnlocked();
        initVideoGate();
    }

    // --- YouTube IFrame API ---
    function initVideoGate() {
        if (videoGateStarted) return;
        videoGateStarted = true;

        if (!CONFIG.youtubeId) {
            console.info('ℹ️ Video aún no configurado. Súbelo a YouTube (no listado) y pega el ID en CONFIG.youtubeId.');
            return; // Placeholder de marca queda visible
        }

        if (!offerUnlocked) document.getElementById('video-progress-wrap')?.classList.remove('hidden');

        if (window.YT && window.YT.Player) return createPlayer();
        const prevCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => { prevCallback?.(); createPlayer(); };
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
    }

    function createPlayer() {
        document.getElementById('video-placeholder')?.classList.add('hidden');
        const container = document.getElementById('video-player');
        if (!container) return;
        container.classList.remove('hidden');
        container.innerHTML = ''; // Limpiar contenedor

        // Crear iframe nativo con el endpoint oficial de YouTube Embed
        const iframe = document.createElement('iframe');
        iframe.id = 'yt-iframe';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.setAttribute('allowfullscreen', '1');
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
        
        // Solo agregar origin si estamos bajo servidor web (http / https), nunca bajo file://
        const isHttp = window.location.protocol.startsWith('http');
        const originParam = (isHttp && window.location.origin && window.location.origin !== 'null') 
            ? `&origin=${encodeURIComponent(window.location.origin)}` 
            : '';

        iframe.src = `https://www.youtube.com/embed/${CONFIG.youtubeId}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1${originParam}`;

        container.appendChild(iframe);

        // Vincular la API de YouTube al iframe nativo
        ytPlayer = new YT.Player('yt-iframe', {
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange,
                onError: onPlayerError
            }
        });
    }

    function onPlayerReady() {
        videoDuration = ytPlayer.getDuration() || 0; // puede ser 0 si los metadatos aún no cargan
        // Reanudar en el segundo exacto donde se quedó (persistencia)
        const saved = loadVideoProgress();
        if (!offerUnlocked && saved.t > 1) pendingResumeAt = saved.t;
        tryResume();
        updateVideoProgress();
    }

    // El resume solo se ejecuta cuando la duración real ya está disponible
    function tryResume() {
        if (pendingResumeAt == null || !videoDuration) return;
        if (pendingResumeAt < videoDuration - 1) {
            maxWatched = pendingResumeAt;
            ytPlayer.seekTo(pendingResumeAt, true);
        }
        pendingResumeAt = null;
        updateVideoProgress();
    }

    // Si el video falla (caído, eliminado o embed restringido), no dejar al
    // visitante atrapado: desbloquear la oferta igualmente
    function onPlayerError(e) {
        console.warn('⚠️ Error del reproductor de YouTube:', e?.data);
        unlockOffer();
    }

    function onPlayerStateChange(e) {
        if (e.data === YT.PlayerState.PLAYING) startTracking();
        else stopTracking();
    }

    // Anti-adelanto: monitoreo cada 500ms del tiempo máximo visto.
    // Si intenta adelantar (teclado/touch/API), retrocede al máximo visto.
    function startTracking() {
        stopTracking();
        trackingTimer = setInterval(() => {
            if (!ytPlayer) return;
            // Reintentar lectura de duración si los metadatos llegaron tarde
            if (!videoDuration) {
                videoDuration = ytPlayer.getDuration() || 0;
                tryResume();
                if (!videoDuration) return;
            }
            const pos = ytPlayer.getCurrentTime();

            if (!offerUnlocked && pos > maxWatched + 1.5) {
                ytPlayer.seekTo(maxWatched, true); // intento de adelanto → rewind
                return;
            }

            if (pos > maxWatched) {
                maxWatched = pos;
                saveVideoProgress({ t: maxWatched });
            }
            updateVideoProgress();

            if (!offerUnlocked && maxWatched >= videoDuration * CONFIG.umbralVideo) {
                unlockOffer();
            }
        }, 500);
    }
    function stopTracking() {
        if (trackingTimer) { clearInterval(trackingTimer); trackingTimer = null; }
    }

    function updateVideoProgress() {
        if (!videoDuration) return;
        const objetivo = videoDuration * CONFIG.umbralVideo;
        const pct = Math.min(100, Math.round((maxWatched / objetivo) * 100));
        const fill = document.getElementById('video-progress-fill');
        const label = document.getElementById('video-progress-label');
        if (fill) fill.style.width = pct + '%';
        if (label) label.textContent = pct + '%';
    }

    function unlockOffer() {
        offerUnlocked = true;
        saveVideoProgress({ unlocked: true });
        saveState({ videoVisto: true });
        stopTracking();
        showOfferUnlocked();
    }

    function showOfferUnlocked() {
        const zona = document.getElementById('oferta-zona');
        if (!zona) return;
        document.getElementById('video-progress-wrap')?.classList.add('hidden');
        document.getElementById('unlocked-notice')?.classList.remove('hidden');
        zona.classList.remove('hidden');
        zona.classList.add('section-reveal');
        lucide.createIcons();
    }

    // ============================================================
    // FORMULARIOS → GOOGLE SHEETS + MAILERLITE (WEBHOOK CENTRAL)
    // ============================================================
    async function sendToWebhook(data) {
        if (!CONFIG.enlaces.webhook || CONFIG.enlaces.webhook.includes('PEGA_AQUI_TU_ID')) {
            console.warn('⚠️ Webhook de Google Sheets no configurado aún en CONFIG.enlaces.webhook. Los datos se guardan solo localmente.');
            return;
        }
        // Prevenir que Google Sheets interprete el '+' inicial como fórmula matemática (#ERROR!)
        if (data && data.telefono && typeof data.telefono === 'string' && data.telefono.startsWith('+') && !data.telefono.startsWith("'")) {
            data.telefono = "'" + data.telefono;
        }
        try {
            await fetch(CONFIG.enlaces.webhook, {
                method: 'POST',
                mode: 'no-cors', // Evita bloqueo CORS en Google Apps Script
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(data)
            });
        } catch (err) {
            console.error('Error enviando al Webhook:', err);
        }
    }


    // ============================================================
    // MÓDULO DE VALIDACIÓN Y BLINDAJE DE DATOS (Anti-Errores & Spam)
    // ============================================================
    window.ValidadorDatos = {
        calcularLevenshtein(a, b) {
            if (a.length === 0) return b.length;
            if (b.length === 0) return a.length;
            const matrix = [];
            for (let i = 0; i <= b.length; i++) matrix[i] = [i];
            for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

            for (let i = 1; i <= b.length; i++) {
                for (let j = 1; j <= a.length; j++) {
                    if (b.charAt(i - 1) === a.charAt(j - 1)) {
                        matrix[i][j] = matrix[i - 1][j - 1];
                    } else {
                        matrix[i][j] = Math.min(
                            matrix[i - 1][j - 1] + 1, // sustitución
                            matrix[i][j - 1] + 1,     // inserción
                            matrix[i - 1][j] + 1      // eliminación
                        );
                    }
                }
            }
            return matrix[b.length][a.length];
        },

        validarEmail(email) {
            if (!email) return { valido: false, error: 'El correo electrónico es obligatorio.' };
            const clean = email.trim().toLowerCase();
            
            // 1. Sintaxis estricta
            const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,10}$/;
            if (!emailRegex.test(clean)) {
                return { valido: false, error: 'El formato del correo no es válido. Ejemplo: usuario@gmail.com' };
            }

            const partes = clean.split('@');
            const usuario = partes[0];
            const dominio = partes[1];
            
            // 2. Extensión mal escrita (ej. .comm, .coom, .con, .cm, .cmo)
            const extensionesMala = ['.comm', '.coom', '.con', '.cm', '.cmo'];
            for (let ext of extensionesMala) {
                if (dominio.endsWith(ext)) {
                    const buenaExt = clean.replace(ext, '.com');
                    return { valido: false, error: `La extensión "${ext}" es incorrecta. ¿Quisiste decir ${buenaExt}?` };
                }
            }

            // 3. Falsos y pruebas
            const falsos = ['test@test.com', 'asdf@asdf.com', '123@123.com', 'a@a.com', 'correo@correo.com', 'fake@fake.com', 'hola@hola.com'];
            if (falsos.includes(clean)) {
                return { valido: false, error: 'Por favor ingresa un correo electrónico real.' };
            }

            // 4. Algoritmo Matemático Levenshtein para Typos en Proveedores Principales
            const dominiosOficiales = [
                'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 
                'icloud.com', 'live.com', 'msn.com', 'hotmail.es', 'yahoo.es', 'outlook.es'
            ];

            for (let domValido of dominiosOficiales) {
                if (dominio === domValido) break; // Dominio exacto, 100% válido

                const distancia = this.calcularLevenshtein(dominio, domValido);
                // Si la diferencia es de 1 o 2 letras (ej. gdmail.com vs gmail.com = 1 cambio; outlok vs outlook = 1 cambio)
                if (distancia > 0 && distancia <= 2) {
                    const sugerencia = `${usuario}@${domValido}`;
                    return { 
                        valido: false, 
                        error: `El correo @${dominio} parece estar mal escrito. ¿Quisiste decir ${sugerencia}? Por favor corrígelo.` 
                    };
                }
            }

            return { valido: true, emailLimpio: clean };
        },

        validarTelefono(telefono, codigoPais = '+507') {
            if (!telefono || telefono.trim() === '') return { valido: true, telefonoFormateado: '' };
            let clean = telefono.trim().replace(/[\s\-\(\)]/g, '');

            const falsos = ['00000000', '12345678', '11111111', '22222222', '99999999', '88888888', '123456789'];
            if (falsos.some(f => clean.includes(f))) {
                return { valido: false, error: 'Ingresa un número de WhatsApp activo.' };
            }

            if (clean.startsWith('+')) {
                return { valido: true, telefonoFormateado: clean };
            }

            if (codigoPais === '+507') {
                if (/^[236789]\d{7}$/.test(clean) || /^\d{8}$/.test(clean)) {
                    return { valido: true, telefonoFormateado: '+507 ' + clean.substring(0, 4) + '-' + clean.substring(4) };
                }
                return { valido: false, error: 'Un número de Panamá debe tener 8 dígitos (ejemplo: 6546-1527).' };
            }

            if (/^\d{6,14}$/.test(clean)) {
                const prefijo = (codigoPais && codigoPais !== '+') ? codigoPais + ' ' : '+';
                return { valido: true, telefonoFormateado: prefijo + clean };
            }

            return { valido: false, error: 'Ingresa un número de teléfono válido para el país seleccionado.' };
        },

        validarNombre(nombre) {
            if (!nombre || nombre.trim().length < 3) {
                return { valido: false, error: 'Por favor ingresa tu nombre completo.' };
            }
            const clean = nombre.trim();
            if (/^(asdf|test|xxx|123|hola|aaaa)/i.test(clean)) {
                return { valido: false, error: 'Ingresa un nombre real.' };
            }
            return { valido: true, nombreLimpio: clean };
        }
    };

    // Mostrar u Ocultar Error Inline debajo del campo en el mismo formulario
    function mostrarErrorCampo(input, mensaje) {
        if (!input) return;
        let errEl = input.parentNode.querySelector('.input-error-msg');
        if (!errEl) {
            errEl = document.createElement('p');
            errEl.className = 'input-error-msg text-xs text-red-600 font-semibold mt-1.5 flex items-center gap-1';
            input.parentNode.appendChild(errEl);
        }
        if (mensaje) {
            errEl.innerHTML = `<svg class="w-3.5 h-3.5 fill-current flex-shrink-0" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg> <span>${mensaje}</span>`;
            errEl.classList.remove('hidden');
            input.classList.add('border-red-500', 'ring-2', 'ring-red-200');
            input.classList.remove('border-slate-200');
        } else {
            errEl.classList.add('hidden');
            input.classList.remove('border-red-500', 'ring-2', 'ring-red-200');
            input.classList.add('border-slate-200');
        }
    }

    // Componente flotante de selección de país:
    // Mantiene únicamente el código numérico (+507) en la casilla cerrada sin recortes
    // y abre un menú desplegable con banderas y nombres completos alineados a la derecha.
    function initCustomCountryPickers() {
        document.querySelectorAll('.country-picker-container').forEach(container => {
            if (container.dataset.initialized) return;
            container.dataset.initialized = "true";

            const btn = container.querySelector('.country-picker-btn');
            const dropdown = container.querySelector('.country-dropdown');
            const hiddenInput = container.querySelector('input[name="country_code"]');
            const valSpan = container.querySelector('.country-code-val');
            const phoneInput = container.parentNode ? (container.parentNode.querySelector('[name="phone"]') || container.parentNode.querySelector('[name="whatsapp"]')) : null;

            if (!btn || !dropdown || !hiddenInput) return;

            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.country-dropdown').forEach(d => {
                    if (d !== dropdown) d.classList.add('hidden');
                });
                dropdown.classList.toggle('hidden');
            });

            container.querySelectorAll('.country-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const code = item.dataset.code;
                    hiddenInput.value = code;
                    if (valSpan) valSpan.textContent = (code === '+' ? '+...' : code);

                    if (phoneInput) {
                        if (code === '+') {
                            phoneInput.placeholder = "ej. +502 5555-5555";
                        } else {
                            phoneInput.placeholder = "6546-1527";
                        }
                    }
                    dropdown.classList.add('hidden');
                });
            });
        });
    }

    document.addEventListener('click', () => {
        document.querySelectorAll('.country-dropdown').forEach(d => d.classList.add('hidden'));
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCustomCountryPickers);
    } else {
        initCustomCountryPickers();
    }

    // Auto-detección del país por IP para pre-seleccionar el código automáticamente
    (function autoDetectCountry() {
        if (location.protocol === 'file:') return; // Evitar llamada CORS al abrir como archivo local
        fetch('https://ipapi.co/json/')
            .then(r => r.json())
            .then(d => {
                if (!d || !d.country_code) return;
                const codeMap = {
                    'PA': '+507', 'US': '+1', 'CA': '+1', 'CO': '+57', 'CR': '+506',
                    'MX': '+52', 'VE': '+58', 'ES': '+34', 'EC': '+593', 'PE': '+51',
                    'AR': '+54', 'CL': '+56', 'DO': '+1'
                };
                const pref = codeMap[d.country_code];
                if (pref) {
                    document.querySelectorAll('.country-picker-container').forEach(container => {
                        const input = container.querySelector('input[name="country_code"]');
                        const valSpan = container.querySelector('.country-code-val');
                        if (input && valSpan) {
                            input.value = pref;
                            valSpan.textContent = pref;
                        }
                    });
                }
            }).catch(() => {});
    })();

    // Botón Directo al Pago de $79 USD — Abre el Modal de Pago Seguro CyberSource (Banco General)
    document.getElementById('pay-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof openCyberSourceModal === 'function') {
            openCyberSourceModal();
        } else {
            const csModal = document.getElementById('cybersource-modal');
            if (csModal) {
                csModal.classList.remove('hidden');
                setTimeout(() => {
                    csModal.classList.remove('opacity-0');
                    csModal.querySelector('.transform')?.classList.remove('scale-95');
                }, 10);
            }
        }
    });

    // Lead magnet (Página C): captura Nombre + Correo + WhatsApp → redirige a gracias-guia.html
    document.getElementById('lead-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const form = e.target;
        const inputNombre = form.querySelector('[name="name"]');
        const inputEmail = form.querySelector('[name="email"]');
        const inputTel = form.querySelector('[name="phone"]') || form.querySelector('[name="whatsapp"]');
        const rawCodigo = form.querySelector('[name="country_code"]')?.value || '+507';

        const rawNombre = inputNombre?.value || state.nombre;
        const rawEmail = inputEmail?.value || state.email;
        const rawTelefono = inputTel?.value || '';
        const motivo = document.getElementById('lead-motivo')?.value || 'Recursos Gratuitos';

        mostrarErrorCampo(inputNombre, null);
        mostrarErrorCampo(inputEmail, null);
        mostrarErrorCampo(inputTel, null);

        let hayError = false;

        const resNombre = window.ValidadorDatos.validarNombre(rawNombre);
        if (!resNombre.valido) { mostrarErrorCampo(inputNombre, resNombre.error); hayError = true; }

        const resEmail = window.ValidadorDatos.validarEmail(rawEmail);
        if (!resEmail.valido) { mostrarErrorCampo(inputEmail, resEmail.error); hayError = true; }

        const resTel = window.ValidadorDatos.validarTelefono(rawTelefono, rawCodigo);
        if (!resTel.valido) { mostrarErrorCampo(inputTel, resTel.error); hayError = true; }

        if (hayError) return;

        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Enviando...';

        try {
            await sendToWebhook({
                sheet_id: 0, // ID de la Hoja 1 (Guía Gratuita)
                tipo: 'guia',
                formulario: 'lead-magnet-guia',
                nombre: resNombre.nombreLimpio,
                email: resEmail.emailLimpio,
                telefono: resTel.telefonoFormateado,
                origen: 'Página C: Guía Preventiva 2026 (Lead Magnet)',
                detalles: `Motivo: ${motivo}`
            });

            saveState({ nombre: resNombre.nombreLimpio, email: resEmail.emailLimpio });
            localStorage.setItem('guiaSolicitada', 'true');
            window.location.href = 'gracias-guia.html';
        } catch (err) {
            alert('Error al enviar. Intenta de nuevo o escríbenos por WhatsApp.');
            btn.disabled = false;
            btn.textContent = 'Descargar Guía Ahora';
        }
    });

    // ============================================================
    // CONTADORES ANIMADOS
    // ============================================================
    const counterObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.counted) {
                entry.target.dataset.counted = 'true';
                const target = parseInt(entry.target.dataset.counter);
                const isDecimal = entry.target.dataset.decimal === 'true';
                const showPlus = entry.target.dataset.counter === '125';
                const duration = 1500;
                const startTime = performance.now();
                const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

                const updateCounter = currentTime => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const currentValue = Math.floor(easeOutQuart(progress) * target);
                    entry.target.textContent = isDecimal ? (currentValue / 10).toFixed(1) : currentValue;

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        entry.target.textContent = isDecimal ? (target / 10).toFixed(1) : target + (showPlus ? '+' : '');
                        entry.target.style.transform = 'scale(1.1)';
                        setTimeout(() => entry.target.style.transform = 'scale(1)', 200);
                    }
                };
                requestAnimationFrame(updateCounter);
            }
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));

    // ============================================================
    // FAQ ACORDEÓN
    // ============================================================
    document.querySelectorAll('.accordion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const content = btn.nextElementSibling;
            const icon = btn.querySelector('svg');
            document.querySelectorAll('.accordion-content').forEach(c => { if (c !== content) c.classList.remove('open'); });
            content.classList.toggle('open');
            icon?.classList.toggle('rotate-180');
        });
    });

    // ============================================================
    // WHATSAPP WIDGET
    // ============================================================
    const waToggle = document.getElementById('whatsapp-toggle');
    const waWidget = document.getElementById('whatsapp-widget');
    const waClose = document.getElementById('close-whatsapp');

    if (waToggle && waWidget && waClose) {
        waToggle.addEventListener('click', () => {
            waWidget.classList.toggle('scale-0');
            waWidget.classList.toggle('scale-100');
        });
        waClose.addEventListener('click', () => {
            waWidget.classList.add('scale-0');
            waWidget.classList.remove('scale-100');
        });
    }

    // ============================================================
    // SOCIAL PROOF TOAST (Frecuencia Orgánica & Límite por Sesión)
    // ============================================================
    let toastIndex = 0;
    let toastCount = 0;
    const toastEl = document.getElementById('social-proof-toast');
    const toastMessage = document.getElementById('toast-message');

    const showToast = () => {
        if (!toastEl || !toastMessage || toastCount >= (CONFIG.toastMaxPorSesion || 3)) return;
        toastMessage.innerHTML = CONFIG.toastMensajes[toastIndex];
        toastEl.classList.remove('translate-y-full', 'opacity-0');
        toastEl.classList.add('translate-y-0', 'opacity-100');
        setTimeout(() => {
            toastEl.classList.add('translate-y-full', 'opacity-0');
            toastEl.classList.remove('translate-y-0', 'opacity-100');
        }, CONFIG.toastDuracion);
        
        toastIndex = (toastIndex + 1) % CONFIG.toastMensajes.length;
        toastCount++;

        if (toastCount < (CONFIG.toastMaxPorSesion || 3)) {
            // Siguiente notificación aleatoria entre 45s y 70s
            const randomNextInterval = Math.floor(Math.random() * 25000) + 45000;
            setTimeout(showToast, randomNextInterval);
        }
    };
    if (toastEl) {
        setTimeout(showToast, CONFIG.toastDelayInicial);
    }

    // ============================================================
    // EXIT-INTENT POPUP (solo Página A — desktop + respaldo móvil)
    // ============================================================
    const exitPopup = document.getElementById('exit-popup');
    if (exitPopup) {
        const closeExitBtn = document.getElementById('close-exit-popup');
        let exitPopupShown = sessionStorage.getItem('exitPopupShown') === 'true';

        const showExitPopup = () => {
            const guiaSolicitada = localStorage.getItem('guiaSolicitada') === 'true';
            // No mostrar si ya pidió la guía, ya pagó, o está respondiendo el quiz
            if (exitPopupShown || guiaSolicitada || state.pagado || quizStarted) return;
            exitPopupShown = true;
            sessionStorage.setItem('exitPopupShown', 'true');

            exitPopup.classList.remove('opacity-0', 'pointer-events-none');
            exitPopup.classList.add('opacity-100', 'pointer-events-auto');
            exitPopup.querySelector('div').classList.remove('scale-95');
            exitPopup.querySelector('div').classList.add('scale-100');
        };

        window.closeExitPopup = () => {
            exitPopup.classList.add('opacity-0', 'pointer-events-none');
            exitPopup.classList.remove('opacity-100', 'pointer-events-auto');
            exitPopup.querySelector('div').classList.add('scale-95');
            exitPopup.querySelector('div').classList.remove('scale-100');
        };

        // Función auxiliar para pruebas locales
        window.forzarExitPopup = () => {
            sessionStorage.removeItem('exitPopupShown');
            exitPopupShown = false;
            exitPopup.classList.remove('opacity-0', 'pointer-events-none');
            exitPopup.classList.add('opacity-100', 'pointer-events-auto');
            exitPopup.querySelector('div').classList.remove('scale-95');
            exitPopup.querySelector('div').classList.add('scale-100');
        };

        document.addEventListener('mouseout', e => {
            if (e.clientY < 10 && e.relatedTarget === null) showExitPopup();
        });
        setTimeout(showExitPopup, CONFIG.exitIntent.segundosEnPagina * 1000);
        window.addEventListener('scroll', () => {
            // La Página A es corta: exigir un mínimo de tiempo antes del trigger por scroll
            if (Date.now() - pageStart < 15000) return;
            const scrolled = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
            if (scrolled >= CONFIG.exitIntent.scrollPorcentaje) showExitPopup();
        }, { passive: true });

        closeExitBtn?.addEventListener('click', closeExitPopup);
        exitPopup.addEventListener('click', e => { if (e.target === exitPopup) closeExitPopup(); });

        document.getElementById('exit-form')?.addEventListener('submit', async e => {
            e.preventDefault();
            const form = e.target;
            const inputNombre = form.querySelector('[name="name"]');
            const inputEmail = form.querySelector('[name="email"]');
            const inputPhone = form.querySelector('[name="whatsapp"]') || form.querySelector('[name="phone"]');

            const rawNombre = inputNombre?.value || '';
            const rawEmail = inputEmail?.value || '';
            const rawPhone = inputPhone?.value || '';
            const rawCodigo = form.querySelector('[name="country_code"]')?.value || '+507';

            mostrarErrorCampo(inputNombre, null);
            mostrarErrorCampo(inputEmail, null);
            mostrarErrorCampo(inputPhone, null);

            // 1. Validar Nombre
            const resNombre = window.ValidadorDatos.validarNombre(rawNombre);
            if (!resNombre.valido) {
                mostrarErrorCampo(inputNombre, resNombre.error);
                return;
            }

            // 2. Validar Email con Detección de Typos (ggmail, hotmaiil, etc.)
            const resEmail = window.ValidadorDatos.validarEmail(rawEmail);
            if (!resEmail.valido) {
                mostrarErrorCampo(inputEmail, resEmail.error);
                return;
            }

            // 3. Validar Teléfono (opcional)
            let telefonoFinal = '';
            if (rawPhone && rawPhone.trim() !== '') {
                const resTel = window.ValidadorDatos.validarTelefono(rawPhone, rawCodigo);
                if (!resTel.valido) {
                    mostrarErrorCampo(inputPhone, resTel.error);
                    return;
                }
                telefonoFinal = resTel.telefonoFormateado;
            }

            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Enviando...';

            try {
                await sendToWebhook({
                    sheet_id: 0, // ID de la Hoja 1 (Guía Gratuita)
                    tipo: 'guia',
                    formulario: 'exit-popup',
                    nombre: resNombre.nombreLimpio,
                    email: resEmail.emailLimpio,
                    telefono: telefonoFinal,
                    origen: 'Página A: Exit Intent Popup (Guía Gratis)',
                    detalles: 'Descarga de Guía desde Ventana de Salida'
                });

                saveState({ nombre: resNombre.nombreLimpio, email: resEmail.emailLimpio });
                localStorage.setItem('guiaSolicitada', 'true');
                window.location.href = 'gracias-guia.html';
            } catch (err) {
                mostrarErrorCampo(inputEmail, 'Error al enviar. Intenta de nuevo.');
                btn.disabled = false;
                btn.textContent = '¡Quiero mi Guía Gratis!';
            }
        });
    }

    // ============================================================
    // CYBERSOURCE UNIFIED CHECKOUT (BANCO GENERAL) — CHECKOUT
    // ============================================================
    let unifiedCheckoutInstance = null;
    let checkoutRefCode = null;
    let isCheckoutInitialized = false;
    let isInitializingCheckout = false;

    const checkoutModal = document.getElementById('checkout-modal');
    const closeCheckoutBtn = document.getElementById('close-checkout-modal');
    const checkoutAlert = document.getElementById('checkout-alert');
    const cybersourceForm = document.getElementById('cybersource-form');
    const cardPlaceholder = document.getElementById('card-placeholder');
    const continueToPaymentBtn = document.getElementById('continue-to-payment-btn');
    const personalDataBtnContainer = document.getElementById('personal-data-btn-container');
    const paymentContainer = document.getElementById('payment-container');

    function showCheckoutAlert(message, type = 'error') {
        if (!checkoutAlert) return;
        checkoutAlert.classList.remove('hidden', 'bg-red-50', 'text-red-700', 'border', 'border-red-200', 'bg-green-50', 'text-green-700', 'border-green-200');
        if (type === 'error') {
            checkoutAlert.classList.add('bg-red-50', 'text-red-700', 'border', 'border-red-200');
        } else {
            checkoutAlert.classList.add('bg-green-50', 'text-green-700', 'border', 'border-green-200');
        }
        checkoutAlert.innerHTML = message;
    }

    function hideCheckoutAlert() {
        if (checkoutAlert) checkoutAlert.classList.add('hidden');
    }

    // Cargar SDK oficial de Flex Microform dinámicamente desde el origen del JWT
    async function loadFlexMicroformSdk(captureContextJWT) {
        if (window.Flex || window.FLEX) return true;

        let sdkUrl = 'https://testflex.cybersource.com/microform/bundle/v1/flex-microform.min.js';
        try {
            const parts = captureContextJWT.split('.');
            if (parts.length >= 2) {
                const base64Url = parts[1].replace(/-/g, '+').replace(/_/g, '/');
                const pad = base64Url.length % 4;
                const base64 = pad ? base64Url + '='.repeat(4 - pad) : base64Url;
                const payload = JSON.parse(atob(base64));
                if (payload.ctx?.[0]?.data?.clientLibrary) {
                    sdkUrl = payload.ctx[0].data.clientLibrary;
                }
            }
        } catch (e) {
            console.warn('No se pudo extraer clientLibrary del JWT:', e);
        }

        console.log('🔄 Cargando SDK de Flex Microform desde:', sdkUrl);

        return new Promise((resolve, reject) => {
            if (window.Flex || window.FLEX) return resolve(true);

            const script = document.createElement('script');
            script.src = sdkUrl;
            script.crossOrigin = 'anonymous';
            script.onload = () => {
                if (window.Flex || window.FLEX) {
                    console.log('✅ SDK de Flex Microform cargado con éxito');
                    resolve(true);
                } else {
                    reject(new Error('El SDK de Flex se cargó pero window.Flex no está disponible.'));
                }
            };
            script.onerror = () => reject(new Error('Error al descargar el SDK de Flex Microform.'));
            document.head.appendChild(script);
        });
    }

    // Variables de estado para CyberSource Flex Microform
    let flexMicroformInstance = null;
    let flexCardNumber = null;
    let flexCardCvv = null;
    let isFlexInitialized = false;

    // Inicializar pasarela oficial CyberSource Flex Microform
    async function initCyberSourceFlexMicroform() {
        if (isFlexInitialized) return;
        hideCheckoutAlert();

        try {
            const resp = await fetch('/api/capture-context');
            if (!resp.ok) {
                const errData = await resp.json().catch(() => ({}));
                throw new Error(errData.error || 'Error al obtener la sesión de pago.');
            }

            const data = await resp.json();
            const captureContext = data.captureContext;
            checkoutRefCode = data.clientReferenceCode;

            // Cargar SDK dinámico
            await loadFlexMicroformSdk(captureContext);

            const FlexConstructor = window.Flex || window.FLEX;
            if (!FlexConstructor) {
                throw new Error('El SDK oficial Flex Microform no se ha inicializado.');
            }

            // Estilos tipográficos coincidentes con Tailwind Inter
            const customStyles = {
                'input': {
                    'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                    'font-size': '14px',
                    'font-weight': '400',
                    'color': '#0f172a',
                    'line-height': '22px'
                },
                '::placeholder': {
                    'color': '#94a3b8',
                    'font-weight': '400'
                },
                ':focus': {
                    'color': '#0f172a'
                }
            };

            // 1. Instanciar Flex
            const flex = new FlexConstructor(captureContext);

            // 2. Crear microform con los estilos corporativos
            flexMicroformInstance = flex.microform({
                styles: customStyles
            });

            // 3. Crear campos de Número y CVV
            flexCardNumber = flexMicroformInstance.createField('number', {
                placeholder: '0000 0000 0000 0000'
            });
            flexCardCvv = flexMicroformInstance.createField('securityCode', {
                placeholder: '123'
            });

            // Cargar en los contenedores del modal
            flexCardNumber.load('#flex-card-number', (err) => {
                if (err) {
                    console.error('Error al montar campo de tarjeta:', err);
                    showCheckoutAlert(`Error en campo de tarjeta: ${err.message || err}`, 'error');
                } else {
                    console.log('✅ Campo de Número de Tarjeta listo');
                }
            });

            flexCardCvv.load('#flex-card-cvv', (err) => {
                if (err) {
                    console.error('Error al montar campo CVV:', err);
                    showCheckoutAlert(`Error en campo CVV: ${err.message || err}`, 'error');
                } else {
                    console.log('✅ Campo CVV listo');
                }
            });

            isFlexInitialized = true;
            console.log('✅ Pasarela CyberSource Flex Microform montada e incrustada exitosamente');
        } catch (err) {
            console.error('Error inicializando pasarela CyberSource:', err);
            showCheckoutAlert(`Error de conexión: ${err.message || 'No se pudo conectar'}. Por favor, recarga la página.`, 'error');
        }
    }

    // Procesar el cargo en el backend usando el token obtenido de Flex
    async function procesarCargoServidor(transientToken) {
        showCheckoutAlert('Procesando pago seguro, por favor espera...', 'success');

        const firstName = document.getElementById('cs-first-name')?.value?.trim() || '';
        const lastName = document.getElementById('cs-last-name')?.value?.trim() || '';
        const email = document.getElementById('cs-email')?.value?.trim() || '';
        const phone = document.getElementById('cs-phone')?.value?.trim() || '';

        try {
            const resp = await fetch('/api/process-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transientToken,
                    clientReferenceCode: checkoutRefCode || ('EP-' + Date.now()),
                    firstName,
                    lastName,
                    email,
                    phone
                })
            });

            const data = await resp.json();

            if (resp.ok && (data.status === 'success' || data.status === 'AUTHORIZED' || data.status === 'PENDING' || data.status === 'ok')) {
                showCheckoutAlert('¡Pago procesado con éxito! Redirigiendo...', 'success');
                setTimeout(() => {
                    window.location.href = CONFIG.links.gracias + `?ref=${checkoutRefCode}&email=${encodeURIComponent(email)}`;
                }, 1200);
            } else {
                console.error('Error procesando pago en servidor:', data);
                const msg = data.message || data.error || 'El pago no pudo ser autorizado por el banco. Por favor verifica tus datos de tarjeta.';
                showCheckoutAlert(msg, 'error');
            }
        } catch (err) {
            console.error('Excepción procesando pago:', err);
            showCheckoutAlert('Error de comunicación con el servidor de pago. Por favor intenta nuevamente.', 'error');
        }
    }

    // Abrir Modal de Checkout (Carga directa en 1 solo paso)
    function openCheckoutModal() {
        if (!checkoutModal) return;

        // Pre-llenar datos del usuario si existen en el estado
        const st = loadState();
        const firstNameInput = document.getElementById('cs-first-name');
        const lastNameInput = document.getElementById('cs-last-name');
        const emailInput = document.getElementById('cs-email');
        const phoneInput = document.getElementById('cs-phone');

        if (st.nombre && firstNameInput && !firstNameInput.value) {
            const parts = st.nombre.trim().split(' ');
            firstNameInput.value = parts[0] || '';
            if (lastNameInput && parts.length > 1) {
                lastNameInput.value = parts.slice(1).join(' ');
            }
        }
        if (st.email && emailInput && !emailInput.value) {
            emailInput.value = st.email;
        }

        checkoutModal.classList.remove('hidden');
        checkoutModal.classList.add('flex');
        document.body.style.overflow = 'hidden';

        // Dar un breve tick para que el modal esté visible en pantalla antes de calcular el layout del iframe
        setTimeout(() => {
            initCyberSourceFlexMicroform();
        }, 80);
    }

    function closeCheckoutModal() {
        if (!checkoutModal) return;
        checkoutModal.classList.add('hidden');
        checkoutModal.classList.remove('flex');
        document.body.style.overflow = '';
        hideCheckoutAlert();
        isFlexInitialized = false;
    }

    // Trigger botones de apertura de modal
    const payBtn = document.getElementById('pay-btn');
    if (payBtn) {
        payBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openCheckoutModal();
        });
    }

    if (closeCheckoutBtn) {
        closeCheckoutBtn.addEventListener('click', closeCheckoutModal);
    }

    if (checkoutModal) {
        checkoutModal.addEventListener('click', (e) => {
            if (e.target === checkoutModal) closeCheckoutModal();
        });
    }

    // Handlers para Pago Rápido Express (Google Pay & Apple Pay)
    const googlePayBtn = document.getElementById('google-pay-btn');
    const applePayBtn = document.getElementById('apple-pay-btn');

    function checkWalletContactData() {
        const firstName = document.getElementById('cs-first-name')?.value?.trim() || '';
        const lastName = document.getElementById('cs-last-name')?.value?.trim() || '';
        const email = document.getElementById('cs-email')?.value?.trim() || '';
        const phone = document.getElementById('cs-phone')?.value?.trim() || '';

        if (!firstName || !lastName || !email || !phone) {
            showCheckoutAlert('Por favor completa primero tus datos de contacto arriba para asociar tu compra.');
            return false;
        }
        return true;
    }

    async function ensureGooglePaySdk() {
        if (window.google?.payments?.api?.PaymentsClient) return true;
        return new Promise((resolve) => {
            if (window.google?.payments?.api?.PaymentsClient) return resolve(true);
            const script = document.createElement('script');
            script.src = 'https://pay.google.com/gp/p/js/pay.js';
            script.onload = () => resolve(!!window.google?.payments?.api?.PaymentsClient);
            script.onerror = () => resolve(false);
            document.head.appendChild(script);
        });
    }

    if (googlePayBtn) {
        googlePayBtn.addEventListener('click', async () => {
            if (!checkWalletContactData()) return;
            hideCheckoutAlert();

            showCheckoutAlert('Conectando con Google Pay...', 'info');

            const hasGooglePay = await ensureGooglePaySdk();
            if (hasGooglePay && window.google?.payments?.api?.PaymentsClient) {
                try {
                    const paymentsClient = new window.google.payments.api.PaymentsClient({ environment: 'TEST' });
                    const paymentDataRequest = {
                        apiVersion: 2,
                        apiVersionMinor: 0,
                        allowedPaymentMethods: [{
                            type: 'CARD',
                            parameters: {
                                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                                allowedCardNetworks: ['VISA', 'MASTERCARD']
                            },
                            tokenizationSpecification: {
                                type: 'PAYMENT_GATEWAY',
                                parameters: {
                                    'gateway': 'cybersource',
                                    'gatewayMerchantId': 'bg_aizpruase'
                                }
                            }
                        }],
                        merchantInfo: { merchantName: 'Aizprua S.E. Escudo Preventivo' },
                        transactionInfo: {
                            totalPriceStatus: 'FINAL',
                            totalPriceLabel: 'Total',
                            totalPrice: '79.00',
                            currencyCode: 'USD',
                            countryCode: 'PA',
                            displayItems: [{
                                label: 'Sesión 40 min + 3 Bonos + Hoja de Ruta',
                                type: 'LINE_ITEM',
                                price: '79.00'
                            }]
                        }
                    };

                    hideCheckoutAlert();
                    const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
                    console.log('✅ Datos de Google Pay recibidos:', paymentData);
                    const token = paymentData?.paymentMethodData?.tokenizationData?.token || JSON.stringify(paymentData);
                    await procesarCargoServidor(token);
                } catch (err) {
                    if (err?.statusCode !== 'CANCELED') {
                        console.error('Error Google Pay:', err);
                        showCheckoutAlert('Google Pay no está configurado en este navegador. Puedes usar tu tarjeta abajo.', 'info');
                    } else {
                        hideCheckoutAlert();
                    }
                }
            } else {
                showCheckoutAlert('Google Pay no está disponible en este dispositivo. Puedes usar tu tarjeta abajo.', 'info');
            }
        });
    }

    if (applePayBtn) {
        applePayBtn.addEventListener('click', () => {
            if (!checkWalletContactData()) return;
            hideCheckoutAlert();

            if (window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
                try {
                    const request = {
                        countryCode: 'PA',
                        currencyCode: 'USD',
                        supportedNetworks: ['visa', 'masterCard'],
                        merchantCapabilities: ['supports3DS'],
                        total: { label: 'Aizprua S.E. Escudo Preventivo', amount: '79.00' }
                    };
                    const session = new window.ApplePaySession(3, request);
                    session.onpaymentauthorized = async (event) => {
                        session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
                        console.log('✅ Datos de Apple Pay recibidos:', event.payment);
                        const token = JSON.stringify(event.payment.token);
                        await procesarCargoServidor(token);
                    };
                    session.begin();
                } catch (err) {
                    console.error('Error Apple Pay:', err);
                    showCheckoutAlert('No se pudo iniciar Apple Pay en este navegador. Puedes usar tu tarjeta abajo.', 'info');
                }
            } else {
                showCheckoutAlert('Apple Pay requiere un dispositivo Apple con Safari habilitado. Puedes usar tu tarjeta abajo.', 'info');
            }
        });
    }

    // Validación y ejecución de pago con la pasarela bancaria
    const submitPaymentBtn = document.getElementById('submit-payment-btn');
    if (submitPaymentBtn) {
        submitPaymentBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            hideCheckoutAlert();

            const firstName = document.getElementById('cs-first-name')?.value?.trim() || '';
            const lastName = document.getElementById('cs-last-name')?.value?.trim() || '';
            const email = document.getElementById('cs-email')?.value?.trim() || '';
            const phone = document.getElementById('cs-phone')?.value?.trim() || '';
            let expMonth = document.getElementById('cs-exp-month')?.value?.trim() || '';
            let expYear = document.getElementById('cs-exp-year')?.value?.trim() || '';

            if (!firstName || !lastName || !email || !phone) {
                showCheckoutAlert('Por favor completa todos tus datos de contacto (Nombre, Apellido, Correo y WhatsApp).');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showCheckoutAlert('Por favor ingresa un correo electrónico válido.');
                return;
            }

            if (!expMonth || !expYear) {
                showCheckoutAlert('Por favor ingresa el mes (MM) y año (AA) de vencimiento de tu tarjeta.');
                return;
            }

            // Normalizar mes a 2 dígitos (ej: "8" -> "08")
            if (expMonth.length === 1) expMonth = '0' + expMonth;
            const monthNum = parseInt(expMonth, 10);
            if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
                showCheckoutAlert('El mes de vencimiento debe estar entre 01 y 12.');
                return;
            }

            // Normalizar año a 4 dígitos (ej: "28" -> "2028" o "20236" -> "2023")
            expYear = expYear.replace(/\D/g, '');
            if (expYear.length > 4) expYear = expYear.slice(0, 4);
            if (expYear.length === 2) expYear = '20' + expYear;

            const yearNum = parseInt(expYear, 10);
            const currentYear = new Date().getFullYear();
            if (isNaN(yearNum) || yearNum < currentYear || yearNum > currentYear + 25) {
                showCheckoutAlert(`Por favor ingresa un año de vencimiento válido y futuro (ej: ${currentYear % 100} o ${currentYear}).`);
                return;
            }

            if (!flexMicroformInstance) {
                showCheckoutAlert('La pasarela de pago se está conectando. Por favor espera un segundo.');
                return;
            }

            submitPaymentBtn.disabled = true;
            submitPaymentBtn.innerHTML = '<span class="flex items-center gap-2 justify-center"><svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Procesando Pago Seguro...</span>';

            const tokenOptions = {
                expirationMonth: expMonth,
                expirationYear: expYear
            };

            flexMicroformInstance.createToken(tokenOptions, async (err, token) => {
                if (err) {
                    console.error('Error tokenizando tarjeta con Flex:', err);
                    submitPaymentBtn.disabled = false;
                    submitPaymentBtn.innerHTML = '<i data-lucide="lock" class="w-4 h-4"></i><span>Pagar $79.00 USD</span>';
                    if (window.lucide) window.lucide.createIcons();
                    showCheckoutAlert('Datos de tarjeta inválidos o incompletos. Por favor verifica el número y CVV.', 'error');
                    return;
                }

                // Token obtenido con éxito -> Enviar a /api/process-payment (garantizando JWT plano)
                const jwtPayload = (typeof token === 'object' && token !== null) ? (token.token || token.transientTokenJwt || token.jwt || JSON.stringify(token)) : token;
                await procesarCargoServidor(jwtPayload);
                submitPaymentBtn.disabled = false;
                submitPaymentBtn.innerHTML = '<i data-lucide="lock" class="w-4 h-4"></i><span>Pagar $79.00 USD</span>';
                if (window.lucide) window.lucide.createIcons();
            });
        });
    }

    // Prevenir el submit del form completo por defecto
    if (cybersourceForm) {
        cybersourceForm.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }

    console.log('✅ Escudo Preventivo Embudo v3.0 + CyberSource Unified Checkout (Banco General) cargado');
});

