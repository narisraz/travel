import { AccountRepository } from "@/auth/domain/repositories/account.repository.js"
import { PasswordService } from "@/auth/domain/services/password.service.js"
import type { Email } from "@/auth/domain/value-objects/Email.js"
import { Data, Effect } from "effect"

export class InvalidPasswordError extends Data.TaggedError("InvalidPasswordError")<object> {}

export class PasswordMismatchError extends Data.TaggedError("PasswordMismatchError")<object> {}

function createAccount(email: Email, password: string, confirmPassword: string) {
  return Effect.gen(function*() {
    const passwordService = yield* PasswordService

    const isPasswordValid = yield* passwordService.validatePassword(password)
    if (!isPasswordValid) {
      return yield* Effect.fail(new InvalidPasswordError({}))
    }

    if (password !== confirmPassword) {
      return yield* Effect.fail(new PasswordMismatchError({}))
    }

    const hashedPassword = yield* passwordService.hashPassword(password)

    const accountRepository = yield* AccountRepository

    return yield* accountRepository.save({ email, password: hashedPassword })
  })
}

export { createAccount }
