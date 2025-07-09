import { createAccount } from "@/auth/application/use-cases/create-account.js"
import { createEmail } from "@/auth/domain/value-objects/Email.js"
import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"

const email = Effect.runSync(createEmail("test@test.com"))

describe("CreateAccount", () => {
  it("should create an account", () => {
    const result = createAccount(email, "password", "password")
    expect(result).toBe(true)
  })

  it("should not create an account if passwords do not match", () => {
    const result = createAccount(email, "password", "password2")
    expect(result).toBe(false)
  })

  it("should not create an account if password is not valid", () => {
    const result = createAccount(email, "123", "123")
    expect(result).toBe(false)
  })
})
