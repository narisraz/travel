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
      new GenericContainer("alpine:latest")
        .withExposedPorts(8080)
        .withCommand([
          "sh",
          "-c",
          "apk add --no-cache sqlite && sqlite3 /tmp/test.db 'CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY);' && echo 'SQLite database created' && tail -f /dev/null"
        ])
        .withWaitStrategy(Wait.forLogMessage("SQLite database created"))
        .start()
    )

    const connectionString = `sqlite:///tmp/test.db`

    const cleanup = () => Effect.promise(() => container.stop())

    return {
      container,
      connectionString,
      cleanup
    }
  })

export const setupTestDatabase = (connectionString: string): Effect.Effect<void, never, never> =>
  Effect.sync(() => {
    console.log(`Test database ready at: ${connectionString}`)
  })
