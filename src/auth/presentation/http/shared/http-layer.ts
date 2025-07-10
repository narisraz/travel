import { Effect, Layer } from "effect"

import { TokenService } from "@/auth/domain/services/token.service.js"
import { SQLiteAccountRepositoryLayer } from "@/auth/infrastructure/persistence/layer.js"
import { UuidIdGeneratorLayer } from "@/auth/infrastructure/services/id-generator.service.uuid.js"
import { BcryptPasswordServiceLayer } from "@/auth/infrastructure/services/password.service.bcrypt.js"

export const httpLayer = Layer.mergeAll(
  SQLiteAccountRepositoryLayer,
  UuidIdGeneratorLayer,
  BcryptPasswordServiceLayer,
  Layer.succeed(TokenService, {
    generateToken: () => Effect.succeed("mock-token")
  } as any)
)
