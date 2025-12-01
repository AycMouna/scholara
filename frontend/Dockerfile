FROM node:20-alpine AS build

WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Construire l'application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copier la configuration nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers construits
COPY --from=build /app/dist /usr/share/nginx/html

# Exposer le port
EXPOSE 8080

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]


