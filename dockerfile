# Dockerfile pour l'application de gestion d'entretiens infirmiers
# Multi-stage build pour optimisation et sécurité

# Stage 1: Dépendances et build
FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Mise à jour des packages pour corriger les vulnérabilités
RUN apk update && apk upgrade && \
    apk add --no-cache python3 make g++ libc6-compat openssl && \
    openssl version

# Définir les variables d'environnement de build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1


# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances avec npm ci pour une installation cohérente et sécurisée
RUN npm ci

# Copier le reste des fichiers du projet
COPY . .

# Générer les clients Prisma
RUN npx prisma generate

# Construction pour production
RUN npm run build

# Variables d'environnement
#ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

    RUN mkdir -p /app/prisma && \
    chown -R nextjs:nodejs /app/prisma
    
# Script d'initialisation
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Définir l'utilisateur pour exécuter l'application
USER nextjs

# Exposer le port de l'application
EXPOSE 3000

# Healthcheck pour s'assurer que l'application répond
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Commande par défaut
CMD ["npm", "start"]