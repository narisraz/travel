# Persistence Layer - PostgreSQL avec Prisma

Cette couche de persistence utilise PostgreSQL comme base de données avec Prisma comme ORM, en suivant une architecture avec modèles de persistence et mappers.

## 🏗️ Architecture

### Structure des dossiers

```
src/auth/infrastructure/persistence/
├── models/                    # Modèles de persistence
│   ├── user.model.ts         # Modèle User pour la persistence
│   └── index.ts              # Exports des modèles
├── mappers/                   # Mappers entre modèles et domaine
│   ├── user.mapper.ts        # Mapper User ↔ UserModel
│   └── index.ts              # Exports des mappers
├── account.repository.postgresql.ts  # Repository PostgreSQL
├── prisma.ts                 # Configuration du client Prisma
├── layer.ts                  # Configuration des layers Effect
└── README.md                 # Documentation
```

## 🎯 Principes

### 1. Séparation des responsabilités

- **Modèles de persistence** : Représentent les données telles qu'elles sont stockées en base
- **Mappers** : Convertissent entre les modèles de persistence et les entités du domaine
- **Repositories** : Gèrent l'accès aux données avec Prisma

### 2. Avantages de cette approche

- ✅ **Types Prisma natifs** : Utilisation des types générés par Prisma
- ✅ **Séparation claire** : Domaine et persistence sont découplés
- ✅ **Facilité de test** : Mappers testables indépendamment
- ✅ **Flexibilité** : Changement d'ORM sans impacter le domaine

## 📝 Exemples d'usage

### Modèle de persistence

```typescript
// models/user.model.ts
export interface UserModel {
  readonly id: string;
  readonly email: string;
  readonly password: string;
  readonly createdAt: Date;
}
```

### Mapper

```typescript
// mappers/user.mapper.ts
export const mapUserModelToDomain = (userModel: UserModel): User => ({
  id: userModel.id,
  email: createEmail(userModel.email).pipe(Effect.runSync),
  password: userModel.password,
});

export const mapDomainToUserModel = (
  user: User
): Omit<UserModel, "createdAt"> => ({
  id: user.id,
  email: String(user.email),
  password: user.password,
});
```

### Repository

```typescript
// account.repository.postgresql.ts
save = (account: User): Effect.Effect<void, never, never> =>
  Effect.tryPromise({
    try: () => {
      const userModel = mapDomainToUserModel(account);
      return this.database.client.user.create({
        data: {
          id: userModel.id,
          email: userModel.email,
          password: userModel.password,
        },
      });
    },
    catch: () => new Error("Failed to save user"),
  }).pipe(Effect.catchAll(() => Effect.succeed(void 0)));
```

## 🔄 Flux de données

1. **Domaine → Repository** : L'entité du domaine est passée au repository
2. **Repository → Mapper** : L'entité est convertie en modèle de persistence
3. **Mapper → Prisma** : Le modèle est utilisé pour les opérations Prisma
4. **Prisma → Mapper** : Les données Prisma sont converties en modèle
5. **Mapper → Domaine** : Le modèle est converti en entité du domaine

## 🧪 Tests

Les mappers peuvent être testés indépendamment :

```typescript
describe("UserMapper", () => {
  it("should map domain to model", () => {
    const user = createUser("test@example.com", "password");
    const model = mapDomainToUserModel(user);
    expect(model.email).toBe("test@example.com");
  });
});
```

## 🚀 Configuration

### Variables d'environnement

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/travel"
```

### Scripts disponibles

```bash
# Générer le client Prisma
pnpm db:generate

# Créer et appliquer les migrations
pnpm db:migrate

# Ouvrir Prisma Studio
pnpm db:studio

# Initialiser la base de données
pnpm db:setup
```
