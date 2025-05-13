# Dockerfile pour l'application de gestion d'entretiens infirmiers
# Multi-stage build pour optimisation et sécurité

# Stage 1: Dépendances et build
FROM node:23-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Mise à jour des packages pour corriger les vulnérabilités
RUN apk update && apk upgrade && \
    apk add --no-cache python3 make g++ libc6-compat

# Définir les variables d'environnement de build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances avec npm ci pour une installation cohérente et sécurisée
RUN npm ci --ignore-scripts && \
    npm audit fix --force && \
    # Vérification de sécurité des dépendances
    npm audit

# Copier le reste des fichiers du projet
COPY . .

# Générer les clients Prisma
RUN npx prisma generate

# Construction pour production
RUN npm run build

# Stage 2: Image de production
FROM node:23-alpine AS runner

# Définir le répertoire de travail
WORKDIR /app

# Variables d'environnement
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Mise à jour des packages pour corriger les vulnérabilités
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    # Cleanup pour réduire la surface d'attaque
    rm -rf /tmp/* /var/cache/apk/*

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copier les fichiers nécessaires depuis l'étape de build
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Installer seulement les dépendances de production
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Script d'initialisation
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Configuration des permissions minimales
RUN chmod -R 550 /app && \
    chmod -R 770 /app/prisma /app/logs /app/public && \
    mkdir -p /app/data && \
    chown -R nextjs:nodejs /app/data

# Définir l'utilisateur pour exécuter l'application
USER nextjs

# Exposer le port de l'application
EXPOSE 3000

# Healthcheck pour s'assurer que l'application répond
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Utiliser dumb-init comme PID 1 pour gérer correctement les signaux
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Commande par défaut
CMD ["./docker-entrypoint.sh", "node", "server.js"]