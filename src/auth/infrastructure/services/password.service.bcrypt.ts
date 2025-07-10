import type { PasswordService } from "@/auth/domain/services/password.service.js"
import { PasswordService as PasswordServiceTag } from "@/auth/domain/services/password.service.js"
import * as bcrypt from "bcrypt"
import { Effect, Layer } from "effect"

export class BcryptPasswordService implements PasswordService {
  private readonly saltRounds = 12

  validatePassword = (password: string): Effect.Effect<boolean, never, never> =>
    Effect.succeed(this.isPasswordValid(password))

  hashPassword = (password: string): Effect.Effect<string, never, never> =>
    Effect.tryPromise({
      try: () => bcrypt.hash(password, this.saltRounds) as Promise<string>,
      catch: () => new Error("Failed to hash password")
    }).pipe(
      Effect.catchAll(() => Effect.succeed(""))
    )

  comparePassword = (password: string, hashedPassword: string): Effect.Effect<boolean, never, never> =>
    Effect.tryPromise({
      try: () => bcrypt.compare(password, hashedPassword),
      catch: () => new Error("Failed to compare password")
    }).pipe(
      Effect.catchAll(() => Effect.succeed(false))
    )

  private isPasswordValid(password: string): boolean {
    // Validation des critères de base :
    // - Au moins 8 caractères
    // - Au moins une lettre minuscule
    // - Au moins une lettre majuscule
    // - Au moins un chiffre
    // - Au moins un caractère spécial
    if (password.length < 8) return false
    if (!/[a-z]/.test(password)) return false
    if (!/[A-Z]/.test(password)) return false
    if (!/[0-9]/.test(password)) return false
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false

    return true
  }
}

export const createBcryptPasswordService = (): BcryptPasswordService => new BcryptPasswordService()

export const BcryptPasswordServiceLayer = Layer.succeed(
  PasswordServiceTag,
  createBcryptPasswordService()
)
