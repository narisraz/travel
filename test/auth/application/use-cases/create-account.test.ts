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
import { describe, expect, it } from "@effect/vitest"
import { Effect, Either, Layer } from "effect"

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
  it("should create an account", async () => {
    const result = await createAccount(email, validPassword, validPassword)
      .pipe(
        Effect.provide(dependencies({ isPasswordValid: true })),
        Effect.runPromise
      )

    expect(result).toStrictEqual({ id: "id", email, password: "hashed-password" })
  })

  it("should not create an account if passwords do not match", () => {
    const result = createAccount(email, validPassword, anotherValidPassword)
      .pipe(
        Effect.provide(dependencies({ isPasswordValid: true })),
        Effect.either,
        Effect.runSync
      )

    expect(result).toStrictEqual(Either.left(new PasswordMismatchError({})))
  })

  it("should not create an account if password is not valid", () => {
    const result = createAccount(email, invalidPassword, invalidPassword)
      .pipe(
        Effect.provide(dependencies({ isPasswordValid: false })),
        Effect.either,
        Effect.runSync
      )

    expect(result).toStrictEqual(Either.left(new InvalidPasswordError({})))
  })
})
