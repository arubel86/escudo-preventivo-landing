FROM node:20-alpine

WORKDIR /app

# Instalar dependencias
COPY package.json ./
RUN npm install --production

# Copiar código fuente
COPY server.js ./
COPY lib/ ./lib/

# Copiar archivos estáticos de la landing page
COPY public/ ./public/

# Puerto expuesto (Coolify lo mapea automáticamente)
EXPOSE 3000

CMD ["node", "server.js"]
