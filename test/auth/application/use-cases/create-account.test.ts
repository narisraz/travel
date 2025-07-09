import { PasswordService } from "@/auth/application/services/password.service.js"
import { createAccount } from "@/auth/application/use-cases/create-account.js"
import { createEmail } from "@/auth/domain/value-objects/Email.js"
import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"

const email = Effect.runSync(createEmail("test@test.com"))
const checkPasswordValidity = (value: boolean) => ({
  validatePassword: (_) => Effect.succeed(value)
})
const validPassword = "password"
const anotherValidPassword = "another-password"
const invalidPassword = "invalid-password"

describe("CreateAccount", () => {
  it("should create an account", () => {
    const result = Effect.runSync(
      createAccount(email, validPassword, validPassword)
        .pipe(Effect.provideService(PasswordService, checkPasswordValidity(true)))
    )
    expect(result).toBe(true)
  })

  it("should not create an account if passwords do not match", () => {
    const result = Effect.runSync(
      createAccount(email, validPassword, anotherValidPassword)
        .pipe(Effect.provideService(PasswordService, checkPasswordValidity(true)))
    )
    expect(result).toBe(false)
  })

  it("should not create an account if password is not valid", () => {
    const result = Effect.runSync(
      createAccount(email, invalidPassword, invalidPassword)
        .pipe(Effect.provideService(PasswordService, checkPasswordValidity(false)))
    )
    expect(result).toBe(false)
  })
})
