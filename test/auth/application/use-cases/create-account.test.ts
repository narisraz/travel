import {
  createAccount,
  InvalidPasswordError,
  PasswordMismatchError
} from "@/auth/application/use-cases/create-account.js"
import type { User } from "@/auth/domain/entities/account.entity.js"
import { AccountRepository } from "@/auth/domain/repositories/account.repository.js"
import { IdGenerator } from "@/auth/domain/services/id-generator.service.js"
import { PasswordService } from "@/auth/domain/services/password.service.js"
import { createEmail } from "@/auth/domain/value-objects/Email.js"
import { describe, expect, test } from "@effect/vitest"
import { Effect, Exit, Layer, pipe } from "effect"

const validPassword = "password"
const anotherValidPassword = "another-password"
const invalidPassword = "invalid-password"
const hashedPassword = "hashed-password"
const id = "id"
const email = Effect.runSync(createEmail("test@test.com"))

const passwordService = (isValid: boolean) => ({
  validatePassword: (_: string) => Effect.succeed(isValid),
  hashPassword: (_: string) => Effect.succeed(hashedPassword)
})
const accountRepository = () => ({
  save: (account: User) => Effect.promise(() => Promise.resolve(account))
})
const idGenerator = () => ({
  next: () => Effect.succeed(id)
})

const dependencies = ({ isPasswordValid }: { isPasswordValid: boolean }) =>
  Layer.mergeAll(
    Layer.succeed(PasswordService, passwordService(isPasswordValid)),
    Layer.succeed(AccountRepository, accountRepository()),
    Layer.succeed(IdGenerator, idGenerator())
  )

describe("CreateAccount", () => {
  test("should create an account", () =>
    pipe(
      Effect.gen(function*() {
        const request = {
          email,
          password: validPassword,
          confirmPassword: validPassword
        }

        const result = yield* createAccount(request)

        expect(result).toStrictEqual({ id, email, password: hashedPassword })
      }),
      Effect.provide(dependencies({ isPasswordValid: true })),
      Effect.runPromise
    ))

  test("should not create an account if passwords do not match", () =>
    pipe(
      Effect.gen(function*() {
        const request = {
          email,
          password: validPassword,
          confirmPassword: anotherValidPassword
        }

        const result = yield* Effect.exit(createAccount(request))

        Exit.mapError(result, (error) => {
          expect(error).instanceOf(PasswordMismatchError)
        })
      }),
      Effect.provide(dependencies({ isPasswordValid: true })),
      Effect.runPromise
    ))

  test("should not create an account if password is not valid", () =>
    pipe(
      Effect.gen(function*() {
        const request = {
          email,
          password: invalidPassword,
          confirmPassword: invalidPassword
        }

        const result = yield* Effect.exit(createAccount(request))

        Exit.mapError(result, (error) => {
          expect(error).instanceOf(InvalidPasswordError)
        })
      }),
      Effect.provide(dependencies({ isPasswordValid: false })),
      Effect.runPromise
    ))
})
