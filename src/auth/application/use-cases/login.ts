import { AccountRepository } from "@/auth/domain/repositories/account.repository.js"
import { PasswordService } from "@/auth/domain/services/password.service.js"
import { TokenService } from "@/auth/domain/services/token.service.js"
import type { Email } from "@/auth/domain/value-objects/Email.js"
import { Data, Effect } from "effect"

export class BadCredentialsError extends Data.TaggedError("BadCredentialsError")<object> {}
export class AccountNotFoundError extends Data.TaggedError("AccountNotFoundError")<object> {}

type LoginRequest = {
  email: Email
  password: string
}

type LoginResult = Effect.Effect<
  { token: string },
  BadCredentialsError | AccountNotFoundError,
  AccountRepository | PasswordService | TokenService
>

function login(request: LoginRequest): LoginResult {
  return Effect.gen(function*() {
    const accountRepository = yield* AccountRepository
    const account = yield* accountRepository.findByEmail(request.email)

    yield* Effect.fail(new AccountNotFoundError({})).pipe(Effect.unless(() => account !== null))

    const passwordService = yield* PasswordService
    const hashedPassword = yield* passwordService.hashPassword(request.password)

    yield* Effect.fail(new BadCredentialsError({})).pipe(Effect.unless(() => account!.password === hashedPassword))

    const tokenService = yield* TokenService
    const token = yield* tokenService.generateToken(account!.id)

    return { token }
  })
}

export { login }
