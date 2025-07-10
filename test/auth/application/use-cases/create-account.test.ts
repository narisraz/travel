import {
  createAccount,
  InvalidPasswordError,
  PasswordMismatchError
} from "@/auth/application/use-cases/create-account.js"
import { AccountRepository } from "@/auth/domain/repositories/account.repository.js"
import { IdGenerator } from "@/auth/domain/services/id-generator.service.js"
import { PasswordService } from "@/auth/domain/services/password.service.js"
import { createEmail } from "@/auth/domain/value-objects/Email.js"
import { describe, expect, test } from "@effect/vitest"
import { Effect, Exit, Layer, pipe } from "effect"
import { createAccountRepository } from "../../domain/repositories/account.repository.mock.js"
import { createIdGenerator } from "../../domain/services/id-generator.service.mock.js"
import { createPasswordService } from "../../domain/services/password.service.mock.js"

const validPassword = "password"
const anotherValidPassword = "another-password"
const invalidPassword = "invalid-password"
const hashedPassword = "hashed-password"
const id = "id"
const email = Effect.runSync(createEmail("test@test.com"))

const dependencies = ({ isPasswordValid }: { isPasswordValid: boolean }) =>
  Layer.mergeAll(
    Layer.effect(PasswordService, createPasswordService(isPasswordValid, hashedPassword)),
    Layer.effect(AccountRepository, createAccountRepository([])),
    Layer.effect(IdGenerator, createIdGenerator(id))
  )

describe("CreateAccount", () => {
  test("should return an account when it is created", () =>
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

  test("should save the account in the repository", () =>
    pipe(
      Effect.gen(function*() {
        const request = {
          email,
          password: validPassword,
          confirmPassword: validPassword
        }

        yield* createAccount(request)

        const accountRepository = yield* AccountRepository
        const accounts = yield* accountRepository.getAll()

        expect(accounts).toHaveLength(1)
        expect(accounts[0]).toStrictEqual({ id, email, password: hashedPassword })
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
