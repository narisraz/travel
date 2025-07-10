import { Effect, Layer } from "effect"

// Real implementation for HTTP context
import { IdGenerator } from "@/auth/domain/services/id-generator.service.js"
import { PasswordService } from "@/auth/domain/services/password.service.js"
import { TokenService } from "@/auth/domain/services/token.service.js"
import { SQLiteAccountRepositoryLayer } from "@/auth/infrastructure/persistence/layer.js"

// HTTP layer with SQLite implementation for AccountRepository and mocks for other services
export const httpLayer = Layer.mergeAll(
  SQLiteAccountRepositoryLayer,
  Layer.succeed(IdGenerator, {
    next: () => Effect.succeed("mock-id")
  } as any),
  Layer.succeed(PasswordService, {
    validatePassword: () => Effect.succeed(true),
    hashPassword: (password: string) => Effect.succeed(`hashed-${password}`)
  } as any),
  Layer.succeed(TokenService, {
    generateToken: () => Effect.succeed("mock-token")
  } as any)
)
