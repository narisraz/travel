import { AccountNotFoundError } from "@/auth/domain/exceptions/account-not-found.error.js"
import { InvalidPasswordError } from "@/auth/domain/exceptions/invalid-password.error.js"
import { PasswordMismatchError } from "@/auth/domain/exceptions/password-mismatch.error.js"
import { AccountRepository } from "@/auth/domain/repositories/account.repository.js"
import { PasswordService } from "@/auth/domain/services/password.service.js"
import type { Email } from "@/auth/domain/value-objects/Email.js"
import { Effect } from "effect"

type ResetPasswordRequest = {
  email: Email
  password: string
  confirmPassword: string
}

type ResetPasswordResult = Effect.Effect<
  { success: boolean },
  AccountNotFoundError | PasswordMismatchError | InvalidPasswordError,
  AccountRepository | PasswordService
>

function resetPassword(request: ResetPasswordRequest): ResetPasswordResult {
  return Effect.gen(function*() {
    const passwordService = yield* PasswordService
    const isValid = yield* passwordService.validatePassword(request.password)

    yield* Effect.fail(new InvalidPasswordError({})).pipe(Effect.unless(() => isValid))

    const accountRepository = yield* AccountRepository
    const account = yield* accountRepository.findByEmail(request.email)

    yield* Effect.fail(new AccountNotFoundError({})).pipe(Effect.unless(() => account !== null))

    yield* Effect.fail(new PasswordMismatchError({})).pipe(
      Effect.unless(() => request.password === request.confirmPassword)
    )

    const hashedPassword = yield* passwordService.hashPassword(request.password)

    yield* accountRepository.update(account!.id, { password: hashedPassword })

    return { success: true }
  })
}

export { resetPassword }
