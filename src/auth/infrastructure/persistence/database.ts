import Database from "better-sqlite3"
import { Effect } from "effect"

export interface SQLiteDatabase {
  readonly db: Database.Database
  readonly close: () => Effect.Effect<void, never, never>
  readonly initialize: () => Effect.Effect<void, never, never>
}

export const createDatabase = (path: string = ":memory:"): Effect.Effect<SQLiteDatabase, never, never> =>
  Effect.sync(() => {
    const db = new Database(path)

    const initialize = () =>
      Effect.sync(() => {
        // Créer la table users si elle n'existe pas
        db.exec(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `)

        // Créer un index sur l'email pour optimiser les recherches
        db.exec(`
          CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
        `)
      })

    const close = () =>
      Effect.sync(() => {
        db.close()
      })

    return {
      db,
      close,
      initialize
    }
  })
