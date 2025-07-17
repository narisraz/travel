# Tests d'Intégration

Ce dossier contient les tests d'intégration pour l'application Travel Backend.

## Structure

```
test/integration/
├── setup.ts                    # Configuration SQLite en mémoire
├── setup-sqlite-container.ts   # Configuration SQLite avec Testcontainers
├── auth/
│   ├── auth.integration.test.ts           # Tests d'intégration auth avec SQLite
│   └── auth.postgres.integration.test.ts  # Tests d'intégration auth avec SQLite container
└── profiles/
    └── profiles.integration.test.ts       # Tests d'intégration profiles
```

## Exécution des Tests

### Tests d'intégration avec SQLite (recommandé pour le développement)

```bash
pnpm test:integration
```

### Tests d'intégration avec SQLite Container (nécessite Docker)

```bash
# Assurez-vous que Docker est en cours d'exécution
pnpm test test/integration/auth/auth.postgres.integration.test.ts
```

### Tous les tests

```bash
pnpm test
```

## Configuration

### SQLite (par défaut)

Les tests utilisent SQLite en mémoire par défaut, ce qui est rapide et ne nécessite aucune configuration externe.

### SQLite avec Testcontainers

Pour les tests avec SQLite dans un conteneur, nous utilisons Testcontainers qui :

- Démarre automatiquement un conteneur Alpine avec SQLite
- Configure la base de données SQLite de test
- Nettoie automatiquement après les tests

**Prérequis :**

- Docker installé et en cours d'exécution
- Les dépendances Testcontainers installées

## Architecture des Tests

Les tests d'intégration suivent l'architecture hexagonale du projet :

1. **Use Cases** : Testent les cas d'usage métier
2. **Repositories** : Utilisent les vraies implémentations (SQLite/PostgreSQL)
3. **Services** : Utilisent les vraies implémentations (bcrypt, JWT, UUID)
4. **Layers Effect** : Fournissent les dépendances via le système de Context d'Effect

## Exemple de Test

```typescript
describe("Auth Integration Tests", () => {
  it("should create account and login successfully", async () => {
    const testLayer = Layer.mergeAll(
      SQLiteAccountRepositoryLayer,
      BcryptPasswordServiceLayer,
      JWTTokenServiceLayer,
      UuidIdGeneratorLayer
    );

    const email = createEmail("test@example.com").pipe(Effect.runSync);

    const createAccountResult = await Effect.runPromise(
      createAccount({
        email,
        password: "Password123!",
        confirmPassword: "Password123!",
      }).pipe(Effect.provide(testLayer))
    );

    expect(createAccountResult.email).toBe("test@example.com");
  });
});
```

## Bonnes Pratiques

1. **Isolation** : Chaque test doit être indépendant
2. **Nettoyage** : Les données de test sont automatiquement nettoyées
3. **Performance** : Utilisez SQLite pour les tests rapides, SQLite container pour les tests complets
4. **Fiabilité** : Testez les vrais cas d'usage métier
5. **Maintenabilité** : Réutilisez les layers Effect pour la cohérence
