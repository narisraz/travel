import type { User } from "@/auth/domain/entities/account.entity.js"
import { createUser } from "@/auth/domain/entities/account.entity.js"
import { EmailAlreadyTakenError } from "@/auth/domain/exceptions/email-already-taken.error.js"
import { InvalidPasswordError } from "@/auth/domain/exceptions/invalid-password.error.js"
import { PasswordMismatchError } from "@/auth/domain/exceptions/password-mismatch.error.js"
import { AccountRepository } from "@/auth/domain/repositories/account.repository.js"
import { IdGenerator } from "@/auth/domain/services/id-generator.service.js"
import { PasswordService } from "@/auth/domain/services/password.service.js"
import type { Email } from "@/auth/domain/value-objects/Email.js"
import { Effect } from "effect"

type CreateAccountRequest = {
  readonly email: Email
  readonly password: string
  readonly confirmPassword: string
}

type CreateAccountResult = Effect.Effect<
  User,
  InvalidPasswordError | PasswordMismatchError | EmailAlreadyTakenError,
  PasswordService | IdGenerator | AccountRepository
>

function createAccount(request: CreateAccountRequest): CreateAccountResult {
  return Effect.gen(function*() {
    const { confirmPassword, email, password } = request

    const accountRepository = yield* AccountRepository
    const account = yield* accountRepository.findByEmail(email)

    yield* Effect.fail(new EmailAlreadyTakenError({})).pipe(Effect.unless(() => account === null))

    const passwordService = yield* PasswordService
    const isPasswordValid = yield* passwordService.validatePassword(password)

    yield* Effect.fail(new InvalidPasswordError({})).pipe(Effect.unless(() => isPasswordValid))
    yield* Effect.fail(new PasswordMismatchError({})).pipe(Effect.unless(() => password === confirmPassword))

    const idGenerator = yield* IdGenerator
    const id = yield* idGenerator.next()

    const hashedPassword = yield* passwordService.hashPassword(password)
    const user = createUser(id, email, hashedPassword).pipe(Effect.runSync)

    yield* accountRepository.save(user)

    return user
  })
}

export { createAccount }
