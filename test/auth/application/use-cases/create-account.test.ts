import { createAccount } from "@/auth/application/use-cases/create-account.js"
import type { User } from "@/auth/domain/entities/account.entity.js"
import { AccountRepository } from "@/auth/domain/repositories/account.repository.js"
import { IdGenerator } from "@/auth/domain/services/id-generator.service.js"
import { PasswordService } from "@/auth/domain/services/password.service.js"
import { createEmail } from "@/auth/domain/value-objects/Email.js"
import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"

const email = Effect.runSync(createEmail("test@test.com"))
const passwordService = ({
  isValid
}: {
  isValid: boolean
}) => ({
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

describe("CreateAccount", () => {
  it("should create an account", async () => {
    const result = await createAccount(email, validPassword, validPassword)
      .pipe(
        Effect.provideService(PasswordService, passwordService({ isValid: true })),
        Effect.provideService(AccountRepository, accountRepository()),
        Effect.provideService(IdGenerator, idGenerator()),
        Effect.runPromise
      )

    expect(result).toStrictEqual({ id: "id", email, password: "hashed-password" })
  })

  it("should not create an account if passwords do not match", () => {
    const result = createAccount(email, validPassword, anotherValidPassword)
      .pipe(
        Effect.provideService(PasswordService, passwordService({ isValid: true })),
        Effect.provideService(AccountRepository, accountRepository()),
        Effect.provideService(IdGenerator, idGenerator()),
        Effect.runSyncExit
      )

    expect(result._tag).toBe("Failure")
  })

  it("should not create an account if password is not valid", () => {
    const result = createAccount(email, invalidPassword, invalidPassword)
      .pipe(
        Effect.provideService(PasswordService, passwordService({ isValid: false })),
        Effect.provideService(AccountRepository, accountRepository()),
        Effect.provideService(IdGenerator, idGenerator()),
        Effect.runSyncExit
      )

    expect(result._tag).toBe("Failure")
  })
})
