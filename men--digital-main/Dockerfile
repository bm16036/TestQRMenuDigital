# Etapa 1: Build de Angular
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2: Runtime con Node.js
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Instalar solo dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copiar artefactos necesarios
COPY --from=build /app/dist ./dist
COPY src ./src

EXPOSE 3000
CMD ["node", "src/server.js"]
