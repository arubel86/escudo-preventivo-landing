/**
 * ============================================================
 * AIZPRUA S.E. — MOTOR DINÁMICO DE ARTÍCULOS RECOMENDADOS (SERIE DE LECTURA)
 * ============================================================
 * Gestiona de forma centralizada los artículos del blog y selecciona
 * automáticamente los 2 artículos más afines y continuos para
 * mantener la retención de lectura sin riesgo de enlaces rotos.
 *
 * Cumple estrictamente con:
 * - 2 tarjetas por sección (AGENTS.md Regla 5.14)
 * - Títulos en estilo natural en español (Sentence Case)
 * - Colores oficiales de marca (brand-blue: #3849C8, brand-orange: #FF8A1E, emerald)
 */

(function () {
    'use strict';

    // REGISTRO CENTRAL MAESTRO DE ARTÍCULOS DEL BLOG
    const BLOG_POSTS = [
        {
            id: 'articulo-emprender',
            slug: 'articulo-emprender',
            url: '/articulo-emprender',
            title: 'Cómo empezar a emprender en Panamá: Lo que nadie te dice sobre dar el salto con éxito',
            category: 'Emprendimiento & Formalización',
            categoryColor: 'text-brand-blue',
            readTime: '5 min de lectura',
            image: 'assets/portada-articulo-emprender.png',
            description: 'Conoce los principios reales de mentalidad, orden financiero y estructura legal para empezar con pie derecho y sin perder tiempo ni dinero.',
            tags: ['emprendimiento', 'formalizacion', 'mentalidad', 'legal'],
            nextReads: ['articulo-mentalidad', 'articulo-multas-panama']
        },
        {
            id: 'articulo-mentalidad',
            slug: 'articulo-mentalidad',
            url: '/articulo-mentalidad',
            title: '5 consejos para cambiar nuestra manera de pensar y cumplir objetivos de negocio',
            category: 'Mentalidad Empresarial',
            categoryColor: 'text-brand-orange',
            readTime: '7 min de lectura',
            image: 'assets/portada-articulo-mentalidad.png',
            description: 'Aprende a reprogramar tus hábitos diarios, encontrar espacios de pensamiento y rodearte de personas que eleven tu estándar empresarial.',
            tags: ['mentalidad', 'habitos', 'emprendimiento', 'liderazgo'],
            nextReads: ['articulo-emprender', 'articulo-contratos-comerciales']
        },
        {
            id: 'articulo-multas-panama',
            slug: 'articulo-multas-panama',
            url: '/articulo-multas-panama',
            title: 'Las 7 multas ocultas de la DGI y CSS en Panamá que están quebrando a pymes (y cómo evitarlas)',
            category: 'Blindaje & Cumplimiento',
            categoryColor: 'text-emerald-600',
            readTime: '8 min de lectura',
            image: 'assets/portada-articulo-multas.png',
            description: 'Descubre las sanciones laborales y tributarias más comunes de DGI y CSS, y cómo blindarte preventivamente antes de una inspección.',
            tags: ['legal', 'multas', 'tributario', 'dgi', 'css', 'contratos'],
            nextReads: ['articulo-contratos-comerciales', 'articulo-credito-bancario']
        },
        {
            id: 'articulo-credito-bancario',
            slug: 'articulo-credito-bancario',
            url: '/articulo-credito-bancario',
            title: 'Los 5 requisitos reales que exigen los bancos en Panamá para aprobar un crédito comercial',
            category: 'Finanzas & Bancarización',
            categoryColor: 'text-brand-blue',
            readTime: '9 min de lectura',
            image: 'assets/portada-articulo-credito.png',
            description: 'Criterios no publicados de comités de crédito, ratio de cobertura DSCR mínimo de 1.3x y el impacto crítico del historial APC de los directores.',
            tags: ['finanzas', 'credito', 'bancos', 'apc', 'flujo'],
            nextReads: ['articulo-contratos-comerciales', 'articulo-multas-panama']
        },
        {
            id: 'articulo-contratos-comerciales',
            slug: 'articulo-contratos-comerciales',
            url: '/articulo-contratos-comerciales',
            title: '4 errores fatales al firmar contratos comerciales que pueden quebrar tu negocio en Panamá',
            category: 'Blindaje Legal & Contratos',
            categoryColor: 'text-brand-orange',
            readTime: '8 min de lectura',
            image: 'assets/portada-articulo-contratos.png',
            description: 'Los peligros de usar plantillas de Google, la trampa de la responsabilidad ilimitada y cómo pactar cláusulas de arbitraje y salida temprana.',
            tags: ['legal', 'contratos', 'blindaje', 'arbitraje', 'multas'],
            nextReads: ['articulo-multas-panama', 'articulo-credito-bancario']
        }
    ];

    /**
     * Extrae el slug del artículo actual a partir de la URL
     */
    function detectCurrentSlug() {
        const path = window.location.pathname.toLowerCase();
        const segments = path.split('/').filter(Boolean);
        const last = segments.pop() || '';
        return last.replace(/\.html$/, '');
    }

    /**
     * Calcula las 2 mejores recomendaciones para el artículo actual
     * Garantiza exclusión de sí mismo y prioriza la serie de lectura lógica
     */
    function getRecommendations(currentSlug, limit = 2) {
        const currentPost = BLOG_POSTS.find(p => p.slug === currentSlug || p.id === currentSlug);
        // Excluir el artículo actual
        const available = BLOG_POSTS.filter(p => p.slug !== currentSlug && p.id !== currentSlug);

        const recommendations = [];

        // 1. Prioridad: Siguiente paso en la serie de lectura (nextReads)
        if (currentPost && Array.isArray(currentPost.nextReads)) {
            for (const nextId of currentPost.nextReads) {
                const match = available.find(p => p.id === nextId || p.slug === nextId);
                if (match && !recommendations.some(r => r.id === match.id)) {
                    recommendations.push(match);
                    if (recommendations.length >= limit) break;
                }
            }
        }

        // 2. Si faltan para completar 2, buscar afinidad por tags / categoría
        if (recommendations.length < limit && currentPost) {
            const currentTags = currentPost.tags || [];
            const remaining = available
                .filter(p => !recommendations.some(r => r.id === p.id))
                .map(p => {
                    const sharedTags = (p.tags || []).filter(t => currentTags.includes(t)).length;
                    const sameCategory = p.category === currentPost.category ? 2 : 0;
                    return { post: p, score: sharedTags + sameCategory };
                })
                .sort((a, b) => b.score - a.score);

            for (const item of remaining) {
                recommendations.push(item.post);
                if (recommendations.length >= limit) break;
            }
        }

        // 3. Fallback: Rellenar con los primeros disponibles
        if (recommendations.length < limit) {
            for (const p of available) {
                if (!recommendations.some(r => r.id === p.id)) {
                    recommendations.push(p);
                    if (recommendations.length >= limit) break;
                }
            }
        }

        return recommendations.slice(0, limit);
    }

    /**
     * Genera el HTML canónico para una tarjeta de recomendación
     */
    function renderCardHtml(post) {
        return `
            <a href="${post.url}" class="group bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-brand-blue transition flex flex-col justify-between">
                <div class="space-y-2">
                    <span class="text-[10px] font-bold ${post.categoryColor || 'text-brand-orange'} uppercase">${post.category} • ${post.readTime}</span>
                    <h4 class="text-sm font-black text-slate-900 group-hover:text-brand-blue transition leading-snug">
                        ${post.title}
                    </h4>
                    <p class="text-xs text-slate-500 line-clamp-2">
                        ${post.description}
                    </p>
                </div>
                <span class="text-xs font-bold text-brand-blue inline-flex items-center gap-1 mt-4 group-hover:gap-1.5 transition-all">
                    <span>Leer artículo</span>
                    <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                </span>
            </a>
        `.trim();
    }

    /**
     * Inicializa la sección de recomendaciones en el DOM
     */
    function initRecommendations() {
        const container = document.getElementById('recommended-articles-grid');
        if (!container) return;

        // Leer slug del atributo data-current-slug si existe, o auto-detectar
        const explicitSlug = container.getAttribute('data-current-slug');
        const currentSlug = explicitSlug || detectCurrentSlug();

        const recommendedPosts = getRecommendations(currentSlug, 2);

        if (recommendedPosts.length > 0) {
            container.innerHTML = recommendedPosts.map(renderCardHtml).join('');
            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                lucide.createIcons();
            }
        }
    }

    // Exponer API global ligera por si se requiere manipulación externa
    window.BlogRecommendations = {
        posts: BLOG_POSTS,
        getRecommendations: getRecommendations,
        init: initRecommendations
    };

    // Auto-inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRecommendations);
    } else {
        initRecommendations();
    }
})();
