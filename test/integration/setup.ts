import { createPrismaDatabase } from "@/auth/infrastructure/persistence/prisma.js"
import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql"
import { PostgreSqlContainer } from "@testcontainers/postgresql"
import { Effect } from "effect"

export interface TestDatabase {
  readonly container: StartedPostgreSqlContainer
  readonly connectionString: string
  readonly cleanup: () => Effect.Effect<void, never, never>
}

export const createTestDatabase = (): Effect.Effect<TestDatabase, never, never> =>
  Effect.gen(function*() {
    const container = yield* Effect.promise(() =>
      new PostgreSqlContainer("postgres:15-alpine")
        .withDatabase("travel_test")
        .withUsername("postgres")
        .withPassword("postgres")
        .start()
    )

    const connectionString = container.getConnectionUri()

    const cleanup = () => Effect.promise(() => container.stop())

    return {
      container,
      connectionString,
      cleanup
    }
  })

export const setupTestDatabase = (connectionString: string): Effect.Effect<void, never, never> =>
  Effect.gen(function*() {
    // Sauvegarder l'URL de base de données originale
    const originalDatabaseUrl = process.env.DATABASE_URL

    // Définir l'URL de test
    process.env.DATABASE_URL = connectionString

    try {
      // Créer et initialiser la base de données de test
      const database = yield* createPrismaDatabase()
      yield* database.initialize()
      yield* database.close()

      console.log(`✅ Test database initialized at: ${connectionString}`)
    } finally {
      // Restaurer l'URL originale
      if (originalDatabaseUrl) {
        process.env.DATABASE_URL = originalDatabaseUrl
      } else {
        delete process.env.DATABASE_URL
      }
    }
  })
