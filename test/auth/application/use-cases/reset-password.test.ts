import { resetPassword } from "@/auth/application/use-cases/reset-password.js"
import { AccountNotFoundError } from "@/auth/domain/exceptions/account-not-found.error.js"
import { InvalidPasswordError } from "@/auth/domain/exceptions/invalid-password.error.js"
import { PasswordMismatchError } from "@/auth/domain/exceptions/password-mismatch.error.js"
import { AccountRepository } from "@/auth/domain/repositories/account.repository.js"
import { PasswordService } from "@/auth/domain/services/password.service.js"
import { createEmail } from "@/auth/domain/value-objects/Email.js"
import { describe, expect, test } from "@effect/vitest"
import { Effect, Layer, pipe } from "effect"
import { createMockAccountRepository } from "../../domain/repositories/account.repository.mock.js"
import { createMockPasswordService } from "../../domain/services/password.service.mock.js"

const email = Effect.runSync(createEmail("test@test.com"))
const notFoundEmail = Effect.runSync(createEmail("not-found@test.com"))
const account = {
  id: "1",
  email,
  password: "password"
}

const dependencies = (
  { hashedPassword = "hashed-password", isValid = true }: { hashedPassword?: string; isValid?: boolean } = {}
) =>
  Layer.mergeAll(
    Layer.effect(AccountRepository, createMockAccountRepository([account])),
    Layer.effect(PasswordService, createMockPasswordService(isValid, hashedPassword))
  )

describe("ResetPassword", () => {
  test("should reset the password", () =>
    pipe(
      Effect.gen(function*() {
        const request = {
          email,
          password: "password",
          confirmPassword: "password"
        }

        const result = yield* resetPassword(request)

        expect(result).toStrictEqual({
          success: true
        })
      }),
      Effect.provide(dependencies()),
      Effect.runPromise
    ))

  test("should fail if the email is not found", () =>
    pipe(
      Effect.gen(function*() {
        const request = {
          email: notFoundEmail,
          password: "password",
          confirmPassword: "password"
        }

        const result = yield* resetPassword(request).pipe(Effect.flip)

        expect(result).toBeInstanceOf(AccountNotFoundError)
      }),
      Effect.provide(dependencies()),
      Effect.runPromise
    ))

  test("should fail if the password and confirm password do not match", () =>
    pipe(
      Effect.gen(function*() {
        const request = {
          email,
          password: "password",
          confirmPassword: "password2"
        }

        const result = yield* resetPassword(request).pipe(Effect.flip)

        expect(result).toBeInstanceOf(PasswordMismatchError)
      }),
      Effect.provide(dependencies()),
      Effect.runPromise
    ))

  test("should fail if the password is not valid", () =>
    pipe(
      Effect.gen(function*() {
        const request = {
          email,
          password: "invalid-password",
          confirmPassword: "password"
        }

        const result = yield* resetPassword(request).pipe(Effect.flip)

        expect(result).toBeInstanceOf(InvalidPasswordError)
      }),
      Effect.provide(dependencies({ isValid: false })),
      Effect.runPromise
    ))

  test("should reset the password if the password is valid", () =>
    pipe(
      Effect.gen(function*() {
        const request = {
          email,
          password: "new-password",
          confirmPassword: "new-password"
        }

        yield* resetPassword(request)

        const accountRepository = yield* AccountRepository
        const account = yield* accountRepository.findByEmail(request.email)

        expect(account).toStrictEqual({
          ...account,
          password: "new-hashed-password"
        })
      }),
      Effect.provide(dependencies({ hashedPassword: "new-hashed-password" })),
      Effect.runPromise
    ))
})
