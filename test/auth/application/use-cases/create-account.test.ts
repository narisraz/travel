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

const email = Effect.runSync(createEmail("test@test.com"))
const passwordService = (isValid: boolean) => ({
  validatePassword: (_: string) => Effect.succeed(isValid),
  hashPassword: (_: string) => Effect.succeed("hashed-password")
})
const accountRepository = () => ({
  save: (account: User) => Effect.promise(() => Promise.resolve(account))
})
const idGenerator = () => ({
  next: () => Effect.succeed("id")
})

const validPassword = "password"
const anotherValidPassword = "another-password"
const invalidPassword = "invalid-password"

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
        const result = yield* createAccount(email, validPassword, validPassword)

        expect(result).toStrictEqual({ id: "id", email, password: "hashed-password" })
      }),
      Effect.provide(dependencies({ isPasswordValid: true })),
      Effect.runPromise
    ))

  test("should not create an account if passwords do not match", () =>
    pipe(
      Effect.gen(function*() {
        const result = yield* createAccount(email, validPassword, anotherValidPassword)

        expect(result).toStrictEqual(Exit.fail(new PasswordMismatchError({})))
      }),
      Effect.provide(dependencies({ isPasswordValid: true })),
      Effect.runPromiseExit
    ))

  test("should not create an account if password is not valid", () =>
    pipe(
      Effect.gen(function*() {
        const result = yield* createAccount(email, invalidPassword, invalidPassword)

        expect(result).toStrictEqual(Exit.fail(new InvalidPasswordError({})))
      }),
      Effect.provide(dependencies({ isPasswordValid: false })),
      Effect.runPromiseExit
    ))
})
