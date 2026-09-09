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
