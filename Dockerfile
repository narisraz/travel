# Utiliser Node.js 20 Alpine
FROM node:20-alpine

# Installer pnpm globalement
RUN npm install -g pnpm@9.10.0

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration des dépendances
COPY package.json pnpm-lock.yaml ./

# Copier les patches nécessaires
COPY patches/ ./patches/

# Installer toutes les dépendances (incluant tsx)
RUN pnpm install --frozen-lockfile

# Copier le reste du code source
COPY . .

# Générer le client Prisma
RUN pnpm db:generate

# Changer la propriété des fichiers
RUN chown -R nodejs:nodejs /app

# Passer à l'utilisateur non-root
USER nodejs

# Exposer le port
EXPOSE 3030

# Variable d'environnement pour le port
ENV PORT=3030

# Commande de démarrage
CMD ["pnpm", "start"] 