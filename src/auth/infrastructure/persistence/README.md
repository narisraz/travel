# Implémentation SQLite du Repository Account

Cette implémentation fournit une persistence SQLite pour le repository Account en utilisant better-sqlite3.

## Structure

- `database.ts` : Configuration et initialisation de la base de données SQLite
- `account.repository.sqlite.ts` : Implémentation du repository Account
- `layer.ts` : Layers Effect pour l'injection de dépendances
- `index.ts` : Exports publics du module

## Usage

### Utilisation avec Layer (Recommandé)

```typescript
import { SQLiteAccountRepositoryLayer } from "@/auth/infrastructure/persistence/layer.js";
import { Effect } from "effect";

// Utilisation avec base de données en mémoire
const program = Effect.gen(function* () {
  const accountRepository = yield* AccountRepository;
  // Utiliser le repository...
}).pipe(Effect.provide(SQLiteAccountRepositoryLayer));

// Utilisation avec un fichier de base de données
const programWithFile = Effect.gen(function* () {
  const accountRepository = yield* AccountRepository;
  // Utiliser le repository...
}).pipe(
  Effect.provide(SQLiteAccountRepositoryLayerWithPath("./database.sqlite"))
);
```

### Utilisation directe

```typescript
import {
  createDatabase,
  createSQLiteAccountRepository,
} from "@/auth/infrastructure/persistence/index.js";
import { Effect } from "effect";

const program = Effect.gen(function* () {
  // Créer et initialiser la base de données
  const database = yield* createDatabase();
  yield* database.initialize();

  // Créer le repository
  const repository = createSQLiteAccountRepository(database);

  // Utiliser le repository
  const users = yield* repository.getAll();
  return users;
});
```

## Schéma de base de données

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```
