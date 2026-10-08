/**
 * ============================================================================
 * CATÁLOGO MAESTRO DE PRODUCTOS & SOLUCIONES (AIZPRUA S.E.)
 * ============================================================================
 * Fuente Única de Verdad (Single Source of Truth) para la Tienda Online
 * y el Showcase de Productos Destacados en la Página Principal (principal.html).
 *
 * Cualquier cambio de foto, título, precio o descripción realizado aquí
 * se actualiza simultáneamente en ambas páginas sin duplicar trabajo.
 * ============================================================================
 */

const AIZPRUA_PRODUCTS = [
    {
        id: "plan-360-digital",
        title: "Plan 360 empresarial (edición digital)",
        category: "blindaje",
        categoryLabel: "Estructuración Integral · Edición 2026",
        delivery: "digital",
        price: 24.99,
        priceOld: "$39.99",
        priceDisplay: "$24.99",
        currency: "USD",
        discountBadge: "OFERTA",
        guarantee: "Garantía 7 días",
        badgeLeft: { text: "100% Interactivo", homeText: "Edición digital global", class: "bg-brand-blue text-white" },
        badgeRight: { text: "Descarga Inmediata", homeText: "Descarga inmediata", class: "bg-emerald-600 text-white" },
        image: "assets/portada-plan-360-digital.jpg",
        alt: "Plan 360 Empresarial Edición Digital Multi-Dispositivo",
        fallbackTitle: "Plan 360 Digital",
        fallbackIcon: "laptop",
        fallbackBadge: "100% Interactivo",
        description: "Cuaderno maestro en PDF interactivo rellenable de 35 páginas a color para tablet, iPad, laptop y PC. Domina las 6 áreas vitales de tu negocio con guardado ilimitado.",
        bullets: [
            "<strong>PDF rellenable (35 págs.):</strong> Campos editables con guardado automático.",
            "<strong>Las 6 áreas clave:</strong> Legal, costos, marketing, finanzas, operaciones y blindaje.",
            "<strong>Acceso multiplataforma:</strong> Compatible con iPad, tablet, laptop y PC con guardado ilimitado."
        ],
        buyButton: {
            text: "Descargar por $24.99 USD",
            homeText: "Descargar por $24.99 USD",
            link: "https://pay.hotmart.com/V88356406E?checkoutMode=2",
            homeLink: "https://pay.hotmart.com/V88356406E?checkoutMode=2",
            icon: "shopping-bag",
            class: "bg-brand-blue hover:bg-brand-blue-dark text-white",
            isHotmart: true
        },
        detailButton: {
            text: "Ver temario completo y detalles",
            link: "/plan-360-digital",
            icon: "arrow-right",
            class: "text-brand-blue hover:text-brand-blue-dark hover:underline"
        },
        keywords: "plan 360 digital interactivo pdf rellenable ipad tablet pc contratos finanzas costos marketing bonos panama",
        featuredInHome: true,
        homeOrder: 1,
        homeBorderHover: "hover:border-brand-blue",
        homeStagger: "stagger-1"
    },
    {
        id: "plan-360-fisico",
        title: "Plan 360 empresarial (kit físico)",
        category: "blindaje",
        categoryLabel: "Kit Corporativo Físico + Digital",
        delivery: "physical",
        price: 39.99,
        priceOld: "$79.99",
        priceDisplay: "$39.99",
        currency: "USD",
        discountBadge: "50% DCTO",
        homeDiscountBadge: "Kit Oficial",
        paymentNotice: "Yappy / Tarjeta",
        homePaymentNotice: "Yappy / Efectivo",
        badgeLeft: { text: "Kit Físico Oficial", homeText: "Kit físico oficial", class: "bg-brand-orange text-white" },
        badgeRight: { text: "Envíos en Panamá", homeText: "Envíos en Panamá", class: "bg-slate-900 text-white" },
        image: "assets/portada-plan-360-fisico.jpg",
        alt: "Kit Plan 360 Físico + Digital",
        fallbackTitle: "Plan 360 Kit Físico",
        fallbackIcon: "package",
        fallbackBadge: "Kit Físico Oficial",
        description: "Libro físico a color (35 págs.) para planificar a mano, más kit ejecutivo oficial y acceso inmediato a la versión digital interactiva.",
        bullets: [
            "<strong>Libro físico Plan 360:</strong> 35 páginas a color, anillado de alta durabilidad.",
            "<strong>Kit ejecutivo:</strong> Bolsa ecológica oficial (360) + lápiz + tarjeta.",
            "<strong>Suite digital incluida:</strong> PDF rellenable interactivo para iPad, tablet o PC."
        ],
        buyButton: {
            text: "Pedir Kit Físico por $39.99 USD",
            homeText: "Ver detalles del kit",
            link: "https://wa.me/50765461527?text=Hola%2C%20quiero%20ordenar%20el%20Plan%20360%20Empresarial%20(%2439.99%20USD)%20con%20env%C3%ADo%20en%20Panam%C3%A1.",
            homeLink: "/plan-360",
            icon: "truck",
            class: "bg-brand-orange hover:bg-brand-orange-dark text-white",
            isHotmart: false
        },
        detailButton: {
            text: "Ver landing page y fotos del kit",
            link: "/plan-360",
            icon: "arrow-right",
            class: "text-brand-orange-dark hover:text-brand-orange hover:underline"
        },
        keywords: "plan 360 fisico kit libro anillado bolsa lapiz panama domicilio unoexpress servientrega pdf digital",
        featuredInHome: true,
        homeOrder: 2,
        homeBorderHover: "hover:border-brand-orange",
        homeStagger: "stagger-2"
    },
    {
        id: "taza-plan-360",
        title: "Taza corporativa Plan 360 empresarial",
        category: "merch",
        categoryLabel: "Identidad Emprendedora · Edición 2026",
        delivery: "physical",
        price: 12.99,
        priceOld: "$18.00",
        priceDisplay: "$12.99",
        currency: "USD",
        discountBadge: "OFERTA",
        paymentNotice: "Yappy / Tarjeta",
        badgeLeft: { text: "Merch Oficial", homeText: "Merch Oficial", class: "bg-brand-orange text-white" },
        badgeRight: { text: "Envíos en Panamá", homeText: "Envíos en Panamá", class: "bg-slate-900/90 text-white" },
        image: "assets/taza-plan-360.jpg",
        alt: "Taza Corporativa Plan 360 Empresarial",
        fallbackTitle: "Taza Plan 360",
        fallbackIcon: "coffee",
        fallbackBadge: "Merch Oficial",
        description: "Taza de cerámica ejecutiva bicolor de 11 oz con interior y asa en naranja de marca y el lema oficial «Un plan para llegar más lejos». El complemento ideal para tus mañanas de enfoque.",
        bullets: [
            "<strong>Cerámica bicolor (11 oz):</strong> Exterior blanco brillante con interior y asa en naranja corporativo (#FF8A1E).",
            "<strong>Estampado permanente:</strong> Logo oficial Plan 360 y frase motivacional en ambas caras de la taza.",
            "<strong>Empaque protector seguro:</strong> Caja individual acondicionada para entrega en Ciudad de Panamá e interior."
        ],
        buyButton: {
            text: "Pedir Taza por $12.99 USD",
            link: "https://wa.me/50765461527?text=Hola,%20deseo%20pedir%20la%20Taza%20Corporativa%20del%20Plan%20360%20Empresarial%20($12.99%20USD)%20con%20env%C3%ADo%20en%20Panam%C3%A1",
            icon: "coffee",
            class: "bg-gradient-to-r from-brand-orange to-brand-orange-dark hover:brightness-110 text-white",
            isHotmart: false
        },
        detailButton: {
            text: "Consultar por WhatsApp",
            link: "https://wa.me/50765461527?text=Hola,%20tengo%20una%20consulta%20sobre%20la%20Taza%20del%20Plan%20360%20($12.99%20USD)",
            icon: "message-circle",
            iconClass: "text-emerald-500",
            class: "text-slate-500 hover:text-brand-blue"
        },
        keywords: "taza mug cafe ceramica plan 360 empresarial un plan para llegar mas lejos merchandising oficial regalo ejecutivo panama",
        featuredInHome: false
    },
    {
        id: "sueter-metodo-4e",
        title: "Hoodie oficial Método 4E (Azul / Black Edition)",
        category: "merch",
        categoryLabel: "Identidad Emprendedora · Edición 2026",
        delivery: "physical",
        price: 38.00,
        priceOld: "$48.00",
        priceDisplay: "$38.00",
        currency: "USD",
        discountBadge: "OFERTA",
        paymentNotice: "Yappy / Tarjeta",
        badgeLeft: { text: "Merch Oficial", homeText: "Merch Oficial", class: "bg-brand-orange text-white" },
        badgeRight: { text: "Envíos en Panamá", homeText: "Envíos en Panamá", class: "bg-slate-900/90 text-white" },
        image: "assets/sueter-metodo-4e-azul.jpg",
        alt: "Hoodie Suéter Oficial Método 4E Aizprua Edición Azul y Negra",
        colors: ["Azul Corporativo (Principal)", "Negro Carbón (Black Edition)"],
        colorImages: {
            azul: "assets/sueter-metodo-4e-azul.jpg",
            negro: "assets/sueter-metodo-4e-negro.jpg"
        },
        fallbackTitle: "Hoodie Método 4E",
        fallbackIcon: "shirt",
        fallbackBadge: "Merch Oficial",
        description: "Suéter con capucha (hoodie) premium en algodón perchado con bolsillo canguro y el logo oficial del Método 4E. Disponible en Azul Corporativo (principal) y Negro Carbón.",
        bullets: [
            "<strong>Algodón perchado premium:</strong> Tejido térmico transpirable y suave al tacto con bolsillo canguro y cordón reforzado.",
            "<strong>2 Colores exclusivos:</strong> Elige entre Azul Corporativo (principal) o Negro Carbón con emblema oficial de alta durabilidad.",
            "<strong>Tallas S a XL con envío:</strong> Confección unisex con entregas seguras en Ciudad de Panamá e interior vía encomienda."
        ],
        buyButton: {
            text: "Pedir Hoodie Azul por $38.00 USD",
            link: "https://wa.me/50765461527?text=Hola,%20deseo%20pedir%20el%20Hoodie%20Oficial%20del%20M%C3%A9todo%204E%20en%20Color%20Azul%20($38.00%20USD)%20con%20env%C3%ADo%20en%20Panam%C3%A1",
            icon: "shopping-bag",
            class: "bg-gradient-to-r from-brand-orange to-brand-orange-dark hover:brightness-110 text-white",
            isHotmart: false
        },
        detailButton: {
            text: "Consultar tallas por WhatsApp",
            link: "https://wa.me/50765461527?text=Hola,%20tengo%20una%20consulta%20sobre%20las%20tallas%20del%20Hoodie%20M%C3%A9todo%204E%20($38.00%20USD)",
            icon: "message-circle",
            iconClass: "text-emerald-500",
            class: "text-slate-500 hover:text-brand-blue"
        },
        keywords: "hoodie sueter sudadera metodo 4e curso arubel aizprua escuela ropa merchandising oficial algodon panama yappy",
        featuredInHome: false
    },
    {
        id: "taza-metodo-4e",
        title: "Taza oficial Método 4E (Azul / Black Edition)",
        category: "merch",
        categoryLabel: "Identidad Emprendedora · Edición 2026",
        delivery: "physical",
        price: 14.00,
        priceOld: "$18.00",
        priceDisplay: "$14.00",
        currency: "USD",
        discountBadge: "OFERTA",
        paymentNotice: "Yappy / Tarjeta",
        badgeLeft: { text: "Merch Oficial", homeText: "Merch Oficial", class: "bg-brand-orange text-white" },
        badgeRight: { text: "Envíos en Panamá", homeText: "Envíos en Panamá", class: "bg-slate-900/90 text-white" },
        image: "assets/taza-metodo-4e-azul.jpg",
        alt: "Taza Oficial Método 4E Aizprua Edición Azul y Negra",
        colors: ["Azul Corporativo (Principal)", "Negro Carbón (Black Edition)"],
        colorImages: {
            azul: "assets/taza-metodo-4e-azul.jpg",
            negro: "assets/taza-metodo-4e-negro.jpg"
        },
        fallbackTitle: "Taza Método 4E",
        fallbackIcon: "coffee",
        fallbackBadge: "Merch Oficial",
        description: "Taza de cerámica premium de 11 oz con diseño oficial del Método 4E. Apta para microondas y lavavajillas. Disponible en Azul Corporativo y Negro Carbón.",
        bullets: [
            "<strong>Cerámica resistente 11 oz:</strong> Acabado brillante de alta durabilidad, apta para microondas y lavavajillas con agarre ergonómico.",
            "<strong>2 Colores de colección:</strong> Elige entre Azul Corporativo (principal) o Negro Carbón con escudo oficial 4E en relieve.",
            "<strong>Empaque seguro para envíos:</strong> Caja protectora de impacto con entregas en Ciudad de Panamá e interior vía encomienda."
        ],
        buyButton: {
            text: "Pedir Taza Azul por $14.00 USD",
            link: "https://wa.me/50765461527?text=Hola,%20deseo%20pedir%20la%20Taza%20Oficial%20del%20M%C3%A9todo%204E%20en%20Color%20Azul%20($14.00%20USD)%20con%20env%C3%ADo%20en%20Panam%C3%A1",
            icon: "shopping-bag",
            class: "bg-gradient-to-r from-brand-orange to-brand-orange-dark hover:brightness-110 text-white",
            isHotmart: false
        },
        detailButton: {
            text: "Consultar envíos por WhatsApp",
            link: "https://wa.me/50765461527?text=Hola,%20tengo%20una%20consulta%20sobre%20la%20Taza%20M%C3%A9todo%204E%20($14.00%20USD)",
            icon: "message-circle",
            iconClass: "text-emerald-500",
            class: "text-slate-500 hover:text-brand-blue"
        },
        keywords: "taza mug jarro cafe metodo 4e curso arubel aizprua escuela merchandising oficial ceramica panama yappy",
        featuredInHome: false
    },
    {
        id: "kit-resolucion-problemas",
        title: "Kit de resolución de problemas",
        category: "blindaje",
        categoryLabel: "Protocolos de Acción Rápida",
        delivery: "digital",
        price: 16.99,
        priceOld: "$47.00",
        priceDisplay: "$16.99",
        currency: "USD",
        discountBadge: "65% DCTO",
        guarantee: "Garantía 7 días",
        badgeLeft: { text: "Protocolos de Crisis", class: "bg-amber-500 text-white" },
        badgeRight: { text: "Descarga Digital", class: "bg-slate-900/90 text-white" },
        image: "assets/portada-kit-problemas-digital.jpg",
        alt: "Kit de Resolución de Problemas Empresariales Multi-Dispositivo",
        fallbackTitle: "Kit de Resolución",
        fallbackIcon: "laptop",
        fallbackBadge: "Multi-Dispositivo",
        description: "Tu botiquín de primeros auxilios empresariales: más de 50 soluciones paso a paso ante contingencias de negocio + 1 plantilla rellenable para diagnosticar y solucionar problemas paso a paso.",
        bullets: [
            "<strong>+50 casos críticos:</strong> Finanzas, socios, ventas y gestión de personal.",
            "<strong>1 plantilla rellenable:</strong> Formato interactivo guiado para resolver problemas.",
            "<strong>Protocolos de acción:</strong> Respuestas inmediatas ante contingencias y cobros."
        ],
        buyButton: {
            text: "Descargar por $16.99 USD",
            link: "https://pay.hotmart.com/Q88322358Q?checkoutMode=2",
            icon: "shopping-bag",
            class: "bg-brand-blue hover:bg-brand-blue-dark text-white",
            isHotmart: true
        },
        detailButton: {
            text: "Consultar por WhatsApp",
            link: "https://wa.me/50765461527?text=Hola%2C%20tengo%20una%20consulta%20sobre%20el%20Kit%20de%20Resoluci%C3%B3n%20de%20Problemas%20(%2416.99%20USD)",
            icon: "message-circle",
            iconClass: "text-emerald-500",
            class: "text-slate-500 hover:text-brand-blue"
        },
        keywords: "kit resolucion problemas contingencia socios morosos multas inspecciones dgi 50 soluciones",
        featuredInHome: false
    },
    {
        id: "pack-servicios-profesionales",
        title: "Pack contratación por servicios profesionales",
        category: "blindaje",
        categoryLabel: "Contratistas & Servicios Profesionales",
        delivery: "digital",
        price: 97.00,
        priceOld: "$197.00",
        priceDisplay: "$97.00",
        currency: "USD",
        discountBadge: "50% DCTO",
        guarantee: "Garantía Aizprua",
        badgeLeft: { text: "Pack 6 en 1", class: "bg-brand-blue text-white" },
        badgeRight: { text: "Descarga Inmediata", class: "bg-emerald-600 text-white" },
        image: null,
        isCustomShowcase: true,
        customIcon: "briefcase",
        customTitle: "Servicios Profesionales",
        customSubtitle: "Contratación & Salidas",
        alt: "Pack Contratación por Servicios Profesionales",
        description: "Suite jurídica en Word con contrato de servicios profesionales y las 5 cartas de gestión y desvinculación para blindar la relación con contratistas y colaboradores.",
        bullets: [
            "<strong>Contrato de servicios profesionales:</strong> Modelo blindado en Word (.docx) con cláusulas de autonomía e independencia.",
            "<strong>Suite disciplinaria y de salida:</strong> Carta de despido justificado, amonestación disciplinaria y renuncia voluntaria.",
            "<strong>Cierre sin pasivos:</strong> Acuerdo de mutuo acuerdo y finiquito laboral para máxima certeza legal."
        ],
        buyButton: {
            text: "Comprar Pack por $97.00 USD",
            link: "https://wa.me/50765461527?text=Hola,%20deseo%20comprar%20el%20Pack%20de%20Servicios%20Profesionales%20($97.00%20USD)%20en%20Aizprua%20S.E.",
            icon: "shopping-bag",
            class: "bg-brand-blue hover:bg-brand-blue-dark text-white",
            isHotmart: false
        },
        detailButton: {
            text: "Consultar por WhatsApp",
            link: "https://wa.me/50765461527?text=Hola,%20tengo%20una%20consulta%20sobre%20el%20Pack%20de%20Servicios%20Profesionales%20($97.00%20USD)",
            icon: "message-circle",
            iconClass: "text-emerald-500",
            class: "text-slate-500 hover:text-brand-blue"
        },
        keywords: "pack servicios profesionales contrato servicios profesionales honorarios carta despido justificado amonestacion disciplinaria renuncia voluntaria mutuo acuerdo finiquito laboral panama word docx",
        featuredInHome: false
    },
    {
        id: "pack-tiempo-indefinido",
        title: "Pack laboral de tiempo indefinido",
        category: "blindaje",
        categoryLabel: "Personal Fijo · Código de Trabajo",
        delivery: "digital",
        price: 97.00,
        priceOld: "$197.00",
        priceDisplay: "$97.00",
        currency: "USD",
        discountBadge: "50% DCTO",
        guarantee: "Garantía Aizprua",
        badgeLeft: { text: "Pack 6 en 1", class: "bg-brand-blue text-white" },
        badgeRight: { text: "Descarga Inmediata", class: "bg-emerald-600 text-white" },
        image: null,
        isCustomShowcase: true,
        customIcon: "users",
        customTitle: "Tiempo Indefinido",
        customSubtitle: "Personal Permanente",
        alt: "Pack Laboral de Tiempo Indefinido",
        description: "Contrato individual de trabajo por tiempo indefinido más la suite completa de amonestación, despido formal, renuncia, mutuo acuerdo y finiquito en Panamá.",
        bullets: [
            "<strong>Contrato tiempo indefinido (Word):</strong> Modelo oficial según Mitradel con período probatorio de 3 meses.",
            "<strong>Control de faltas y avisos:</strong> Carta de amonestación disciplinaria y carta de despido formal bajo Art. 213.",
            "<strong>Desvinculaciones pacíficas:</strong> Carta de renuncia voluntaria, acuerdo de mutuo acuerdo y finiquito laboral."
        ],
        buyButton: {
            text: "Comprar Pack por $97.00 USD",
            link: "https://wa.me/50765461527?text=Hola,%20deseo%20comprar%20el%20Pack%20Laboral%20de%20Tiempo%20Indefinido%20($97.00%20USD)%20en%20Aizprua%20S.E.",
            icon: "shopping-bag",
            class: "bg-brand-blue hover:bg-brand-blue-dark text-white",
            isHotmart: false
        },
        detailButton: {
            text: "Consultar por WhatsApp",
            link: "https://wa.me/50765461527?text=Hola,%20tengo%20una%20consulta%20sobre%20el%20Pack%20de%20Tiempo%20Indefinido%20($97.00%20USD)",
            icon: "message-circle",
            iconClass: "text-emerald-500",
            class: "text-slate-500 hover:text-brand-blue"
        },
        keywords: "pack laboral tiempo indefinido contrato trabajo permanente mitradel carta despido amonestacion renuncia mutuo acuerdo finiquito panama word docx",
        featuredInHome: false
    },
    {
        id: "pack-tiempo-definido",
        title: "Pack laboral de tiempo definido (término fijo)",
        category: "blindaje",
        categoryLabel: "Personal Temporal · Término Fijo",
        delivery: "digital",
        price: 97.00,
        priceOld: "$197.00",
        priceDisplay: "$97.00",
        currency: "USD",
        discountBadge: "50% DCTO",
        guarantee: "Garantía Aizprua",
        badgeLeft: { text: "Pack 6 en 1", class: "bg-brand-blue text-white" },
        badgeRight: { text: "Descarga Inmediata", class: "bg-emerald-600 text-white" },
        image: null,
        isCustomShowcase: true,
        customIcon: "calendar-clock",
        customTitle: "Tiempo Definido",
        customSubtitle: "Contratos a Plazo Fijo",
        alt: "Pack Laboral de Tiempo Definido",
        description: "Contrato de trabajo por tiempo definido bajo el Art. 74 del Código de Trabajo con las 5 cartas indispensables de régimen disciplinario y salida laboral.",
        bullets: [
            "<strong>Contrato a término fijo (Word):</strong> Cláusulas justificativas válidas ante Mitradel para evitar conversión a indefinido.",
            "<strong>Gestión y desvinculaciones:</strong> Amonestación disciplinaria, notificación de despido justificado y renuncia voluntaria.",
            "<strong>Cierre de contrato blindado:</strong> Mutuo acuerdo y finiquito de liquidación para protección absoluta de la empresa."
        ],
        buyButton: {
            text: "Comprar Pack por $97.00 USD",
            link: "https://wa.me/50765461527?text=Hola,%20deseo%20comprar%20el%20Pack%20de%20Tiempo%20Definido%20($97.00%20USD)%20en%20Aizprua%20S.E.",
            icon: "shopping-bag",
            class: "bg-brand-blue hover:bg-brand-blue-dark text-white",
            isHotmart: false
        },
        detailButton: {
            text: "Consultar por WhatsApp",
            link: "https://wa.me/50765461527?text=Hola,%20tengo%20una%20consulta%20sobre%20el%20Pack%20de%20Tiempo%20Definido%20($97.00%20USD)",
            icon: "message-circle",
            iconClass: "text-emerald-500",
            class: "text-slate-500 hover:text-brand-blue"
        },
        keywords: "pack tiempo definido contrato termino fijo plazo determinado temporal mitradel carta despido amonestacion renuncia mutuo acuerdo finiquito panama word docx",
        featuredInHome: false
    },
    {
        id: "pack-obra-determinada",
        title: "Pack laboral por obra determinada",
        category: "blindaje",
        categoryLabel: "Proyectos & Construcción",
        delivery: "digital",
        price: 97.00,
        priceOld: "$197.00",
        priceDisplay: "$97.00",
        currency: "USD",
        discountBadge: "50% DCTO",
        guarantee: "Garantía Aizprua",
        badgeLeft: { text: "Pack 6 en 1", class: "bg-brand-blue text-white" },
        badgeRight: { text: "Descarga Inmediata", class: "bg-emerald-600 text-white" },
        image: null,
        isCustomShowcase: true,
        customIcon: "hammer",
        customTitle: "Obra Determinada",
        customSubtitle: "Proyectos & Obras",
        alt: "Pack Laboral por Obra Determinada",
        description: "Contrato de trabajo por cierta obra conforme al Art. 75 del Código de Trabajo con las 5 cartas de régimen disciplinario y culminación de proyecto.",
        bullets: [
            "<strong>Contrato por cierta obra (Word):</strong> Estipulación precisa de la obra para evitar demandas por terminación anticipada.",
            "<strong>Control de proyecto:</strong> Carta de amonestación disciplinaria, despido justificado y carta de renuncia voluntaria.",
            "<strong>Finiquito de obra:</strong> Mutuo acuerdo y finiquito laboral con liquidación formal de derechos adquiridos."
        ],
        buyButton: {
            text: "Comprar Pack por $97.00 USD",
            link: "https://wa.me/50765461527?text=Hola,%20deseo%20comprar%20el%20Pack%20por%20Obra%20Determinada%20($97.00%20USD)%20en%20Aizprua%20S.E.",
            icon: "shopping-bag",
            class: "bg-brand-blue hover:bg-brand-blue-dark text-white",
            isHotmart: false
        },
        detailButton: {
            text: "Consultar por WhatsApp",
            link: "https://wa.me/50765461527?text=Hola,%20tengo%20una%20consulta%20sobre%20el%20Pack%20por%20Obra%20Determinada%20($97.00%20USD)",
            icon: "message-circle",
            iconClass: "text-emerald-500",
            class: "text-slate-500 hover:text-brand-blue"
        },
        keywords: "pack obra determinada contrato cierta obra construccion tecnicos proyectos mitradel despido amonestacion renuncia mutuo acuerdo finiquito panama word docx",
        featuredInHome: false
    },
    {
        id: "super-pack-laboral",
        title: "Super pack laboral & contratación 360",
        category: "blindaje",
        categoryLabel: "Suite Integral · Ahorra $241 USD",
        delivery: "digital",
        price: 147.00,
        priceOld: "$388.00",
        priceDisplay: "$147.00",
        currency: "USD",
        discountBadge: "AHORRA $241",
        guarantee: "Garantía Aizprua",
        badgeLeft: { text: "Suite Maestra 9 en 1", class: "bg-gradient-to-r from-brand-orange to-brand-orange-dark text-white" },
        badgeRight: { text: "Descarga Inmediata", class: "bg-emerald-600 text-white" },
        image: null,
        isCustomShowcase: true,
        customIcon: "shield-check",
        customTitle: "Super Pack Laboral 360",
        customSubtitle: "Las 4 Modalidades + Suite de Salida",
        alt: "Super Pack Laboral & Contratación 360",
        description: "La suite definitiva con los 4 contratos oficiales de contratación en Panamá más las 5 cartas maestras disciplinarias y de salida para blindar toda tu empresa.",
        bullets: [
            "<strong>Los 4 contratos en Word:</strong> Servicios profesionales, tiempo indefinido, tiempo definido y obra determinada.",
            "<strong>Régimen disciplinario y salidas:</strong> Carta de despido justificado (Art. 213), amonestación disciplinaria y renuncia voluntaria.",
            "<strong>Resolución pacífica de conflictos:</strong> Mutuo acuerdo formal (Art. 210) y finiquito laboral con descargo de responsabilidades."
        ],
        buyButton: {
            text: "Comprar Super Pack por $147.00 USD",
            link: "https://wa.me/50765461527?text=Hola,%20deseo%20comprar%20el%20SUPER%20PACK%20Laboral%20360%20($147.00%20USD)%20en%20Aizprua%20S.E.",
            icon: "shopping-bag",
            class: "bg-gradient-to-r from-brand-orange to-brand-orange-dark hover:brightness-110 text-white",
            isHotmart: false
        },
        detailButton: {
            text: "Consultar por WhatsApp",
            link: "https://wa.me/50765461527?text=Hola,%20tengo%20una%20consulta%20sobre%20el%20SUPER%20PACK%20Laboral%20360%20($147.00%20USD)",
            icon: "message-circle",
            iconClass: "text-emerald-500",
            class: "text-slate-500 hover:text-brand-blue"
        },
        keywords: "super pack laboral suite contratacion 360 contratos servicios profesionales indefinido definido obra determinada despido justificado amonestacion renuncia mutuo acuerdo finiquito mitradel panama word docx",
        featuredInHome: false
    },
    {
        id: "pack-duo-finanzas",
        title: "Pack dúo finanzas 360 (FinPulse + FinCore)",
        category: "finanzas",
        categoryLabel: "Finanzas & Flujo de Caja · Suite 360",
        delivery: "digital",
        price: 49.99,
        priceOld: "$99.99",
        priceDisplay: "$49.99",
        currency: "USD",
        discountBadge: "50% DCTO",
        guarantee: "Ahorra $50 USD",
        badgeLeft: { text: "Pack 2 en 1", class: "bg-brand-orange text-white" },
        badgeRight: { text: "Mejor Valor", class: "bg-emerald-600 text-white" },
        image: null,
        isCustomShowcase: true,
        customIcon: "layers",
        customTitle: "Pack Dúo Finanzas 360",
        customSubtitle: "FinPulse + FinCore Suite",
        alt: "Pack Dúo Finanzas 360",
        description: "La suite financiera definitiva para separar la plata personal de la del negocio, blindar tus flujos de caja y proyectar tu crecimiento con total claridad.",
        bullets: [
            "<strong>FinPulse + FinCore (.xlsx):</strong> Ambas herramientas completas con fórmulas avanzadas y listas para usar.",
            "<strong>Doble dashboard de proyecciones:</strong> Visualización ejecutiva de tus finanzas personales y empresariales en tiempo real.",
            "<strong>Tutoriales en video incluidos:</strong> Guías prácticas paso a paso para dominar ambas plataformas sin rodeos."
        ],
        buyButton: {
            text: "Comprar Pack Dúo por $49.99 USD",
            link: "https://wa.me/50765461527?text=Hola,%20deseo%20comprar%20el%20Pack%20D%C3%BAo%20Finanzas%20360%20(FinPulse%20+%20FinCore)%20por%20$49.99%20USD",
            icon: "shopping-bag",
            class: "bg-brand-blue hover:bg-brand-blue-dark text-white",
            isHotmart: false
        },
        detailButton: {
            text: "Consultar por WhatsApp",
            link: "https://wa.me/50765461527?text=Hola,%20tengo%20una%20consulta%20sobre%20el%20Pack%20D%C3%BAo%20Finanzas%20360%20($49.99%20USD)",
            icon: "message-circle",
            iconClass: "text-emerald-500",
            class: "text-slate-500 hover:text-brand-blue"
        },
        keywords: "pack duo finanzas 360 finpulse fincore plantilla excel finanzas personales finanzas del negocio flujo de caja proyeccion dashboard panama",
        featuredInHome: false
    },
    {
        id: "fincore",
        title: "FinCore · Sistema de finanzas del negocio",
        category: "finanzas",
        categoryLabel: "Finanzas Empresariales · Flujo de Caja",
        delivery: "digital",
        price: 34.99,
        priceOld: "$69.99",
        priceDisplay: "$34.99",
        currency: "USD",
        discountBadge: "50% DCTO",
        guarantee: "Garantía Aizprua",
        badgeLeft: { text: "Herramienta Pro", class: "bg-brand-blue text-white" },
        badgeRight: { text: "Descarga Inmediata", class: "bg-emerald-600 text-white" },
        image: null,
        isCustomShowcase: true,
        customIcon: "bar-chart-3",
        customTitle: "FinCore Business",
        customSubtitle: "Control Financiero Empresarial",
        alt: "FinCore Sistema de Finanzas Empresariales",
        description: "Control financiero empresarial completo: flujo de caja proyectado, cuentas por cobrar/pagar, punto de equilibrio y cálculo de margen de ganancia real.",
        bullets: [
            "<strong>Plantilla financiera empresarial (.xlsx):</strong> Flujo de caja diario, semanal y mensual con control de ingresos y egresos.",
            "<strong>Dashboard ejecutivo de proyección:</strong> Métricas de rentabilidad, alertas de liquidez y punto de equilibrio en tiempo real.",
            "<strong>Video tutorial de implementación:</strong> Guía práctica para proyectar tus números y tomar decisiones certeras."
        ],
        buyButton: {
            text: "Comprar FinCore por $34.99 USD",
            link: "https://wa.me/50765461527?text=Hola,%20deseo%20comprar%20FinCore%20(Finanzas%20del%20Negocio)%20por%20$34.99%20USD",
            icon: "shopping-bag",
            class: "bg-brand-blue hover:bg-brand-blue-dark text-white",
            isHotmart: false
        },
        detailButton: {
            text: "Consultar por WhatsApp",
            link: "https://wa.me/50765461527?text=Hola,%20tengo%20una%20consulta%20sobre%20FinCore%20($34.99%20USD)",
            icon: "message-circle",
            iconClass: "text-emerald-500",
            class: "text-slate-500 hover:text-brand-blue"
        },
        keywords: "fincore finanzas del negocio flujo de caja punto de equilibrio margen ganancia rentabilidad plantilla excel dashboard empresarial panama",
        featuredInHome: false
    },
    {
        id: "finpulse",
        title: "FinPulse · Sistema de finanzas personales",
        category: "finanzas",
        categoryLabel: "Finanzas Personales & Patrimonio",
        delivery: "digital",
        price: 24.99,
        priceOld: "$49.99",
        priceDisplay: "$24.99",
        currency: "USD",
        discountBadge: "50% DCTO",
        guarantee: "Garantía Aizprua",
        badgeLeft: { text: "Dashboard Visual", class: "bg-brand-orange text-white" },
        badgeRight: { text: "Descarga Inmediata", class: "bg-emerald-600 text-white" },
        image: null,
        isCustomShowcase: true,
        customIcon: "wallet",
        customTitle: "FinPulse Personal",
        customSubtitle: "Control Financiero Individual",
        alt: "FinPulse Sistema de Finanzas Personales",
        description: "Mucho más que un Excel: una herramienta integral para controlar tus ingresos, categorizar gastos, planificar metas de ahorro y monitorear tu patrimonio personal.",
        bullets: [
            "<strong>Plantilla inteligente automatizada (.xlsx):</strong> Registro de ingresos, gastos fijos y variables con cálculo automático.",
            "<strong>Dashboard interactivo de proyección:</strong> Gráficos visuales en tiempo real de liquidez, nivel de deuda y ahorro.",
            "<strong>Video tutorial paso a paso:</strong> Guía de uso para dominar la herramienta sin saber de contabilidad avanzada."
        ],
        buyButton: {
            text: "Comprar FinPulse por $24.99 USD",
            link: "https://wa.me/50765461527?text=Hola,%20deseo%20comprar%20FinPulse%20(Finanzas%20Personales)%20por%20$24.99%20USD",
            icon: "shopping-bag",
            class: "bg-brand-blue hover:bg-brand-blue-dark text-white",
            isHotmart: false
        },
        detailButton: {
            text: "Consultar por WhatsApp",
            link: "https://wa.me/50765461527?text=Hola,%20tengo%20una%20consulta%20sobre%20FinPulse%20($24.99%20USD)",
            icon: "message-circle",
            iconClass: "text-emerald-500",
            class: "text-slate-500 hover:text-brand-blue"
        },
        keywords: "finpulse finanzas personales ingresos gastos presupuesto ahorro patrimonio personal plantilla excel dashboard panama",
        featuredInHome: false
    },
    {
        id: "test-auditoria",
        title: "Test de auditoría empresarial (PDF)",
        category: "auditoria",
        categoryLabel: "Diagnóstico express",
        delivery: "free",
        price: 0.00,
        priceOld: null,
        priceDisplay: "GRATIS",
        currency: "USD",
        discountBadge: null,
        paymentNotice: "Acceso inmediato",
        homePaymentNotice: "Descarga directa",
        badgeLeft: { text: "Gratis ($0)", homeText: "Recurso gratuito", class: "bg-emerald-600 text-white" },
        badgeRight: { text: "En Línea", homeText: "En línea", class: "bg-slate-900 text-white" },
        image: null,
        isCustomShowcase: true,
        customIcon: "clipboard-check",
        customTitle: "Autodiagnóstico 15 puntos",
        customSubtitle: "100% Gratuito",
        customContainerClass: "bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50/70 border border-slate-200/80",
        customIconBgClass: "bg-emerald-100 text-emerald-700",
        alt: "Test de Auditoría Empresarial",
        description: "Semáforo de riesgo para evaluar tus áreas contable, legal y operativa en 3 minutos. Obtén tu diagnóstico y recomendaciones inmediatas.",
        bullets: [
            "<strong>Matriz semáforo:</strong> Evaluación en 15 puntos (Legal, Finanzas y Operaciones).",
            "<strong>Resultado inmediato:</strong> Conoce tu nivel de vulnerabilidad en 3 minutos.",
            "<strong>100% gratuito:</strong> Autoevaluación interactiva sin costo ni registro de tarjeta."
        ],
        buyButton: {
            text: "Hacer test en línea",
            homeText: "Hacer test en línea",
            link: "/test-interactivo",
            homeLink: "/test-interactivo",
            icon: "play",
            class: "bg-emerald-600 hover:bg-emerald-700 text-white",
            isHotmart: false
        },
        detailButton: {
            text: "Herramienta gratuita oficial Aizprua",
            icon: "zap",
            iconClass: "text-amber-500",
            isStaticBadge: true
        },
        keywords: "test auditoria express 15 puntos semaforo autodiagnostico gratis pdf",
        featuredInHome: true,
        homeOrder: 3,
        homeBorderHover: "hover:border-emerald-500",
        homeStagger: "stagger-3"
    },
    {
        id: "guia-anti-multas",
        title: "Las 7 multas ocultas en Panamá",
        category: "blindaje",
        categoryLabel: "Guía Anti-Sanciones",
        delivery: "free",
        price: 0.00,
        priceOld: null,
        priceDisplay: "GRATIS",
        currency: "USD",
        discountBadge: null,
        paymentNotice: "PDF Descargable",
        badgeLeft: { text: "Gratis ($0)", class: "bg-brand-orange text-white" },
        badgeRight: { text: "PDF 2026", class: "bg-slate-900 text-white" },
        image: "assets/guia-preventiva-cover.png",
        alt: "Las 7 Multas Ocultas en Panamá",
        fallbackTitle: "Guía Anti-Multas",
        fallbackIcon: "shield-alert",
        fallbackBadge: "Guía Gratuita ($0)",
        description: "Documento con las 7 sanciones más frecuentes que la DGI, CSS y MITRADEL aplican a las empresas y cómo blindar tus operaciones a tiempo.",
        bullets: [
            "<strong>Sanciones Críticas:</strong> Las multas más costosas de DGI, CSS y Mitradel.",
            "<strong>Casos Reales:</strong> Cómo evitar citaciones, embargos y multas de cierre.",
            "<strong>Guía Descargable:</strong> Formato PDF listo para lectura inmediata en móvil o PC."
        ],
        buyButton: {
            text: "Descargar Guía en PDF",
            link: "/recursos-gratuitos",
            icon: "download",
            class: "bg-slate-900 hover:bg-brand-blue text-white",
            isHotmart: false
        },
        detailButton: {
            text: "Sin costo · Descarga directa en 1 clic",
            icon: "shield",
            iconClass: "text-brand-orange",
            isStaticBadge: true
        },
        keywords: "guia anti multas 2026 dgi css mitradel sanciones panama pdf gratis",
        featuredInHome: false
    }
];

// Helper para compatibilidad con CommonJS / ES Modules / Navegador
if (typeof window !== "undefined") {
    window.AIZPRUA_PRODUCTS = AIZPRUA_PRODUCTS;
}

/**
 * ============================================================================
 * RENDERIZADO DEL SHOWCASE EN LA PÁGINA PRINCIPAL (principal.html)
 * ============================================================================
 * Renderiza los 3 productos destacados asegurando total simetría visual y
 * cumplimiento del sistema de diseño oficial de Aizprua S.E.
 */
function renderHomeFeaturedProducts(containerId = "home-featured-products-grid") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const featuredProducts = AIZPRUA_PRODUCTS
        .filter(p => p.featuredInHome)
        .sort((a, b) => (a.homeOrder || 99) - (b.homeOrder || 99));

    container.innerHTML = featuredProducts.map(product => {
        const borderHover = product.homeBorderHover || "hover:border-brand-blue";
        const staggerClass = product.homeStagger || "";
        const badgeLeftText = product.badgeLeft.homeText || product.badgeLeft.text;
        const badgeRightText = product.badgeRight.homeText || product.badgeRight.text;
        const buyBtnText = product.buyButton.homeText || product.buyButton.text;
        const buyBtnLink = product.buyButton.homeLink || product.buyButton.link;
        const paymentNotice = product.homePaymentNotice || product.paymentNotice || product.guarantee || "";

        // Showcase visual de portada
        let showcaseHTML = "";
        if (product.image) {
            showcaseHTML = `
                <div class="relative bg-slate-100 rounded-2xl overflow-hidden mb-5 aspect-[4/3] border border-slate-200/80">
                    <img src="${product.image}" alt="${product.alt}"
                        data-title="${product.fallbackTitle || product.title}"
                        data-icon="${product.fallbackIcon || 'package'}"
                        data-badge="${product.fallbackBadge || 'Oficial'}"
                        onerror="handleProductImageError(this)"
                        class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                    <span class="absolute top-3 left-3 ${product.badgeLeft.class} text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md">
                        ${badgeLeftText}
                    </span>
                    <span class="absolute top-3 right-3 ${product.badgeRight.class} text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md">
                        ${badgeRightText}
                    </span>
                </div>
            `;
        } else {
            // Showcase visual con icono en relieve para autodiagnósticos o tests
            const customBg = product.customContainerClass || "bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50/70 border-emerald-100";
            const customIconBg = product.customIconBgClass || "bg-emerald-100 text-emerald-600";
            showcaseHTML = `
                <div class="relative ${customBg} rounded-2xl overflow-hidden mb-5 aspect-[4/3] flex items-center justify-center p-4 border text-center">
                    <div class="space-y-1">
                        <div class="w-12 h-12 rounded-xl ${customIconBg} mx-auto flex items-center justify-center shadow-xs">
                            <i data-lucide="${product.customIcon || 'clipboard-check'}" class="w-7 h-7"></i>
                        </div>
                        <span class="text-xs font-bold text-slate-800 block">${product.customTitle || ''}</span>
                        <span class="text-[10px] text-emerald-600 font-bold block">${product.customSubtitle || ''}</span>
                    </div>
                    <span class="absolute top-3 left-3 ${product.badgeLeft.class} text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-xs">
                        ${badgeLeftText}
                    </span>
                    <span class="absolute top-3 right-3 ${product.badgeRight.class} text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-xs">
                        ${badgeRightText}
                    </span>
                </div>
            `;
        }

        // Bloque de precios
        let priceBlockHTML = "";
        if (product.price === 0) {
            priceBlockHTML = `
                <div class="flex items-baseline justify-between pt-4 border-t border-slate-200 mb-4">
                    <div>
                        <span class="text-2xl font-black text-emerald-600">GRATIS</span>
                    </div>
                    <span class="text-xs font-bold text-slate-500">${paymentNotice}</span>
                </div>
            `;
        } else {
            const oldPriceHTML = product.priceOld ? `<span class="text-xs text-slate-400 line-through mr-1">${product.priceOld}</span>` : "";
            const discountBadgeHTML = product.homeDiscountBadge
                ? `<span class="text-[10px] font-black text-brand-orange bg-orange-100 px-2 py-0.5 rounded-md ml-1">${product.homeDiscountBadge}</span>`
                : (product.discountBadge ? `<span class="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md ml-1">${product.discountBadge}</span>` : "");
            
            const rightNoticeClass = product.guarantee ? "text-emerald-600" : "text-slate-500";

            priceBlockHTML = `
                <div class="flex items-baseline justify-between pt-4 border-t border-slate-200 mb-4">
                    <div class="flex items-baseline gap-1">
                        ${oldPriceHTML}
                        <span class="text-2xl font-black text-slate-900">${product.priceDisplay}</span>
                        <span class="text-[11px] font-bold text-slate-500">${product.currency}</span>
                        ${discountBadgeHTML}
                    </div>
                    <span class="text-xs font-bold ${rightNoticeClass}">${paymentNotice}</span>
                </div>
            `;
        }

        // Botón CTA
        const hotmartClass = product.buyButton.isHotmart ? 'hotmart-fb ' : '';
        const homeBuyExternal = buyBtnLink.startsWith("http") ? 'target="_blank" rel="noopener"' : '';

        return `
            <!-- PRODUCTO: ${product.title.toUpperCase()} -->
            <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between ${borderHover} hover:shadow-lg transition group reveal-on-scroll ${staggerClass}">
                <div>
                    ${showcaseHTML}
                    <h4 class="text-lg font-black text-slate-900 mb-1">${product.title}</h4>
                    <p class="text-xs text-slate-600 mb-4 leading-relaxed">
                        ${product.description}
                    </p>
                </div>
                <div>
                    ${priceBlockHTML}
                    <a href="${buyBtnLink}" ${homeBuyExternal}
                        class="${hotmartClass}w-full inline-flex items-center justify-center gap-2 py-3 ${product.buyButton.class} rounded-xl text-xs sm:text-sm font-bold transition shadow">
                        <i data-lucide="${product.buyButton.icon}" class="w-4 h-4"></i>
                        <span>${buyBtnText}</span>
                    </a>
                </div>
            </div>
        `;
    }).join("");

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
}

/**
 * ============================================================================
 * RENDERIZADO DEL CATÁLOGO EN LA TIENDA ONLINE (tienda.html)
 * ============================================================================
 * Renderiza todas las tarjetas con clases estandarizadas de altura fija
 * anti-descuadre, entregables en bullets y atributos de filtrado dinámico.
 */
function renderShopProducts(containerId = "products-grid") {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = AIZPRUA_PRODUCTS.map(product => {
        const badgeLeft = product.badgeLeft;
        const badgeRight = product.badgeRight;

        // Showcase visual de portada para catálogo de tienda
        let showcaseHTML = "";
        if (product.image) {
            let colorPillHTML = "";
            let imgIdAttr = "";
            if (product.colorImages) {
                const imgElementId = (product.id === "sueter-metodo-4e") ? "hoodie-cover-img" : `${product.id}-cover-img`;
                const labelElementId = (product.id === "sueter-metodo-4e") ? "hoodie-color-label" : `${product.id}-color-label`;
                imgIdAttr = `id="${imgElementId}" `;

                colorPillHTML = `
                    <!-- Selector de Color Interactivo Dual (Azul Principal / Negro) -->
                    <div class="absolute bottom-2.5 left-2.5 z-20 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-lg">
                        <span class="text-[9px] font-bold text-white uppercase tracking-wider">Color:</span>
                        <button type="button" onclick="selectProductColor('${product.id}', 'azul', this)" title="Azul Corporativo (Principal)"
                            class="color-choice-btn hoodie-color-btn active w-4 h-4 rounded-full bg-brand-blue ring-2 ring-white cursor-pointer transition hover:scale-110 active:scale-95 shadow-xs"></button>
                        <button type="button" onclick="selectProductColor('${product.id}', 'negro', this)" title="Negro Carbón (Black Edition)"
                            class="color-choice-btn hoodie-color-btn w-4 h-4 rounded-full bg-slate-900 border border-slate-600 ring-1 ring-transparent hover:ring-white/50 cursor-pointer transition hover:scale-110 active:scale-95 shadow-xs"></button>
                        <span id="${labelElementId}" class="text-[9px] font-black text-blue-200 ml-0.5">Azul</span>
                    </div>
                `;
            }

            showcaseHTML = `
                <div class="relative bg-slate-100 rounded-2xl overflow-hidden mb-4 aspect-[4/3] border border-slate-200/80">
                    <img ${imgIdAttr}src="${product.image}" alt="${product.alt}"
                        data-title="${product.fallbackTitle || product.title}"
                        data-icon="${product.fallbackIcon || 'package'}"
                        data-badge="${product.fallbackBadge || 'Oficial'}"
                        onerror="handleProductImageError(this)"
                        class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                    <span class="absolute top-3 left-3 ${badgeLeft.class} text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md z-10">
                        ${badgeLeft.text}
                    </span>
                    <span class="absolute top-3 right-3 ${badgeRight.class} text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md z-10">
                        ${badgeRight.text}
                    </span>
                    ${colorPillHTML}
                </div>
            `;
        } else {
            // Showcase de código institucional para packs digitales sin foto
            const customBg = product.customContainerClass || "bg-gradient-to-br from-slate-900 via-slate-800 to-brand-blue-dark border-slate-700/60 shadow-inner";
            const customIconBg = product.customIconBgClass || "bg-white/10 backdrop-blur-md border border-white/20 text-brand-orange";
            const iconColor = (product.id === "test-auditoria") ? "text-emerald-700" : "text-brand-orange";
            const titleColor = (product.id === "test-auditoria") ? "text-slate-800" : "text-white";
            const subtitleColor = (product.id === "test-auditoria") ? "text-emerald-600" : "text-brand-orange-light";

            showcaseHTML = `
                <div class="relative ${customBg} rounded-2xl overflow-hidden mb-4 aspect-[4/3] flex items-center justify-center p-4 border">
                    <div class="text-center p-3">
                        <div class="w-14 h-14 rounded-2xl ${customIconBg} mx-auto flex items-center justify-center mb-2 shadow-lg">
                            <i data-lucide="${product.customIcon || 'package'}" class="w-8 h-8 ${iconColor}"></i>
                        </div>
                        <span class="text-xs font-bold ${titleColor} block leading-tight">${product.customTitle || ''}</span>
                        <span class="text-[10px] ${subtitleColor} font-bold block mt-0.5">${product.customSubtitle || ''}</span>
                    </div>
                    <span class="absolute top-3 left-3 ${badgeLeft.class} text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-xs">
                        ${badgeLeft.text}
                    </span>
                    <span class="absolute top-3 right-3 ${badgeRight.class} text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-xs">
                        ${badgeRight.text}
                    </span>
                </div>
            `;
        }

        // 3 Bullets de entregables estandarizados
        const bulletsHTML = (product.bullets || []).map(b => `
            <div class="flex items-start gap-2 text-xs text-slate-700 font-medium">
                <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"></i>
                <span class="leading-snug">${b}</span>
            </div>
        `).join("");

        // Bloque de precios y garantía
        let priceAreaHTML = "";
        if (product.price === 0) {
            priceAreaHTML = `
                <div class="flex items-center justify-between min-h-[2.5rem]">
                    <div class="flex items-baseline gap-1.5">
                        <span class="text-2xl font-black ${product.id === 'test-auditoria' ? 'text-emerald-600' : 'text-brand-orange'}">GRATIS</span>
                        <span class="text-[10px] font-bold text-slate-500">USD</span>
                    </div>
                    <span class="text-xs font-bold text-slate-500 whitespace-nowrap">${product.paymentNotice || 'Acceso inmediato'}</span>
                </div>
            `;
        } else {
            const oldPriceHTML = product.priceOld ? `<span class="text-xs text-slate-400 line-through mr-1">${product.priceOld}</span>` : "";
            const badgeClass = product.discountBadgeClass || "text-emerald-700 bg-emerald-100";
            const discountBadgeDesktop = product.discountBadge
                ? `<span class="hidden sm:inline-block text-[10px] font-black ${badgeClass} px-2 py-0.5 rounded-md ml-1 whitespace-nowrap">${product.discountBadge}</span>`
                : "";
            const discountBadgeMobile = product.discountBadge
                ? `<span class="inline-block sm:hidden text-[10px] font-black ${badgeClass} px-2 py-0.5 rounded-md whitespace-nowrap">${product.discountBadge}</span>`
                : "";
            const guaranteeHTML = product.guarantee
                ? `<span class="text-xs font-bold text-emerald-600 whitespace-nowrap">${product.guarantee}</span>`
                : `<span class="text-xs font-bold text-slate-500 whitespace-nowrap">${product.paymentNotice || 'Yappy / Tarjeta'}</span>`;

            priceAreaHTML = `
                <div class="flex items-center justify-between min-h-[2.5rem] gap-2">
                    <div class="flex items-baseline gap-1.5 shrink-0">
                        ${oldPriceHTML}
                        <span class="text-2xl font-black text-slate-900">${product.priceDisplay}</span>
                        <span class="text-[10px] font-bold text-slate-500">USD</span>
                        ${discountBadgeDesktop}
                    </div>
                    <div class="flex flex-col sm:flex-row items-end sm:items-baseline gap-0.5 sm:gap-2 text-right shrink-0">
                        ${discountBadgeMobile}
                        ${guaranteeHTML}
                    </div>
                </div>
            `;
        }

        // Botón Secundario o Badge de Detalle
        let detailAreaHTML = "";
        if (product.detailButton) {
            if (product.detailButton.isStaticBadge) {
                detailAreaHTML = `
                    <span class="w-full inline-flex items-center justify-center gap-1.5 py-1 text-xs font-bold text-slate-400">
                        <i data-lucide="${product.detailButton.icon || 'zap'}" class="w-3.5 h-3.5 ${product.detailButton.iconClass || 'text-amber-500'}"></i>
                        <span>${product.detailButton.text}</span>
                    </span>
                `;
            } else {
                const btnClass = product.detailButton.class || "text-brand-blue hover:text-brand-blue-dark hover:underline";
                const isExternal = product.detailButton.link && product.detailButton.link.startsWith("http");
                const targetAttrs = isExternal ? 'target="_blank" rel="noopener"' : '';
                detailAreaHTML = `
                    <a href="${product.detailButton.link}" ${targetAttrs}
                        class="w-full inline-flex items-center justify-center gap-1.5 py-1 text-xs font-bold ${btnClass} transition">
                        ${product.detailButton.icon && product.detailButton.icon !== 'arrow-right' ? `<i data-lucide="${product.detailButton.icon}" class="w-3.5 h-3.5 ${product.detailButton.iconClass || ''}"></i>` : ''}
                        <span>${product.detailButton.text}</span>
                        ${product.detailButton.icon === 'arrow-right' ? `<i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>` : ''}
                    </a>
                `;
            }
        }

        // Botón Principal
        const hotmartClass = product.buyButton.isHotmart ? 'hotmart-fb ' : '';
        const buyExternal = product.buyButton.link.startsWith("http") ? 'target="_blank" rel="noopener"' : '';
        
        let buyBtnIdAttr = "";
        let buyTextIdAttr = "";
        if (product.colorImages) {
            const btnId = (product.id === "sueter-metodo-4e") ? "hoodie-buy-btn" : `${product.id}-buy-btn`;
            const textId = (product.id === "sueter-metodo-4e") ? "hoodie-buy-text" : `${product.id}-buy-text`;
            buyBtnIdAttr = `id="${btnId}" `;
            buyTextIdAttr = `id="${textId}"`;
        }

        return `
            <!-- PRODUCTO: ${product.title.toUpperCase()} -->
            <div class="product-card bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition group h-full"
                data-delivery="${product.delivery}" data-category="${product.category}" data-price="${product.price}" data-keywords="${product.keywords}">
                <div class="flex-1 flex flex-col">
                    ${showcaseHTML}

                    <span class="text-[10px] font-black uppercase tracking-wider ${product.delivery === 'physical' ? 'text-brand-orange' : (product.price === 0 ? 'text-emerald-600' : 'text-brand-blue')} block min-h-[1.25rem]">${product.categoryLabel}</span>
                    <h3 class="text-base sm:text-lg font-black text-slate-900 mt-1 mb-2 min-h-[3.25rem] flex items-center leading-snug">
                        ${product.title}
                    </h3>
                    <p class="text-xs text-slate-600 mb-4 leading-relaxed min-h-[3.75rem] flex items-start">
                        ${product.description}
                    </p>

                    <!-- Entregables Principales (3 Bullets Estandarizados) -->
                    <div class="space-y-2 mb-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 min-h-[8.5rem] flex flex-col justify-center">
                        ${bulletsHTML}
                    </div>
                </div>

                <!-- Bloque Inferior / Acciones (Altura Estandarizada) -->
                <div class="pt-4 border-t border-slate-100 space-y-2.5 mt-auto">
                    ${priceAreaHTML}

                    <div class="min-h-[5.5rem] flex flex-col justify-end space-y-2">
                        <a ${buyBtnIdAttr}href="${product.buyButton.link}" ${buyExternal}
                            class="${hotmartClass}w-full inline-flex items-center justify-center gap-2 py-3 ${product.buyButton.class} rounded-xl text-xs sm:text-sm font-bold transition shadow hover:shadow-md">
                            <i data-lucide="${product.buyButton.icon}" class="w-4 h-4"></i>
                            <span ${buyTextIdAttr}>${product.buyButton.text}</span>
                        </a>

                        ${detailAreaHTML}
                    </div>
                </div>
            </div>
        `;
    }).join("");

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
}

/**
 * Selector de Color Interactivo Multi-Producto (Hoodie Método 4E, Taza Método 4E, etc.)
 * Sincroniza imagen de portada, badge indicador y mensaje de compra por WhatsApp
 */
function selectProductColor(productId, color, btn) {
    const isHoodie = (productId === 'sueter-metodo-4e');
    const imgId = isHoodie ? 'hoodie-cover-img' : `${productId}-cover-img`;
    const labelId = isHoodie ? 'hoodie-color-label' : `${productId}-color-label`;
    const buyBtnId = isHoodie ? 'hoodie-buy-btn' : `${productId}-buy-btn`;
    const buyTextId = isHoodie ? 'hoodie-buy-text' : `${productId}-buy-text`;

    const img = document.getElementById(imgId);
    const label = document.getElementById(labelId);
    const buyBtn = document.getElementById(buyBtnId);
    const buyText = document.getElementById(buyTextId);

    // Resaltar únicamente los botones de la tarjeta actual
    const card = btn ? btn.closest('.product-card') : null;
    const buttons = card ? card.querySelectorAll('.color-choice-btn, .hoodie-color-btn') : document.querySelectorAll('.color-choice-btn');

    buttons.forEach(b => {
        b.classList.remove('active');
        b.classList.remove('ring-2', 'ring-white');
        b.classList.add('ring-1', 'ring-transparent');
    });
    if (btn) {
        btn.classList.add('ring-2', 'ring-white');
        btn.classList.remove('ring-1', 'ring-transparent');
    }

    if (!img) return;

    img.style.transition = 'opacity 0.18s ease';
    img.style.opacity = '0.35';

    setTimeout(() => {
        if (productId === 'sueter-metodo-4e') {
            if (color === 'azul') {
                img.src = 'assets/sueter-metodo-4e-azul.jpg';
                img.alt = 'Hoodie Suéter Oficial Método 4E Aizprua Edición Azul';
                if (label) {
                    label.innerText = 'Azul';
                    label.className = 'text-[9px] font-black text-blue-200 ml-0.5';
                }
                if (buyBtn) buyBtn.href = "https://wa.me/50765461527?text=Hola,%20deseo%20pedir%20el%20Hoodie%20Oficial%20del%20M%C3%A9todo%204E%20en%20Color%20Azul%20($38.00%20USD)%20con%20env%C3%ADo%20en%20Panam%C3%A1";
                if (buyText) buyText.innerText = "Pedir Hoodie Azul por $38.00 USD";
            } else {
                img.src = 'assets/sueter-metodo-4e-negro.jpg';
                img.alt = 'Hoodie Suéter Oficial Método 4E Aizprua Edición Negra';
                if (label) {
                    label.innerText = 'Negro';
                    label.className = 'text-[9px] font-black text-slate-300 ml-0.5';
                }
                if (buyBtn) buyBtn.href = "https://wa.me/50765461527?text=Hola,%20deseo%20pedir%20el%20Hoodie%20Oficial%20del%20M%C3%A9todo%204E%20en%20Color%20Negro%20($38.00%20USD)%20con%20env%C3%ADo%20en%20Panam%C3%A1";
                if (buyText) buyText.innerText = "Pedir Hoodie Negro por $38.00 USD";
            }
        } else if (productId === 'taza-metodo-4e') {
            if (color === 'azul') {
                img.src = 'assets/taza-metodo-4e-azul.jpg';
                img.alt = 'Taza Oficial Método 4E Aizprua Edición Azul';
                if (label) {
                    label.innerText = 'Azul';
                    label.className = 'text-[9px] font-black text-blue-200 ml-0.5';
                }
                if (buyBtn) buyBtn.href = "https://wa.me/50765461527?text=Hola,%20deseo%20pedir%20la%20Taza%20Oficial%20del%20M%C3%A9todo%204E%20en%20Color%20Azul%20($14.00%20USD)%20con%20env%C3%ADo%20en%20Panam%C3%A1";
                if (buyText) buyText.innerText = "Pedir Taza Azul por $14.00 USD";
            } else {
                img.src = 'assets/taza-metodo-4e-negro.jpg';
                img.alt = 'Taza Oficial Método 4E Aizprua Edición Negra';
                if (label) {
                    label.innerText = 'Negro';
                    label.className = 'text-[9px] font-black text-slate-300 ml-0.5';
                }
                if (buyBtn) buyBtn.href = "https://wa.me/50765461527?text=Hola,%20deseo%20pedir%20la%20Taza%20Oficial%20del%20M%C3%A9todo%204E%20en%20Color%20Negro%20($14.00%20USD)%20con%20env%C3%ADo%20en%20Panam%C3%A1";
                if (buyText) buyText.innerText = "Pedir Taza Negra por $14.00 USD";
            }
        }
        img.style.opacity = '1';
    }, 160);
}

// Alias retrocompatible
function selectHoodieColor(color, btn) {
    selectProductColor('sueter-metodo-4e', color, btn);
}

if (typeof window !== "undefined") {
    window.selectProductColor = selectProductColor;
    window.selectHoodieColor = selectHoodieColor;
}
