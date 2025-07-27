# Dockerfile pour Video-IA.net
FROM node:18-alpine AS base

# Installer les dépendances uniquement quand nécessaire
FROM base AS deps
# Vérifier https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine pour comprendre pourquoi libc6-compat pourrait être nécessaire.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Installer les dépendances basées sur le fichier package-lock.json préféré
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Reconstruire la source de l'application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Copier le fichier CSV de données
COPY working_database_rationalized_full.csv ./

# Générer la build de production
RUN npm run build

# Image de production, copier tous les fichiers et exécuter next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers statiques
COPY --from=builder /app/public ./public

# Définir automatiquement la variable d'environnement correcte pour la sortie statique
# https://nextjs.org/docs/advanced-features/output-file-tracing
ENV NEXT_TELEMETRY_DISABLED 1

# Copier les fichiers de build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copier le fichier CSV de données
COPY --from=builder /app/working_database_rationalized_full.csv ./

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# server.js est créé par next build à partir du standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"] 