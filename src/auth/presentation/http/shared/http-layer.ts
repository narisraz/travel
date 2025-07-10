import { Effect, Layer } from "effect"

// Mock dependencies for HTTP context
import { AccountRepository } from "@/auth/domain/repositories/account.repository.js"
import { IdGenerator } from "@/auth/domain/services/id-generator.service.js"
import { PasswordService } from "@/auth/domain/services/password.service.js"
import { TokenService } from "@/auth/domain/services/token.service.js"

// Mock layer for HTTP context (this should be replaced with actual implementations)
export const httpLayer = Layer.mergeAll(
  Layer.succeed(AccountRepository, {
    findByEmail: () => Effect.succeed(null),
    getAll: () => Effect.succeed([]),
    save: () => Effect.succeed(void 0)
  } as any),
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
