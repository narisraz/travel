import { Effect, Layer } from "effect"

import { PasswordService } from "@/auth/domain/services/password.service.js"
import { TokenService } from "@/auth/domain/services/token.service.js"
import { SQLiteAccountRepositoryLayer } from "@/auth/infrastructure/persistence/layer.js"
import { UuidIdGeneratorLayer } from "@/auth/infrastructure/services/id-generator.service.uuid.js"

export const httpLayer = Layer.mergeAll(
  SQLiteAccountRepositoryLayer,
  UuidIdGeneratorLayer,
  Layer.succeed(PasswordService, {
    validatePassword: () => Effect.succeed(true),
    hashPassword: (password: string) => Effect.succeed(`hashed-${password}`)
  } as any),
  Layer.succeed(TokenService, {
    generateToken: () => Effect.succeed("mock-token")
  } as any)
)
