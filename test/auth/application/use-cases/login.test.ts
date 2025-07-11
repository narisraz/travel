import { login } from "@/auth/application/use-cases/login.js"
import type { User } from "@/auth/domain/entities/account.entity.js"
import { AccountNotFoundError } from "@/auth/domain/exceptions/account-not-found.error.js"
import { BadCredentialsError } from "@/auth/domain/exceptions/bad-credentials.error.js"
import { AccountRepository } from "@/auth/domain/repositories/account.repository.js"
import { PasswordService } from "@/auth/domain/services/password.service.js"
import { TokenService } from "@/auth/domain/services/token.service.js"
import { createEmail } from "@/auth/domain/value-objects/Email.js"
import { Effect, Layer, pipe } from "effect"
import { describe, expect, test } from "vitest"
import { createMockAccountRepository } from "../../domain/repositories/account.repository.mock.js"
import { createMockPasswordService } from "../../domain/services/password.service.mock.js"
import { createMockTokenService } from "../../domain/services/token.service.mock.js"

const password = "password"
const hashedPassword = "hashed-password"
const badPasswordHash = "bad-password-hash"
const email = Effect.runSync(createEmail("test@test.com"))
const notFoundEmail = Effect.runSync(createEmail("not-found@test.com"))
const accountId = "id"

const account: User = {
  id: accountId,
  email,
  password: hashedPassword
}

const dependencies = (hashedPassword: string) =>
  Layer.mergeAll(
    Layer.effect(PasswordService, createMockPasswordService(true, hashedPassword)),
    Layer.effect(AccountRepository, createMockAccountRepository([account])),
    Layer.effect(TokenService, createMockTokenService())
  )

describe("Login", () => {
  test("should generate a token", () =>
    pipe(
      Effect.gen(function*() {
        const request = {
          email,
          password
        }

        const result = yield* login(request)

        expect(result).toStrictEqual({ token: `token-${accountId}` })
      }),
      Effect.provide(dependencies(hashedPassword)),
      Effect.runPromise
    ))

  test("should fail if account not found", () =>
    pipe(
      Effect.gen(function*() {
        const request = {
          email: notFoundEmail,
          password
        }

        const error = yield* login(request).pipe(Effect.flip)

        expect(error).toBeInstanceOf(AccountNotFoundError)
      }),
      Effect.provide(dependencies(hashedPassword)),
      Effect.runPromise
    ))

  test("should fail if bad credentials", () =>
    pipe(
      Effect.gen(function*() {
        const request = {
          email,
          password: "bad-password"
        }

        const error = yield* login(request).pipe(Effect.flip)

        expect(error).toBeInstanceOf(BadCredentialsError)
      }),
      Effect.provide(dependencies(badPasswordHash)),
      Effect.runPromise
    ))
})
