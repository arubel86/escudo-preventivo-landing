# 📋 Reglas de Desarrollo & Email Marketing (Aizprua S.E.)

## ✉️ Regla Estricta de Correo Electrónico (MailerLite)
* **MANDATO OBLIGATORIO:** En TODO diseño, plantilla o código HTML de correo electrónico, es **estrictamente obligatorio** incluir el enlace de desuscripción de MailerLite utilizando la variable exacta:
  `{$unsubscribe}`
  
  Ejemplo canónico en el footer:
  ```html
  <p style="font-size: 11px; color: #64748B; margin-top: 8px;">
      Si ya no deseas recibir nuestros correos, puedes 
      <a href="{$unsubscribe}" style="color: #94A3B8; text-decoration: underline;">cancelar tu suscripción aquí</a>.
  </p>
  ```
* **PROHIBICIÓN:** Bajo ninguna circunstancia se debe generar o entregar un correo HTML sin la etiqueta `{$unsubscribe}`. Esto garantiza cumplimiento legal antispam y evita bloqueos al guardar en MailerLite.

## 🎨 Regla de Consistencia de Marca & Sistema de Diseño
* **MANDATO OBLIGATORIO:** Cualquier página web nueva, modificación de interfaz, encabezado (header) o pie de página (footer) dentro del proyecto **Escudo Preventivo** debe seguir de forma estricta las medidas, clases de Tailwind, colores y estructura definidos en el archivo maestro:
  `DESIGN_SYSTEM.md`
* **PALETA DE COLOR OFICIAL ESTRICTA:**
  - Azul Corporativo: `brand-blue: #3849C8`, `brand-blue-dark: #2D3A9F`, `brand-blue-light: #4F5ED4`
  - Naranja de Conversión / Acento: `brand-orange: #FF8A1E`, `brand-orange-dark: #E67A15`, `brand-orange-light: #FFA04A`
* **PROHIBICIÓN ESTRICTA:** Queda terminantemente prohibido usar gradientes o luces ambientales con tintes violetas, púrpuras, amarillos chillones o verdes que desentonen de la identidad corporativa. La barra de navegación debe tener altura estandarizada de **`h-20` (80px)** y el logotipo **`h-28`** centrado (`h-20` en footer) para evitar barras sobredimensionadas.
* **BARRA DE PROGRESO DE LECTURA CANÓNICA:** Toda página del sitio debe incluir obligatoriamente la barra de lectura interactiva `#progress-bar` configurada estrictamente con el naranja corporativo:  
  `class="fixed top-0 left-0 h-1 bg-brand-orange z-[60] transition-all duration-75" style="width:0%"`  
  Queda prohibido usar degradados cruzados de azul a naranja (`from-brand-blue to-brand-orange`) en la barra para evitar zonas intermedias violetas o púrpuras.

## 📚 Regla de Estructura Editorial & SEO para Artículos de Blog
* **MANDATO OBLIGATORIO:** Todo artículo nuevo o editado en el blog de Aizprua S.E. debe implementar obligatoriamente la arquitectura canónica de alta retención, diseño premium y conversión basada en la plantilla maestra (`articulo-emprender.html` y `plantilla-articulo.html`):

### 🏗️ Secuencia Estructural Obligatoria (Los 15 Componentes en Orden Estricto):
1. **Header Canónico Oficial:** Barra superior de anuncios (`#announcement-bar`) con cupos en naranja y Navbar estandarizada (`h-20` / 80px) con logotipo (`h-28` / 112px) y botón WhatsApp.
2. **Barra de Progreso de Lectura:** `#progress-bar` en naranja de marca (`bg-brand-orange`, `h-1`, `fixed top-0 left-0 z-[60]`).
3. **Contenedor Principal de 2 Columnas (Flex):**
   - `main.flex-grow.py-8.sm:py-12.px-4.sm:px-6.lg:px-8.max-w-7xl.mx-auto.w-full`
   - `div.flex.flex-col.lg:flex-row.gap-8.lg:gap-12.items-start.relative`
4. **Columna Izquierda (Sidebar TOC Flotante):**
   - `aside#guideSidebar.hidden.lg:block.w-72.flex-shrink-0.sticky.top-36.max-h-[calc(100vh-10rem)].overflow-y-auto.custom-scroll.pr-2`
   - Encabezado `Contenido del Artículo` y lista numerada: `01. Introducción`, `02. Resumen Ejecutivo (TL;DR)`, `03. Punto 1...`, etc. Con clases `.nav-doc-link` y `.dot-indicator` sincronizados con Scrollspy.
5. **Columna Derecha (Cuerpo Editorial):**
   - `div.flex-1.min-w-0.max-w-3xl`
   - **5.1. Migas de Pan (Breadcrumbs):** `Inicio / Blog / [Categoría]` con enlaces funcionales.
   - **5.2. Píldora de Categoría:** `bg-brand-orange/10 text-brand-orange px-3.5 py-1 rounded-full border border-brand-orange/20` con texto en mayúsculas pequeñas.
   - **5.3. Título Principal (`<h1>`):** Estilo Natural en Español (Sentence Case): solo la primera letra del título y nombres propios o siglas en mayúscula (`text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight`). Evitar mayúsculas en cada palabra.
   - **5.4. Barra de Autor & Metadatos:**
     - Avatar circular de Arubel (`assets/avatar-arubel.jpg`, `w-8 h-8 rounded-full border border-brand-blue/30`).
     - Nombre: `Arubel Aizprua` (bold).
     - Píldora de tiempo estimado de lectura: `bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-full font-bold`.
     - Edición: `Edición Panamá 2026`.
     - 4 Botones de compartir: WhatsApp (`#25D366`), LinkedIn (`#0A66C2`), X (Twitter) y botón Copiar Enlace con feedback `¡Copiado!`.
   - **5.5. Imagen de Portada:** Proporción oficial `654 x 315 px`, esquinas `rounded-3xl overflow-hidden shadow-lg border border-slate-200`, con marca de agua discreta de 10px `AIZPRUA S.E.` abajo a la derecha.
   - **5.6. Introducción Inicial:** Gancho editorial claro con tipografía legible y párrafo introductorio de alto impacto (`text-base sm:text-lg`).
   - **5.7. Resumen Ejecutivo (TL;DR) en 3 Tarjetas:**
     - Contenedor destacado `bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs`.
     - Título con badge "Resumen Ejecutivo (TL;DR) en 30 segundos".
     - Cuadrícula de 3 columnas (`grid sm:grid-cols-3 gap-4`) con 3 tarjetas blancas (`bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs`) destacando los 3 aprendizajes clave.
   - **5.8. Secciones Numéricas de Contenido:**
     - Encabezados con badges circulares alineados: contenedor `flex items-start gap-3`, badge circular `shrink-0 w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm`, y título con `leading-8 m-0`.
     - Callouts destacados de principios legales / alertas DGI / Mitradel con iconos Lucide.
   - **5.9. Tabla Comparativa de Alto Impacto:** Tabla responsiva estructurada que contraste situaciones reales (ej. *Negocio Informal en Riesgo vs. Negocio Blindado con Escudo Preventivo*).
   - **5.10. Lead Magnet & Conversión Temático:** Banner oscuro `bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl` con mockup 3D y botón CTA directo alineado 100% al tema del artículo.
   - **5.11. Acordeón de Preguntas Frecuentes (FAQ):** Mínimo 3 a 5 preguntas directas en elementos `<details class="group bg-white rounded-2xl border border-slate-200 p-4 open:shadow-md">`.
   - **5.12. Barra Inferior de Compartir:** Recuadro `bg-slate-100/80` con botones de WhatsApp y Copiar Enlace.
   - **5.13. Ficha de Autor Inferior:** Tarjeta blanca `rounded-3xl` con foto de Arubel, cargo de fundador, biografía y enlace directo de WhatsApp.
   - **5.14. Artículos Recomendados (Serie Dinámica):** Cuadrícula `#recommended-articles-grid` (`grid grid-cols-1 sm:grid-cols-2 gap-6`) alimentada dinámicamente mediante `blog-recommendations.js` con exactamente 2 tarjetas por serie temática de lectura, auto-excluyendo el artículo actual y con títulos en estilo natural en español (Sentence Case).
6. **Footer Canónico Oficial:** 4 columnas (Marca/Redes, Soluciones, Contacto, Legal) + Copyright 2026.
7. **Botones Flotantes:** Volver arriba (`#scroll-top-btn`) + Botón flotante de WhatsApp.
8. **Scripts Oficiales:** Lucide icons, barra de lectura scroll, scroll to top, copiar enlace, scrollspy en sidebar TOC y `blog-recommendations.js`.


## 📐 Regla de Alineación Infalible de Badges, Números e Iconos en Encabezados y Listas
* **MANDATO OBLIGATORIO:** En todo componente, tarjeta, sección o lista donde un número, badge circular o icono vectorial (como checkmarks en bullets) acompañe a un encabezado (`<h1>` a `<h6>`) o texto multilínea:
  1. **Contenedor:** Debe utilizar OBLIGATORIAMENTE `flex items-start gap-2.5` (o `gap-3`).
  2. **Badge / Icono:** Debe incluir `shrink-0` (o `flex-shrink-0`), dimensiones fijas (ej. `w-4 h-4` con `mt-0.5` para bullets de texto, o `w-8 h-8` centrado internamente para números de encabezado).
  3. **Texto / Encabezado:** Debe tener alineación y line-height armónico (`leading-snug` o `leading-8`).
* **PROHIBICIÓN ESTRICTA:** Queda terminantemente prohibido usar `flex items-center` en contenedores de títulos o listas cuyos textos puedan saltar a dos o más líneas en dispositivos móviles o pantallas estrechas. Esto previene que el icono o número quede flotando en medio de las líneas de texto.
* **BOTONES DE CONVERSIÓN EN LEAD MAGNETS:** Los botones CTA dobles en banners de lead magnet deben llevar obligatoriamente `w-full sm:w-auto whitespace-nowrap shrink-0` para prevenir que el texto se parta en dos líneas y desplace los iconos lateralmente.

## 🖼️ Regla de Medidas, Proporciones y Portadas de Blog
* **MANDATO OBLIGATORIO DE DIMENSIONES:**
  1. **Portadas Horizontales Oficiales:** Proporción nativa de **`654 x 315 px`** (Aspect ratio: `aspect-[654/315]` o `2.076:1`).
  2. **Contenedor en Cards (`blog.html`):** Debe configurarse OBLIGATORIAMENTE con `relative aspect-[654/315] bg-slate-900 overflow-hidden` y la imagen con `w-full h-full object-cover group-hover:scale-105 transition duration-500`. Esto previene que se corten marcas de agua, textos o elementos superiores/inferiores.
  3. **Portadas Verticales / Mockups (Libros o Guías 1:1 / 3:4):** Deben utilizar OBLIGATORIAMENTE el formato *Showcase Ambiental*:
     ```html
     <div class="relative aspect-[16/9] bg-slate-950 overflow-hidden flex items-center justify-center p-3">
         <img src="..." class="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-125 pointer-events-none">
         <div class="absolute inset-0 bg-slate-950/40 pointer-events-none"></div>
         <img src="..." class="relative z-10 max-h-full w-auto object-contain rounded-xl shadow-2xl group-hover:scale-105 transition duration-500">
     </div>
     ```
* **PROHIBICIÓN ESTRICTA:** Queda terminantemente prohibido sobreponer badges o píldoras (`<span>`) en esquinas de tarjetas si la imagen original ya cuenta con textos, títulos o números en esa misma zona (ej. número «5» en mentalidad).

## 📌 Regla de Arquitectura de Barra Lateral (Sidebar TOC)
* **MANDATO OBLIGATORIO:**
  1. **Exclusividad del Índice:** La barra lateral sticky izquierda (`#guideSidebar`) debe albergar **ÚNICAMENTE** la lista de contenidos (`Contenido del Artículo`).
  2. **Espaciado Canónico Anti-Recorte:** Los enlaces `.nav-doc-link` deben utilizar `px-3 py-1.5 text-xs` con contenedor `space-y-0.5`. Esto asegura que los 13 enlaces quepan holgadamente en cualquier pantalla de laptop de 13" a 16" sin desbordarse.
  3. **Scrollbar Invisible:** Ocultar siempre la barra de scroll nativa con `::-webkit-scrollbar { display: none; }` y `scrollbar-width: none;`.
* **PROHIBICIÓN ESTRICTA:** Queda terminantemente prohibido colocar tarjetas de conversión secundarias o banners de venta al final del `#guideSidebar` cuando el índice tenga más de 6 elementos, para evitar que queden cortadas por la mitad en la parte inferior de la pantalla.

## 🔤 Regla de Capitalización de Títulos de Blog (Estilo Natural en Español / Sentence Case)
* **MANDATO OBLIGATORIO:** En TODO título de artículo de blog (`<h1>`, tarjetas en `blog.html`, metatags `<title>`, enlaces en "Artículos Recomendados" y widgets):
  1. **Estilo Natural en Español (Sentence Case):** Utilizar mayúscula inicial únicamente al principio de la oración y en nombres propios o siglas institucionales (ej. *Panamá*, *DGI*, *CSS*, *APC*). Queda terminantemente prohibido aplicar "Title Case" inglés (poner mayúscula en cada palabra) para evitar sobrecarga visual anti-natural.
  2. **Títulos que Inician con Números:** Si el título inicia con una cifra numérica (ej. *«5 consejos para...»*, *«4 errores fatales...»*, *«Las 7 multas ocultas...»*), la palabra que le sigue y el resto de la frase se escriben en minúsculas, salvo nombres propios o siglas.

## 📐 Regla de Tarjetas de Catálogo y Tienda Online con Altura Idéntica Infalible (Anti-Descuadre)
* **MANDATO OBLIGATORIO:** En cualquier grilla de catálogo de productos o soluciones (`tienda.html` o listados de compra):
  1. **Contenedor Principal de Tarjeta:** Debe incluir obligatoriamente `h-full flex flex-col justify-between`.
  2. **Cuerpo Superior (`.card-body`):** Debe llevar `flex-1 flex flex-col` para absorber el espacio disponible.
  3. **Showcase Visual:** Aspect ratio estándar bloqueado (`aspect-[4/3]`) con la imagen centrada y `max-h-[175px]`.
  4. **Categoría / Pill:** Altura mínima fija `min-h-[1.25rem]`.
  5. **Título (`<h3>`):** Altura mínima fija `min-h-[3.25rem] flex items-center leading-snug` para que títulos de 1 o 2 líneas mantengan exactamente el mismo punto de partida del texto inferior.
  6. **Párrafo Descriptivo:** Altura mínima fija `min-h-[3.75rem] flex items-start text-xs text-slate-600 leading-relaxed`.
  7. **Caja de Entregables:** Mismo número de elementos (exactamente 3 bullets) con contenedor estandarizado `space-y-2 mb-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 min-h-[8.5rem] flex flex-col justify-center`.
  8. **Bloque Inferior / Acciones:** Con `mt-auto`, contenedor de precio con `min-h-[2rem]` y contenedor de botones de acción con altura mínima fija `min-h-[5.5rem] flex flex-col justify-end space-y-2` (botón principal de compra + enlace o badge secundario alineado).
  9. **Paginación Canónica de Catálogo:** Configurada con paginación dinámica (`PRODUCTS_PER_PAGE = 4`, exactamente 2 filas de 2 columnas en desktop/tablet) sincronizada en tiempo real con los filtros laterales y el buscador, con scroll suave automático (`#products-grid` con `scroll-mt-28`).
* **PROHIBICIÓN ESTRICTA:** Queda terminantemente prohibido mezclar tarjetas con y sin cajas de entregables en la misma grilla, o dejar títulos y botones con alturas fluidas variables sin `min-h`, previniendo que los botones de compra queden desnivelados entre columnas.

## 🛡️ Regla de Diseño Fallback para Productos sin Imagen (Respaldo Visual Permanente)
* **MANDATO OBLIGATORIO:** Cuando un producto o solución en catálogo no cuente con mockup o fotografía, o cuando un archivo de imagen falle al cargar (`onerror`), debe renderizarse de forma obligatoria el componente canónico en código puro con las siguientes especificaciones:
  1. **Contenedor:** `relative bg-gradient-to-br from-slate-900 via-slate-800 to-brand-blue-dark rounded-2xl overflow-hidden mb-4 aspect-[4/3] flex items-center justify-center p-4 border border-slate-700/60 shadow-inner`.
  2. **Icono Central en Relieve:** Círculo `w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-brand-orange mx-auto flex items-center justify-center mb-2 shadow-lg` con icono Lucide representativo (`w-8 h-8`).
  3. **Texto de Identidad:** Texto principal en `text-xs font-bold text-white block` y subtítulo en `text-[10px] text-brand-orange-light font-bold block`.
  4. **Píldoras Superiores:** Badges de formato o entrega en `text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-xs`.
  5. **Manejador `onerror` Automático:** Las imágenes de catálogo deben incluir un manejador `onerror="handleProductImageError(this)"` que active de forma inmediata el diseño fallback institucional sin romper la cuadrícula ni mostrar el icono de imagen rota nativo.
* **PROHIBICIÓN ESTRICTA:** Queda terminantemente prohibido dejar tarjetas sin imagen con cajas vacías o iconos rotos del navegador (`broken image`).

## 📐 Regla de Tarjetas de Testimonios con Altura e Identidad Idéntica (Anti-Descuadre Permanente)
* **MANDATO OBLIGATORIO:** En toda cuadrícula, grilla o sección de testimonios de clientes (`principal.html`, landing pages o páginas de producto):
  1. **Grilla Contenedora:** Debe incluir obligatoriamente `grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch` (o el número de columnas respectivo con `items-stretch`).
  2. **Contenedor Principal de la Tarjeta:** Debe llevar OBLIGATORIAMENTE `h-full flex flex-col justify-between`.
  3. **Bloque de Estrellas:** Debe llevar dimensiones fijas con `shrink-0 mb-4`.
  4. **Párrafo del Testimonio (Cita):** Debe utilizar OBLIGATORIAMENTE `flex-1 min-h-[6.5rem] sm:min-h-[7.25rem] flex items-start text-xs sm:text-sm text-slate-700 leading-relaxed italic mb-6`. Esto absorbe cualquier diferencia de líneas entre testimonios cortos y largos sin deformar la tarjeta.
  5. **Ficha Inferior del Autor:** Debe configurarse OBLIGATORIAMENTE con `mt-auto pt-4 border-t border-slate-100 flex items-center gap-3 min-h-[3.75rem] shrink-0`. El logotipo de empresa o avatar de iniciales debe llevar estrictamente `w-10 h-10 rounded-full border border-slate-200/90 bg-white p-1 shrink-0 overflow-hidden` y la imagen `w-full h-full object-contain rounded-full`. Esto garantiza que la línea divisoria (`border-t`) y los logotipos queden alineados exactamente en el mismo milímetro horizontal.
  6. **Textos del Autor:** El contenedor de textos debe llevar `min-w-0` y los textos `truncate` para prevenir que nombres largos o empresas rompan la alineación.
* **PROHIBICIÓN ESTRICTA:** Queda terminantemente prohibido utilizar párrafos de testimonio fluidos sin `flex-1` ni `min-h`, o dejar las fichas de autor sin `mt-auto` ni `min-h`, para evitar que la línea divisoria quede en alturas escalonadas o desniveladas.

## 📝 Regla de Arquitectura para Tests Interactivos, Quizzes y Diagnósticos Empresariales
* **MANDATO OBLIGATORIO:** En todo cuestionario, test interactivo, evaluador o autodiagnóstico (`test-interactivo.html`, quizzes o calculadoras de riesgo):
  1. **Navegación Retroactiva Pre-Finalización (Botón Anterior):**
     - El botón **«Anterior»** (`#prev-btn`) debe estar **100% disponible, visible y destacado** (`bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs`) durante todo el flujo de preguntas antes de terminar el test para permitir corregir selecciones accidentales.
     - **Paso 1 / Pregunta 1 (`currentQuestion === 0`):** Debe transformarse dinámicamente en `← Cambiar Perfil` para permitir regresar a la pantalla de perfiles iniciales sin recargar la página.
     - **Preguntas Subsecuentes (`currentQuestion > 0`):** Debe mostrar `← Pregunta Anterior`.
  2. **Memoria y Resalte Visual de Corrección:**
     - Al retroceder con el botón anterior, la opción que el usuario había seleccionado previamente debe resaltarse con un anillo y fondo activo (`ring-2 ring-brand-blue bg-blue-50/40 border-brand-blue`) para que vea con claridad qué marcó por error y pueda corregirla con un solo toque.
  3. **Sello y Bloqueo Post-Finalización (Vista de Resultados):**
     - Una vez contestada la última pregunta y calculados los resultados (`#results-view`), la vista de preguntas y el botón de retroceso deben **ocultarse y bloquearse estrictamente** para preservar la integridad del informe oficial emitido y evitar alteraciones posteriores sin un reinicio voluntario explícito (`restartQuiz()`).
  4. **Alineación Superior Estricta de Selectores e Iconos (`items-start`):**
     - En toda tarjeta de opción táctil multilínea (título + descripción) y en encabezados de pregunta: el contenedor debe utilizar obligatoriamente `flex items-start justify-between` y el bloque izquierdo `flex items-start gap-3`. El selector circular (radio), icono o badge debe llevar obligatoriamente `shrink-0 mt-0.5`.
     - **PROHIBICIÓN ESTRICTA:** Queda terminantemente prohibido usar `flex items-center` en botones de opción o encabezados con texto multilínea para evitar que los selectores o iconos queden flotando en el medio vertical entre el título y la descripción.

