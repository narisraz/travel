import { PostgreSQLAccountRepositoryLayer } from "@/auth/infrastructure/persistence/layer.js"
import { BcryptPasswordServiceLayer } from "@/auth/infrastructure/services/password.service.bcrypt.js"
import { JWTTokenServiceLayer } from "@/auth/infrastructure/services/token.service.jwt.js"
import { PostgreSQLHotelRepositoryLayer } from "@/profiles/infrastructure/persistence/layer.js"
import { UuidIdGeneratorLayer } from "@/shared/infrastructure/services/id-generator.service.uuid.js"
import { Effect, Layer } from "effect"
import { createTestDatabase, setupTestDatabase } from "../setup.js"

export interface TestEnvironment {
  readonly database: {
    readonly container: any
    readonly connectionString: string
    readonly cleanup: () => Effect.Effect<void, never, never>
  }
  readonly layer: Layer.Layer<any, never, never>
}

export const createTestEnvironment = (): Effect.Effect<TestEnvironment, never, never> =>
  Effect.gen(function*() {
    // Créer la base de données de test
    const database = yield* createTestDatabase()

    // Initialiser le schéma
    yield* setupTestDatabase(database.connectionString)

    // Créer le layer de test avec la base de données configurée
    const testLayer = Layer.mergeAll(
      PostgreSQLAccountRepositoryLayer,
      PostgreSQLHotelRepositoryLayer,
      BcryptPasswordServiceLayer,
      JWTTokenServiceLayer,
      UuidIdGeneratorLayer
    )

    return {
      database,
      layer: testLayer
    }
  })

export const withTestDatabase = <T, E>(
  testFn: (environment: TestEnvironment) => Effect.Effect<T, E, never>
): Effect.Effect<T, E, never> =>
  Effect.gen(function*() {
    const environment = yield* createTestEnvironment()

    try {
      return yield* testFn(environment)
    } finally {
      yield* environment.database.cleanup()
    }
  })
