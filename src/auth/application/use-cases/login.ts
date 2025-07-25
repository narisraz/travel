import { AccountNotFoundError } from "@/auth/domain/exceptions/account-not-found.error.js"
import { BadCredentialsError } from "@/auth/domain/exceptions/bad-credentials.error.js"
import { AccountRepository } from "@/auth/domain/repositories/account.repository.js"
import { PasswordService } from "@/auth/domain/services/password.service.js"
import { TokenService } from "@/auth/domain/services/token.service.js"
import type { Email } from "@/auth/domain/value-objects/Email.js"
import { Effect } from "effect"

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
    const isPasswordValid = yield* passwordService.comparePassword(request.password, account!.password)

    yield* Effect.fail(new BadCredentialsError({})).pipe(Effect.unless(() => isPasswordValid))

    const tokenService = yield* TokenService
    const token = yield* tokenService.generateToken(account!.id)

    return { token }
  })
}

export { login }
