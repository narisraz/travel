# Migration vers PostgreSQL avec Prisma

## 🎯 Objectif

Migration complète de SQLite vers PostgreSQL en utilisant Prisma comme ORM.

## ✅ Changements effectués

### 1. Dépendances

**Ajoutées :**

- `prisma` - ORM pour la gestion de base de données
- `@prisma/client` - Client généré par Prisma

**Supprimées :**

- `better-sqlite3` - Driver SQLite
- `@types/better-sqlite3` - Types TypeScript pour SQLite

### 2. Configuration Prisma

**Fichiers créés :**

- `prisma/schema.prisma` - Schéma de base de données
- `src/auth/infrastructure/persistence/prisma.ts` - Configuration du client Prisma

**Modèles définis :**

- `User` - Comptes utilisateurs
- `Hotel` - Profils d'hôtels avec relation vers User

### 3. Repositories

**Nouveaux repositories PostgreSQL :**

- `src/auth/infrastructure/persistence/account.repository.postgresql.ts`
- `src/profiles/infrastructure/persistence/hotel.repository.postgresql.ts`

**Anciens repositories supprimés :**

- `src/auth/infrastructure/persistence/account.repository.sqlite.ts`
- `src/profiles/infrastructure/persistence/hotel.repository.sqlite.ts`
- `src/auth/infrastructure/persistence/database.ts`

### 4. Layers Effect

**Mise à jour des layers :**

- `src/auth/infrastructure/persistence/layer.ts`
- `src/auth/presentation/http/shared/http-layer.ts`
- `src/profiles/presentation/http/shared/http-layer.ts`

### 5. Tests

**Configuration PostgreSQL pour les tests :**

- `test/integration/setup.ts` - Utilise Testcontainers PostgreSQL
- Suppression de `test/integration/setup-sqlite-container.ts`

### 6. Scripts

**Nouveaux scripts package.json :**

- `pnpm db:generate` - Générer le client Prisma
- `pnpm db:migrate` - Créer et appliquer les migrations
- `pnpm db:studio` - Ouvrir Prisma Studio
- `pnpm db:setup` - Initialiser la base de données

## 🚀 Utilisation

### 1. Configuration de l'environnement

```bash
# Créer un fichier .env avec l'URL de base de données
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/travel"
```

### 2. Initialisation

```bash
# Générer le client Prisma
pnpm db:generate

# Créer et appliquer les migrations
pnpm db:migrate

# Initialiser la base de données
pnpm db:setup
```

### 3. Développement

```bash
# Démarrer le serveur de développement
pnpm dev

# Ouvrir Prisma Studio pour visualiser les données
pnpm db:studio
```

## 🧪 Tests

Les tests d'intégration utilisent maintenant Testcontainers pour créer une instance PostgreSQL temporaire :

```bash
# Lancer les tests d'intégration
pnpm test:integration
```

## 📊 Avantages de PostgreSQL + Prisma

1. **Performance** : PostgreSQL est plus performant que SQLite pour les applications en production
2. **Concurrence** : Gestion native des accès concurrents
3. **Fonctionnalités avancées** : Index, contraintes, triggers, etc.
4. **ORM moderne** : Prisma offre une API type-safe et intuitive
5. **Migrations automatiques** : Gestion des schémas simplifiée
6. **Outils de développement** : Prisma Studio pour visualiser les données

## 🔄 Migration des données

Si vous avez des données existantes en SQLite, vous devrez les migrer manuellement vers PostgreSQL en utilisant les outils d'export/import appropriés.
