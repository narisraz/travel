import { PasswordService } from "@/auth/application/services/password.service.js"
import type { Email } from "@/auth/domain/value-objects/Email.js"
import { Effect } from "effect"

function createAccount(email: Email, password: string, confirmPassword: string) {
  return Effect.gen(function*() {
    const passwordService = yield* PasswordService

    const isPasswordValid = yield* passwordService.validatePassword(password)
    if (!isPasswordValid) {
      return false
    }

    if (password !== confirmPassword) {
      return false
    }

    return true
  })
}

export { createAccount }
