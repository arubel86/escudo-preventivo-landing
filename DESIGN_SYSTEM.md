# 🛡️ Sistema de Diseño & Componentes Canónicos: Escudo Preventivo (Aizprua S.E.)

Este documento contiene la **guía maestra de diseño, medidas exactas, paleta de colores y componentes canónicos (HTML + Tailwind CSS)** para el proyecto **Escudo Preventivo**. Debe consultarse antes de crear o modificar cualquier página (landing pages, embudos, páginas de gracias, etc.) para mantener consistencia absoluta.

---

## 🎨 1. Paleta de Colores Oficial

Configuración canónica en `tailwind.config`:
```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                brand: {
                    blue: '#3849C8',
                    'blue-dark': '#2d3a9f',
                    'blue-light': '#4f5ed4',
                    orange: '#FF8A1E',
                    'orange-dark': '#e67a15',
                    'orange-light': '#ffa04a'
                }
            }
        }
    }
}
```

| Token / Variable | Hex | Uso Canónico |
| :--- | :--- | :--- |
| `brand-blue` | `#3849C8` | Color corporativo primario, barra superior, hover de enlaces, bordes activos. |
| `brand-blue-dark` | `#2D3A9F` | Gradientes oscuros, estados hover corporativos. |
| `brand-orange` | `#FF8A1E` | Botones de conversión primaria (CTA), acentos destacados, avisos clave. |
| `brand-orange-dark` | `#E67A15` | Sombra/gradiente inferior del botón de acción principal. |
| `brand-orange-light`| `#FFA04A` | Texto de urgencia (número de cupos en barra superior). |
| `WhatsApp` | `#25D366` | Botón WhatsApp y enlaces directos de chat (Hover: `#20BD5A`). |
| `Fondo Footer & Tarjetas Oscuras` | `#0F172A` | `bg-slate-900` - Fondo elegante corporativo (sin gradientes extraños). |
| `Superficie / Cards Secundarias` | `#1E293B` | `bg-slate-800` - Tarjetas internas y divisores (`border-slate-800` / `border-slate-700`). |

### 🚫 Reglas Estrictas de Pureza de Color y Fondos Oscuros
1. **Fondo Oscuro Canónico:** En banners, infografías o secciones oscuras, utilizar exclusivamente `bg-slate-900` (`#0F172A`) con superficies `bg-slate-800` (`#1E293B`) y bordes `border-slate-800` o `border-slate-700`.
2. **Prohibición de Tintes Extraños:** Queda **terminantemente prohibido** mezclar gradientes o usar luces ambientales (`blur-3xl`) que generen tonos violetas, púrpuras, amarillos chillones o verdes que desentonen con la marca.
3. **Acentos Exclusivos:** Los únicos colores permitidos para badges, luces, bordes destacados e iconos son `brand-blue` (`#3849C8`), `brand-orange` (`#FF8A1E`) y neutros (`slate-100` a `slate-400`). El verde solo se reserva para el botón oficial de WhatsApp (`#25D366`).

---

## ✍️ 2. Tipografía y Fuentes
* **Familia Tipográfica:** `'Inter', sans-serif` (Google Fonts: pesos `300`, `400`, `600`, `700`, `800`).
* **Librería de Iconos:** [Lucide Icons](https://lucide.dev/) (`<i data-lucide="..."></i>` o SVGs optimizados inline).

---

## 🛡️ 2.1. Favicon Canónico & Optimización de Visibilidad

### Diagnóstico del Problema Anterior:
* El archivo anterior (`LOGOS PARA DIGITAL INDIVIDUALES-13.svg`) tenía un lienzo rectangular de `382 x 242 px` con más del **55% de márgenes vacíos transparentes** a los laterales.
* Al ser escalado por los navegadores a `16x16 px` o `32x32 px`, el escudo quedaba microscópico (apenas 7 px reales).
* En navegadores con pestañas oscuras (Dark Mode de Chrome, Edge o Firefox), el azul oscuro corporativo se mimetizaba con el fondo y resultaba casi invisible.

### Solución Canónica Implementada:
1. **Lienzo Cuadrado 1:1 (`viewBox="90 20 200 200"`):**
   * Se eliminó el 100% del aire sobrante. El escudo ahora aprovecha el **92% del área útil** de la pestaña.
2. **Base de Alto Contraste (Squircle Blanco):**
   * Contenedor con esquinas redondeadas (`rx="46"`, `fill="#FFFFFF"`, borde fino `#E2E8F0` y sombra sutil).
   * **Garantía Visual:** El escudo resalta con nitidez absoluta tanto en pestañas en **modo oscuro** como en **modo claro**.
3. **Archivos Oficiales del Sistema:**
   * **`assets/favicon.svg` (Principal):** Versión canónica con base blanca de contraste al 92%.
   * **`assets/favicon-transparent.svg`:** Versión 1:1 con recorte ajustado sin fondo.
   * **`assets/LOGOS PARA DIGITAL INDIVIDUALES-13.svg`:** Sobrescrito con la versión optimizada para retrocompatibilidad inmediata con cualquier enlace previo.
   * **`/favicon.svg` (Raíz):** Disponible en la raíz pública para navegadores que solicitan el icono directamente sin consultar el HTML.
   * **`assets/test-favicon.html`:** Herramienta interna de previsualización en resoluciones reales (16px, 24px, 32px, 48px).

### Snippet HTML Canónico para `<head>`:
```html
<!-- Canonical Favicon Aizprua S.E. -->
<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
```

---

## 🔝 3. Componente: Encabezado Completo (Header)

### 3.1. Barra de Notificación / Urgencia Superior (`#announcement-bar`)
* **Contenedor:** `bg-brand-blue text-white py-2 px-4 text-center text-sm relative`
  * Padding vertical: `8px` (`py-2`), horizontal: `16px` (`px-4`).
  * Fondo: `#3849C8`, texto en `14px`.
* **Icono Teléfono:** SVG inline `16x16px` (`w-4 h-4 text-brand-orange-light`).
* **Contador de Cupos:** `.spots-count` con clase `font-bold text-brand-orange-light` (`#FFA04A`).
* **Enlace CTA:** `ml-2 underline font-bold hover:text-brand-orange-light`
* **Botón Cerrar (X):** `absolute right-4 top-1/2 -translate-y-1/2 hover:text-brand-orange-light`

### 3.2. Barra de Navegación (`#navbar`)
* **Contenedor:** `bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 transition-all`
  * Altura estandarizada: **`80px`** (`h-20`).
  * Ancho máximo: `1280px` (`max-w-7xl mx-auto`).
  * Padding lateral: `16px` móvil (`px-4`), `24px` tablet (`sm:px-6`), `32px` escritorio (`lg:px-8`).
* **Logo Principal:**
  * Archivo: `assets/LOGOS PARA DIGITAL INDIVIDUALES-07.svg`
  * Dimensiones: Altura **`56px - 64px`** (`h-14 sm:h-16 w-auto object-contain`), centrado verticalmente en flex.
* **Menú Escritorio (`hidden md:flex`):**
  * Separación: **`24px`** (`space-x-6`).
  * Enlaces: `text-slate-600 hover:text-brand-blue font-medium transition`
  * Separador de teléfono: `<span class="text-slate-400">|</span>`
  * Teléfono: `flex items-center gap-1.5 font-medium hover:text-brand-blue transition` con icono Lucide `phone` de `16x16px` color naranja marca (`w-4 h-4 text-brand-orange`).
* **Botón CTA WhatsApp (Escritorio):**
  * Clases: `hidden md:flex items-center gap-2 bg-[#25D366] text-white px-5 py-2 rounded-full font-semibold hover:bg-[#20bd5a] transition shadow-lg`
  * Padding: `8px` vertical x `20px` horizontal.
  * Borde redondeado completo (`rounded-full`), icono `message-circle` de `16x16px`.
* **Botón Hamburguesa (Móvil `< 768px`):**
  * `button#mobile-menu-btn` clase `md:hidden text-slate-600` con icono `menu` de **`24x24px`** (`h-6 w-6`).
* **Menú Desplegable Móvil (`#mobile-menu`):**
  * Clases: `hidden md:hidden bg-white p-4 space-y-3 border-t`
  * Enlaces: `block py-2 text-slate-600 font-medium`
  * CTA WhatsApp Móvil: `block py-2 text-green-600 font-bold`

### 3.3. Código HTML Canónico del Encabezado
```html
<!-- Barra Superior -->
<div id="announcement-bar" class="relative bg-brand-blue text-white py-2 px-4 text-center text-sm">
    <span>
        <svg class="w-4 h-4 inline-block -mt-0.5 mr-1.5 text-brand-orange-light flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/><path d="M14.05 2a9 9 0 0 1 8 7.94"/><path d="M14.05 6A5 5 0 0 1 18 10"/></svg>
        Solo <span class="spots-count font-bold text-brand-orange-light">4</span> diagnósticos disponibles esta semana — Sesiones martes y jueves
    </span>
    <a href="#diagnostico" class="ml-2 underline font-bold hover:text-brand-orange-light">Iniciar el mío</a>
    <button id="close-announcement" aria-label="Cerrar anuncio" class="absolute right-4 top-1/2 -translate-y-1/2 hover:text-brand-orange-light">
        <i data-lucide="x" class="w-4 h-4"></i>
    </button>
</div>

<!-- Navbar Principal -->
<nav id="navbar" class="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 transition-shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
            <div class="flex items-center">
                <img src="assets/LOGOS PARA DIGITAL INDIVIDUALES-07.svg" alt="Logo Aizprua S.E. - Trámites Legales Panamá" class="h-28 w-auto object-contain" width="112" height="112">
            </div>
            <div class="hidden md:flex items-center space-x-6">
                <a href="#inicio" class="text-slate-600 hover:text-brand-blue font-medium transition">Inicio</a>
                <a href="#diagnostico" class="text-slate-600 hover:text-brand-blue font-medium transition">Diagnóstico</a>
                <span class="text-slate-400">|</span>
                <a href="tel:+50765461527" class="text-slate-600 flex items-center gap-1.5 font-medium hover:text-brand-blue transition">
                    <i data-lucide="phone" class="w-4 h-4 text-brand-orange"></i>6546-1527
                </a>
            </div>
            <button id="mobile-menu-btn" aria-label="Abrir menú" class="md:hidden text-slate-600">
                <i data-lucide="menu" class="h-6 w-6"></i>
            </button>
            <a href="https://wa.me/50765461527" target="_blank" class="hidden md:flex items-center gap-2 bg-[#25D366] text-white px-5 py-2 rounded-full font-semibold hover:bg-[#20bd5a] transition shadow-lg">
                <i data-lucide="message-circle" class="w-4 h-4"></i>WhatsApp
            </a>
        </div>
    </div>
    <div id="mobile-menu" class="hidden md:hidden bg-white p-4 space-y-3 border-t">
        <a href="#inicio" class="block py-2 text-slate-600 font-medium">Inicio</a>
        <a href="#diagnostico" class="block py-2 text-slate-600 font-medium">Diagnóstico</a>
        <a href="https://wa.me/50765461527" target="_blank" class="block py-2 text-green-600 font-bold">WhatsApp directo</a>
    </div>
</nav>
```

---

## 🔻 4. Componente: Pie de Página Completo (Footer)

### 4.1. Estructura General
* **Fondo y Color:** `bg-slate-900 text-slate-400`
* **Padding:** `py-12` (**`48px`** superior e inferior).
* **Ancho Máximo:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` (`1280px`).
* **Layout de Columnas:**
  * Móvil: `flex flex-col gap-10 mb-8` (vertical, separación de `40px`).
  * Escritorio: `md:flex-row md:justify-between gap-10 mb-8` (4 columnas fluidas).

### 4.2. Desglose de las 4 Columnas
1. **Columna 1: Marca & Redes Sociales**
   * Logo invertido/blanco sin fondo: `assets/LOGOS PARA DIGITAL INDIVIDUALES-21-nobg.svg`
   * Tamaño: `h-20 w-auto -mt-7 -mb-4 -ml-3` (altura de `80px`).
   * Eslogan: `<p class="text-sm text-slate-400 mb-3">Tu aliado legal en Panamá.</p>`
   * Botones de Redes Sociales:
     * Contenedor: `flex gap-3` (separación `12px`).
     * Círculo: `w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white transition` (`40x40px`).
     * Icono SVG interno: `w-5 h-5` (`20x20px`).
     * Hovers: Instagram (`hover:bg-pink-600`), Facebook (`hover:bg-brand-blue`), WhatsApp (`hover:bg-green-500`).
2. **Columna 2: Diagnóstico**
   * Título: `<h4 class="font-bold text-white mb-4">Diagnóstico</h4>`
   * Lista: `ul.space-y-2.text-sm` (`8px` de separación entre enlaces).
   * Enlaces: `#diagnostico` (Iniciar cuestionario) y `/recursos-gratuitos` (Guía Preventiva 2026).
3. **Columna 3: Contacto**
   * Título: `<h4 class="font-bold text-white mb-4">Contacto</h4>`
   * Enlaces: WhatsApp directo (`https://wa.me/50765461527`) y correo (`mailto:info@aizprua.com`).
4. **Columna 4: Legal**
   * Título: `<h4 class="font-bold text-white mb-4">Legal</h4>`
   * Enlaces: Términos y Condiciones (`/terminos`) y Política de Privacidad (`/privacidad`).

### 4.3. Barra Inferior de Copyright
* Divisor: `border-t border-slate-800`
* Padding superior: `pt-8` (`32px`).
* Texto: `text-center text-sm text-slate-300` -> `&copy; 2026 Aizprua S.E. Todos los derechos reservados.`

### 4.4. Código HTML Canónico del Pie de Página
```html
<footer class="bg-slate-900 text-slate-400 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row md:justify-between gap-10 mb-8">
            <!-- Logo & Redes -->
            <div class="flex flex-col items-start">
                <img src="assets/LOGOS PARA DIGITAL INDIVIDUALES-21-nobg.svg" alt="Aizprua S.E. - Firma Legal" class="h-20 w-auto -mt-7 -mb-4 -ml-3">
                <p class="text-sm text-slate-400 mb-3">Tu aliado legal en Panamá.</p>
                <div class="flex gap-3">
                    <a target="_blank" rel="noopener" href="https://instagram.com/aizpruase" class="w-10 h-10 bg-slate-800 hover:bg-pink-600 rounded-full flex items-center justify-center text-white transition" aria-label="Instagram">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    </a>
                    <a target="_blank" rel="noopener" href="https://facebook.com/aizpruase" class="w-10 h-10 bg-slate-800 hover:bg-brand-blue rounded-full flex items-center justify-center text-white transition" aria-label="Facebook">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                    <a target="_blank" rel="noopener" href="https://www.youtube.com/@AizpruaSE" class="w-10 h-10 bg-slate-800 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition" aria-label="YouTube">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    </a>
                    <a href="https://wa.me/50765461527" target="_blank" class="w-10 h-10 bg-slate-800 hover:bg-green-500 rounded-full flex items-center justify-center text-white transition" aria-label="WhatsApp">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </a>
                </div>
            </div>
            <!-- Diagnóstico -->
            <div>
                <h4 class="font-bold text-white mb-4">Diagnóstico</h4>
                <ul class="space-y-2 text-sm">
                    <li><a href="#diagnostico" class="hover:text-white transition">Iniciar el cuestionario</a></li>
                    <li><a href="/recursos-gratuitos" class="hover:text-white transition">Guía Preventiva 2026 (gratis)</a></li>
                </ul>
            </div>
            <!-- Contacto -->
            <div>
                <h4 class="font-bold text-white mb-4">Contacto</h4>
                <ul class="space-y-2 text-sm">
                    <li><a href="https://wa.me/50765461527" target="_blank" class="hover:text-white">WhatsApp: +507 6546-1527</a></li>
                    <li><a href="mailto:info@aizprua.com" class="hover:text-white">info@aizprua.com</a></li>
                </ul>
            </div>
            <!-- Legal -->
            <div>
                <h4 class="font-bold text-white mb-4">Legal</h4>
                <ul class="space-y-2 text-sm">
                    <li><a href="/terminos" class="hover:text-white">Términos y Condiciones</a></li>
                    <li><a href="/privacidad" class="hover:text-white">Política de Privacidad</a></li>
                </ul>
            </div>
        </div>
        <div class="border-t border-slate-800 pt-8 text-center text-sm text-slate-300">
            &copy; 2026 Aizprua S.E. Todos los derechos reservados.
        </div>
    </div>
</footer>
```

---

## 🔘 5. Botones y Elementos de Acción Canónicos

### 5.1. Botón de Conversión Primario (Naranja Gradiente)
```html
<a href="#diagnostico" class="group px-8 py-4 bg-gradient-to-r from-brand-orange to-brand-orange-dark hover:brightness-110 text-white rounded-2xl font-extrabold text-base md:text-lg transition-all shadow-xl hover:shadow-orange-500/30 flex items-center justify-center transform hover:-translate-y-0.5 cursor-pointer">
    <span>Iniciar mi Diagnóstico</span>
</a>
```

### 5.2. Botón WhatsApp Píldora (Header)
```html
<a href="https://wa.me/50765461527" target="_blank" class="flex items-center gap-2 bg-[#25D366] text-white px-5 py-2 rounded-full font-semibold hover:bg-[#20bd5a] transition shadow-lg">
    <i data-lucide="message-circle" class="w-4 h-4"></i>
    <span>WhatsApp</span>
</a>
```

### 5.3. Botón WhatsApp Flotante Fijo
```html
<button id="whatsapp-toggle" aria-label="Abrir chat de WhatsApp" class="whatsapp-btn fixed bottom-16 right-6 z-[90] bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300">
    <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">...</svg>
</button>
```

---

## ✉️ 6. Regla Legal Estricta de Correo (MailerLite)
En todo correo electrónico, plantilla HTML o comunicación enviada por MailerLite, es **estrictamente obligatorio** incluir la variable canónica de desuscripción:
```html
<p style="font-size: 11px; color: #64748B; margin-top: 8px;">
    Si ya no deseas recibir nuestros correos, puedes 
    <a href="{$unsubscribe}" style="color: #94A3B8; text-decoration: underline;">cancelar tu suscripción aquí</a>.
</p>
```

---

## 🔍 7. Estándares Canónicos de SEO & Metadatos (Google + Semrush)

Toda página pública indexable dentro del ecosistema **Escudo Preventivo / Aizprua S.E.** debe cumplir con las siguientes reglas canónicas antes de ser publicada:

### 7.1. Reglas de Título (`<title>`)
* **Límite de caracteres:** Máximo **50 a 60 caracteres** (para evitar que Google lo corte con `...` en móvil o escritorio).
* **Estructura canónica:** `[Beneficio o Búsqueda Real del Usuario] | Aizprua`
* **Prohibición:** Prohibido el relleno artificial de palabras clave (*keyword stuffing*). Debe reflejar exactamente el encabezado principal (`<h1>`) de la página.

### 7.2. Reglas de Meta Descripción (`meta name="description"`)
* **Límite de caracteres:** Entre **120 y 155 caracteres** (legible completo en móvil y escritorio).
* **Estructura requerida:** Verbo de acción al inicio (*Protege, Evita, Descubre, Conoce*) + Propuesta de valor clara + Llamado a la acción (CTA) directo (*aquí, hoy, descarga gratis*).
* **Prohibición técnica:** No usar comillas dobles `"` dentro del atributo `content` para evitar romper el marcado HTML.

### 7.3. Bloque Canónico de `<head>` (Plantilla Maestra)
```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="index, follow">

    <!-- SEO Principal -->
    <title>Beneficio Claro y Solución al Problema en Panamá | Aizprua</title>
    <meta name="description"
        content="Verbo de acción y propuesta clara para tu empresa en Panamá. Detecta riesgos y toma acción hoy. Agenda tu diagnóstico aquí.">
    
    <!-- Canonical & Favicon -->
    <link rel="canonical" href="https://escudo.aizprua.com/[slug]">
    <link rel="icon" type="image/svg+xml" href="assets/LOGOS PARA DIGITAL INDIVIDUALES-13.svg">

    <!-- Open Graph (WhatsApp / Facebook / LinkedIn) -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://escudo.aizprua.com/[slug]">
    <meta property="og:title" content="Beneficio Claro y Solución al Problema en Panamá | Aizprua">
    <meta property="og:description"
        content="Verbo de acción y propuesta clara para tu empresa en Panamá. Detecta riesgos y toma acción hoy. Agenda tu diagnóstico aquí.">
    <meta property="og:image" content="https://escudo.aizprua.com/assets/aizprua-shield-og.jpg">
    <meta property="og:image:secure_url" content="https://escudo.aizprua.com/assets/aizprua-shield-og.jpg">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="1080">
    <meta property="og:image:height" content="1080">
    <meta property="og:locale" content="es_PA">
    <meta property="og:site_name" content="Aizprua S.E.">

    <!-- Twitter / X Cards -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Beneficio Claro y Solución al Problema en Panamá | Aizprua">
    <meta name="twitter:description"
        content="Verbo de acción y propuesta clara para tu empresa en Panamá. Detecta riesgos y toma acción hoy. Agenda tu diagnóstico aquí.">
    <meta name="twitter:image" content="https://escudo.aizprua.com/assets/aizprua-shield-og.jpg">
</head>
```

---

## 🤖 8. Estándar de Indexación para Agentes IA & Modelos de Lenguaje (`llms.txt` / GEO)

Para asegurar la visibilidad en motores de búsqueda generativos (ChatGPT Search, Perplexity, Claude y Gemini), el proyecto mantiene la especificación oficial de **llmstxt.org**:

### 8.1. Archivo Canónico `/llms.txt`
* **Ubicación:** `public/llms.txt` (servido en la raíz pública del dominio).
* **Estructura obligatoria:**
  1. **H1 Único:** Título formal de la firma/proyecto (`# Aizprua S.E. — Escudo Preventivo y Blindaje Empresarial en Panamá`).
  2. **Bloque de resumen (`>`):** Propuesta de valor limpia en texto plano describiendo servicios clave y jurisdicción (Panamá).
  3. **Directorio de Enlaces Markdown:** Lista con viñetas `[Nombre de la Página](URL): Breve descripción` de todos los recursos canónicos.
  4. **Canales de contacto oficiales verificados:** WhatsApp, correo y redes.

### 8.2. Sincronización en `robots.txt`
El archivo `public/robots.txt` debe permitir el acceso explícito a este archivo y habilitar a los rastreadores oficiales de IA:
```txt
# Archivo de contexto para Modelos de Lenguaje (LLMs)
# https://llmstxt.org/
# https://escudo.aizprua.com/llms.txt

User-agent: GPTBot
Allow: /verificador
Allow: /

User-agent: ClaudeBot
Allow: /verificador
Allow: /

User-agent: PerplexityBot
Allow: /verificador
Allow: /
```

---

## 🔗 9. Estándar de Estructura de URLs & Enrutamiento Canónico (Google Guidelines)

Siguiendo las especificaciones oficiales de **Google Search Central (URL Structure Guidelines)**, toda ruta web del proyecto debe ceñirse a las siguientes reglas técnicas:

### 9.1. Convención de Nomenclatura de URLs
* **Uso exclusivo de guiones medios (`-`):** Palabras separadas por `-` (ejemplo: `/guia-prestamos`, `/recursos-gratuitos`). **Prohibido** el uso de guiones bajos (`_`) o espacios codificados (`%20`).
* **Minúsculas estrictas:** Todas las rutas deben ser en minúsculas para evitar contenido duplicado por sensibilidad a mayúsculas/minúsculas.
* **Sin extensiones visibles:** Prohibido exponer `.html` en los enlaces públicos.

### 9.2. Normalización de Barra Final (*Trailing Slash*)
Google trata `/ruta` y `/ruta/` como dos URLs separadas. En el servidor (`server.js`) es **obligatorio** el middleware de normalización que redirige permanentemente con **301** cualquier URL con barra final a su versión canónica limpia:
```javascript
app.use((req, res, next) => {
  if (req.path.length > 1 && req.path.endsWith('/')) {
    const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    return res.redirect(301, req.path.slice(0, -1) + query);
  }
  next();
});
```

### 9.3. Tabla Maestra de Rutas Canónicas vs. Redirecciones 301
Cualquier enlace alternativo, alias o archivo `.html` legacy debe redirigir con **HTTP 301** a la URL canónica única:

| Recurso / Página | URL Canónica Única (HTTP 200) | Redirecciones 301 Obligatorias (Alias y .html) |
| :--- | :--- | :--- |
| **Inicio (Landing Escudo)** | `/` | `/index.html` |
| **Página B (Oferta)** | `/escudo-preventivo` | `/escudo-preventivo.html` |
| **Recursos Gratuitos** | `/recursos-gratuitos` | `/recursos-gratuitos.html` |
| **Plan 360 Empresarial** | `/plan-360` | `/plan-360.html`, `/plan360`, `/plan360.html` |
| **Playbook Blindaje** | `/guia-blindaje` | `/guia-blindaje.html`, `/playbook`, `/playbook.html`, `/guia`, `/guia.html`, `/docs`, `/blindaje` |
| **Guía Préstamos** | `/guia-prestamos` | `/guia-prestamos.html`, `/prestamos`, `/credito-panama` |
| **Verificador Web** | `/verificador` | `/verificador.html` |
| **Hub de Enlaces** | `/links` | `/links.html`, `/bio`, `/bio.html` |
| **Términos** | `/terminos` | `/terminos.html` |
| **Privacidad** | `/privacidad` | `/privacidad.html` |
| **Hoja de Ruta** | `/hoja-de-ruta` | `/hoja-de-ruta.html` |
| **En Construcción** | `/construccion` | `/construccion.html`, `/proximamente` |
| **Blog Principal** | `/blog` | `/blog.html` |
| **Artículo Emprender** | `/articulo-emprender` | `/articulo-emprender.html` |
| **Artículo Mentalidad** | `/articulo-mentalidad` | `/articulo-mentalidad.html` |

---

## 🖼️ 10. Estándar Canónico de Portadas de Blog & Mockups

### 10.1. Portadas Panorámicas Nativas (`654 x 315 px`)
* **Proporción de Lienzo:** `654 x 315 px` (Aspect Ratio: `aspect-[654/315]` o `2.076:1`).
* **Regla de Contenedor en Cards (`blog.html`):**
  ```html
  <div class="relative aspect-[654/315] bg-slate-900 overflow-hidden">
      <img src="assets/portada-articulo-..." alt="..." class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
  </div>
  ```
* **Garantía Visual:** Cero recorte de píxeles. Marcas de agua (`@arubel68`), pies de foto y encabezados quedan 100% visibles.
* **Prohibición:** No colocar badges flotantes en esquinas superiores si la imagen de portada ya contiene textos o números en ese cuadrante.

### 10.2. Portadas Verticales / Mockups de Libros (1:1 o 3:4)
* **Técnica Showcase Ambiental:**
  ```html
  <div class="relative aspect-[16/9] bg-slate-950 overflow-hidden flex items-center justify-center p-3">
      <!-- Fondo difuminado ambiental -->
      <img src="assets/guia-cover.png" alt="" class="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-125 pointer-events-none">
      <div class="absolute inset-0 bg-slate-950/40 pointer-events-none"></div>
      
      <!-- Portada completa con sombra 3D -->
      <img src="assets/guia-cover.png" alt="..." class="relative z-10 max-h-full w-auto object-contain rounded-xl shadow-2xl group-hover:scale-105 transition duration-500">
  </div>
  ```

---

## 📑 11. Arquitectura de Navegación Lateral (Sidebar TOC)

* **Contenedor Maestro:**
  ```html
  <aside id="guideSidebar" class="hidden lg:block w-72 flex-shrink-0 sticky top-36 max-h-[calc(100vh-10rem)] overflow-y-auto no-scrollbar pr-2">
      <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-3 px-2">
              Contenido del Artículo
          </span>
          <nav class="space-y-0.5" id="guideNavList">
              <a href="#id" class="nav-doc-link flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs ...">
                  ...
              </a>
          </nav>
      </div>
  </aside>
  ```
* **Regla Anti-Recorte:**
  * El sidebar debe albergar **exclusivamente el índice de contenidos**.
  * Los enlaces deben usar `px-3 py-1.5` con `space-y-0.5` para garantizar que hasta 13 o 15 secciones quepan holgadamente en laptops de 13" sin cortarse.
  * No colocar tarjetas de conversión debajo del índice en el sidebar. El CTA debe ir dentro del cuerpo del artículo.
  * Ocultar scrollbar con `.no-scrollbar { display: none; scrollbar-width: none; }`.

---

## 📰 12. Anatomía Maestra Canónica para Artículos de Blog (15 Componentes Obligatorios)

Todo artículo nuevo en `/public` debe construirse respetando estrictamente esta secuencia estructural de 15 pasos:

1. **Header Canónico Oficial:** `#announcement-bar` + `#navbar` estándar `h-20` (80px), logotipo `h-28` (112px) y botón WhatsApp.
2. **Barra de Progreso de Lectura:** `#progress-bar` fijada arriba con `bg-brand-orange` (naranja oficial).
3. **Contenedor Maestro de 2 Columnas (Flex):**
   ```html
   <main class="flex-grow py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
       <div class="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start relative">
           <!-- Columna Izquierda: aside#guideSidebar (w-72) -->
           <!-- Columna Derecha: div (flex-1 min-w-0 max-w-3xl) -->
       </div>
   </main>
   ```
4. **Sidebar TOC Izquierdo (`#guideSidebar`):** Índice numérico (`01. Introducción`, etc.) con scrollspy.
5. **Cuerpo del Artículo (`max-w-3xl`):**
   - **5.1. Migas de Pan (Breadcrumbs):** `Inicio / Blog / Categoría`.
   - **5.2. Píldora de Categoría:** `bg-brand-orange/10 text-brand-orange px-3.5 py-1 rounded-full border border-brand-orange/20`.
   - **5.3. Título H1 en Estilo Natural en Español (Sentence Case):** Mayúscula inicial únicamente en la primera palabra del título y en nombres propios o siglas (Panamá, DGI, CSS, etc.). Evitar mayúsculas en cada palabra.
   - **5.4. Barra de Autor & Metadatos:** Foto de Arubel (`w-8 h-8`), nombre, tiempo estimado (`bg-brand-blue/10`), edición 2026 y 4 botones de compartir (WhatsApp, LinkedIn, X, Copiar).
   - **5.5. Portada Oficial:** `654x315 px`, `rounded-3xl`, borde fino y marca de agua `AIZPRUA S.E.` de 10px.
   - **5.6. Introducción:** Apertura atractiva sin relleno.
   - **5.7. Resumen Ejecutivo (TL;DR) en 3 Tarjetas:**
     ```html
     <div class="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs">
         <span class="text-xs font-black uppercase tracking-wider text-brand-orange">Resumen Ejecutivo (TL;DR) en 30 segundos</span>
         <div class="grid sm:grid-cols-3 gap-4 mt-4">
             <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">...</div>
             <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">...</div>
             <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">...</div>
         </div>
     </div>
     ```
   - **5.8. Secciones Numéricas:** Encabezados con badges circulares `w-8 h-8 rounded-full bg-brand-blue text-white` alineados con line-height matching.
   - **5.9. Tabla Comparativa:** Informal / Riesgo vs. Blindado con Escudo Preventivo.
   - **5.10. Lead Magnet Temático:** Banner `bg-slate-900` con mockup 3D y CTA relevante.
   - **5.11. Acordeón Schema FAQ:** 3-5 preguntas en `<details>` para SEO de Google.
   - **5.12. Barra Inferior de Compartir:** Compartir en WhatsApp y botón Copiar Enlace.
   - **5.13. Ficha de Autor Inferior:** Biografía completa de Arubel con enlace a WhatsApp.
   - **5.14. Artículos Recomendados:** Cuadrícula de 2 columnas con enlaces a otros artículos con títulos en estilo natural en español (Sentence Case).
6. **Footer Canónico Oficial:** 4 columnas (Marca, Soluciones, Contacto, Legal) + Copyright 2026.
7. **Botones Flotantes:** Volver arriba (`#scroll-top-btn`) + Botón flotante WhatsApp.
8. **Scripts Oficiales:** Inicialización Lucide, barra de scroll, scroll to top, copiar enlace con portapapeles y scrollspy.

---

## 🛍️ 4.4. Componente Canónico: Tarjeta de Catálogo E-Commerce & Fallback Visual

### Estructura Anti-Descuadre Visual (Alturas Idénticas Infalibles):
1. **Contenedor Principal:** `h-full flex flex-col justify-between bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition group`
2. **Cuerpo Superior (`.card-body`):** `flex-1 flex flex-col`
3. **Showcase Visual:** `aspect-[4/3] max-h-[175px]` con imagen centrada o componente fallback.
4. **Píldora de Categoría:** `min-h-[1.25rem] text-[10px] font-black uppercase tracking-wider block`
5. **Título (`<h3>`):** `min-h-[3.25rem] flex items-center leading-snug text-base sm:text-lg font-black text-slate-900 mt-1 mb-2`
6. **Descripción:** `min-h-[3.75rem] flex items-start text-xs text-slate-600 mb-4 leading-relaxed`
7. **Caja de Entregables:** Exactamente 3 bullets con `space-y-2 mb-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 min-h-[8.5rem] flex flex-col justify-center`
8. **Bloque Inferior / Acciones:** `pt-4 border-t border-slate-100 space-y-2.5 mt-auto` con fila de precio `min-h-[2rem]` y contenedor de botones `min-h-[5.5rem] flex flex-col justify-end space-y-2`.

### Snippet Oficial de Fallback sin Imagen (Puro HTML + Tailwind):
```html
<div class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-brand-blue-dark rounded-2xl overflow-hidden mb-4 aspect-[4/3] flex items-center justify-center p-4 border border-slate-700/60 shadow-inner">
    <div class="text-center p-3">
        <div class="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-brand-orange mx-auto flex items-center justify-center mb-2 shadow-lg">
            <i data-lucide="package" class="w-8 h-8"></i>
        </div>
        <span class="text-xs font-bold text-white block">Nombre del Producto</span>
        <span class="text-[10px] text-brand-orange-light font-bold block">Solución Oficial Aizprua</span>
    </div>
    <span class="absolute top-3 left-3 bg-brand-orange text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-xs">
        Entrega Inmediata
    </span>
</div>
```

---

## ⭐ 4.5. Componente Canónico: Tarjeta de Testimonios con Altura e Identidad Idéntica (Anti-Descuadre Permanente)

### Estructura Canónica de Nivelación:
1. **Grilla Contenedora:** `grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch`
2. **Contenedor Principal de la Tarjeta:** `bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm h-full flex flex-col justify-between hover:shadow-md transition`
3. **Bloque de Calificación (Estrellas):** `flex text-amber-400 gap-1 mb-4 shrink-0`
4. **Párrafo del Testimonio (Cita):** `flex-1 min-h-[6.5rem] sm:min-h-[7.25rem] flex items-start text-xs sm:text-sm text-slate-700 leading-relaxed italic mb-6`
5. **Ficha Inferior del Autor:** `mt-auto pt-4 border-t border-slate-100 flex items-center gap-3 min-h-[3.75rem] shrink-0`
6. **Logotipo de Empresa o Avatar Circular:** `w-10 h-10 rounded-full border border-slate-200/90 bg-white p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden` con `img.w-full.h-full.object-contain.rounded-full` (o círculo de iniciales).
7. **Bloque de Textos del Autor:** `min-w-0` con `h5` y `span` con `truncate` para evitar saltos accidentales de línea.

### Snippet Oficial de Tarjeta de Testimonio (con Logo Oficial):
```html
<div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm h-full flex flex-col justify-between hover:shadow-md transition">
    <div class="flex text-amber-400 gap-1 mb-4 shrink-0">
        <i data-lucide="star" class="w-4 h-4 fill-amber-400"></i>
        <i data-lucide="star" class="w-4 h-4 fill-amber-400"></i>
        <i data-lucide="star" class="w-4 h-4 fill-amber-400"></i>
        <i data-lucide="star" class="w-4 h-4 fill-amber-400"></i>
        <i data-lucide="star" class="w-4 h-4 fill-amber-400"></i>
    </div>
    <p class="flex-1 min-h-[6.5rem] sm:min-h-[7.25rem] flex items-start text-xs sm:text-sm text-slate-700 leading-relaxed italic mb-6">
        "Texto del testimonio con experiencia de cliente..."
    </p>
    <div class="mt-auto pt-4 border-t border-slate-100 flex items-center gap-3 min-h-[3.75rem] shrink-0">
        <div class="w-10 h-10 rounded-full border border-slate-200/90 bg-white p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
            <img src="assets/logo-empresa.png" alt="Logo Empresa" class="w-full h-full object-contain rounded-full">
        </div>
        <div class="min-w-0">
            <h5 class="text-xs sm:text-sm font-bold text-slate-900 truncate">Nombre del Cliente</h5>
            <span class="text-[11px] text-slate-500 block truncate">Nombre de la Empresa o Ciudad</span>
        </div>
    </div>
</div>
```

---

## 🎯 4.6. Componente Canónico: Tarjetas de Selección Táctil de Quizzes y Evaluadores (Alineación Superior Anti-Descuadre)

### Especificaciones de Arquitectura Visual:
1. **Contenedor Principal:** `w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-brand-blue hover:bg-brand-blue/5 text-left transition flex items-start justify-between group active:scale-[0.99] cursor-pointer`
2. **Bloque Izquierdo:** `flex items-start gap-3` (Estrictamente `items-start`, jamás `items-center`).
3. **Selector Circular / Radio:** `w-5 h-5 rounded-full border-2 border-brand-blue flex items-center justify-center bg-white group-hover:bg-brand-blue transition shrink-0 mt-0.5` con punto interior `w-2.5 h-2.5 rounded-full bg-brand-blue group-hover:bg-white transition`.
4. **Textos:**
   - Título: `text-sm font-bold text-slate-800 group-hover:text-brand-blue transition block leading-tight`
   - Descripción: `text-xs text-slate-500 mt-1 block leading-normal`
5. **Badge Lateral (Pill):** `text-xs font-bold px-2.5 py-1 rounded-full hidden sm:inline-block shrink-0 ml-2`
6. **Botón Anterior Pre-Finalización (`#prev-btn`):** `inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-brand-blue transition active:scale-95 cursor-pointer`
   - Disponible durante el test (oculto estrictamente al llegar a la pantalla de resultados).

### Snippet Canónico de Tarjeta de Selección Táctil:
```html
<button type="button" onclick="selectOption('opcion_id')"
    class="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-brand-blue hover:bg-brand-blue/5 text-left transition flex items-start justify-between group active:scale-[0.99] cursor-pointer">
    <div class="flex items-start gap-3">
        <span class="w-5 h-5 rounded-full border-2 border-brand-blue flex items-center justify-center bg-white group-hover:bg-brand-blue transition shrink-0 mt-0.5">
            <span class="w-2.5 h-2.5 rounded-full bg-brand-blue group-hover:bg-white transition"></span>
        </span>
        <div>
            <span class="text-sm font-bold text-slate-800 group-hover:text-brand-blue transition block leading-tight">Título de la Opción</span>
            <span class="text-xs text-slate-500 mt-1 block">Descripción explicativa o alcance formal del punto evaluado.</span>
        </div>
    </div>
    <span class="text-brand-blue text-xs font-bold bg-brand-blue/10 px-2.5 py-1 rounded-full hidden sm:inline-block shrink-0 ml-2">Badge</span>
</button>
```


