import type { PasswordService } from "@/auth/domain/services/password.service.js"
import { Effect, Ref } from "effect"

class MockPasswordService implements PasswordService {
  constructor(private isValid: Ref.Ref<boolean>, private hashedPassword: Ref.Ref<string>) {}

  validatePassword(_: string): Effect.Effect<boolean> {
    const isValid = this.isValid
    return Effect.gen(function*() {
      const currentIsValid = yield* Ref.get(isValid)
      return currentIsValid
    })
  }

  hashPassword(_: string): Effect.Effect<string> {
    const hashedPassword = this.hashedPassword
    return Effect.gen(function*() {
      const currentHashedPassword = yield* Ref.get(hashedPassword)
      return currentHashedPassword
    })
  }

  comparePassword(_: string, hashedPassword: string): Effect.Effect<boolean> {
    const hashedPasswordRef = this.hashedPassword
    return Effect.gen(function*() {
      const currentHashedPassword = yield* Ref.get(hashedPasswordRef)
      return currentHashedPassword === hashedPassword
    })
  }
}

const createMockPasswordService = (isValid: boolean, hashedPassword: string) =>
  Effect.gen(function*() {
    const isValidRef = yield* Ref.make(isValid)
    const hashedPasswordRef = yield* Ref.make(hashedPassword)
    return new MockPasswordService(isValidRef, hashedPasswordRef)
  })

export { createMockPasswordService }
