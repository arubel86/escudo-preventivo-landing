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
* **PROHIBICIÓN:** Queda prohibido alterar las dimensiones del logotipo (`h-28` en header, `h-20` en footer), los colores oficiales de marca (`brand-blue: #3849C8`, `brand-orange: #FF8A1E`, `WhatsApp: #25D366`), la tipografía (`Inter`) o los espaciados canónicos sin autorización explícita del usuario.

