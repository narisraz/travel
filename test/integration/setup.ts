import { Effect } from "effect"
import type { StartedTestContainer } from "testcontainers"
import { GenericContainer, Wait } from "testcontainers"

export interface TestDatabase {
  readonly container: StartedTestContainer
  readonly connectionString: string
  readonly cleanup: () => Effect.Effect<void, never, never>
}

export const createTestDatabase = (): Effect.Effect<TestDatabase, never, never> =>
  Effect.gen(function*() {
    const container = yield* Effect.promise(() =>
      new GenericContainer("postgres:15-alpine")
        .withExposedPorts(5432)
        .withEnvironment({
          POSTGRES_DB: "travel_test",
          POSTGRES_USER: "test_user",
          POSTGRES_PASSWORD: "test_password"
        })
        .withWaitStrategy(Wait.forLogMessage("database system is ready to accept connections"))
        .start()
    )

    const host = container.getHost()
    const port = container.getMappedPort(5432)
    const connectionString = `postgresql://test_user:test_password@${host}:${port}/travel_test`

    const cleanup = () => Effect.promise(() => container.stop())

    return {
      container,
      connectionString,
      cleanup
    }
  })

export const setupTestDatabase = (connectionString: string): Effect.Effect<void, never, never> =>
  Effect.sync(() => {
    // Ici nous pourrions initialiser le schéma de base de données
    // Pour l'instant, nous utilisons SQLite en mémoire pour les tests
    console.log(`Test database ready at: ${connectionString}`)
  })
