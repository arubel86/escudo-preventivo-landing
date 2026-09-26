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
| `Fondo Footer` | `#0F172A` | `bg-slate-900` - Fondo elegante del pie de página. |
| `Superficie Footer` | `#1E293B` | `bg-slate-800` - Círculos de iconos sociales y divisores (`border-slate-800`). |

---

## ✍️ 2. Tipografía y Fuentes
* **Familia Tipográfica:** `'Inter', sans-serif` (Google Fonts: pesos `300`, `400`, `600`, `700`, `800`).
* **Librería de Iconos:** [Lucide Icons](https://lucide.dev/) (`<i data-lucide="..."></i>` o SVGs optimizados inline).

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
* **Contenedor:** `bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 transition-shadow`
  * Altura fija: `64px` (`h-16`).
  * Ancho máximo: `1280px` (`max-w-7xl mx-auto`).
  * Padding lateral: `16px` móvil (`px-4`), `24px` tablet (`sm:px-6`), `32px` escritorio (`lg:px-8`).
* **Logo Principal:**
  * Archivo: `assets/LOGOS PARA DIGITAL INDIVIDUALES-07.svg`
  * Dimensiones: Altura **`112px`** (`h-28 w-auto object-contain`), centrado en flex.
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
