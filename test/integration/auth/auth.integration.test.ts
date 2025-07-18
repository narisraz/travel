import { createAccount } from "@/auth/application/use-cases/create-account.js"
import { login } from "@/auth/application/use-cases/login.js"
import { createEmail } from "@/auth/domain/value-objects/Email.js"
import { Effect } from "effect"
import { describe, expect, it } from "vitest"
import { withTestDatabase } from "../helpers/test-database.js"

describe("Auth Integration Tests", () => {
  it("should create account and login successfully", async () => {
    await Effect.runPromise(
      withTestDatabase((environment) =>
        Effect.gen(function*() {
          const email = createEmail("test1@example.com").pipe(Effect.runSync)

          const createAccountResult = yield* createAccount({
            email,
            password: "Password123!",
            confirmPassword: "Password123!"
          }).pipe(Effect.provide(environment.layer))

          expect(createAccountResult.email).toBe("test1@example.com")

          const loginResult = yield* login({
            email,
            password: "Password123!"
          }).pipe(Effect.provide(environment.layer))

          expect(loginResult.token).toBeDefined()
        })
      )
    )
  })

  it("should fail login with wrong password", async () => {
    await expect(
      Effect.runPromise(
        withTestDatabase((environment) =>
          Effect.gen(function*() {
            const email = createEmail("test2@example.com").pipe(Effect.runSync)

            // Create account first
            yield* createAccount({
              email,
              password: "Password123!",
              confirmPassword: "Password123!"
            }).pipe(Effect.provide(environment.layer))

            // Try to login with wrong password
            yield* login({
              email,
              password: "wrongpassword"
            }).pipe(Effect.provide(environment.layer))
          })
        )
      )
    ).rejects.toThrow()
  })

  it("should fail to create account with existing email", async () => {
    await expect(
      Effect.runPromise(
        withTestDatabase((environment) =>
          Effect.gen(function*() {
            const email = createEmail("test3@example.com").pipe(Effect.runSync)

            // Create account first
            yield* createAccount({
              email,
              password: "Password123!",
              confirmPassword: "Password123!"
            }).pipe(Effect.provide(environment.layer))

            // Try to create account with same email
            yield* createAccount({
              email,
              password: "Password123!",
              confirmPassword: "Password123!"
            }).pipe(Effect.provide(environment.layer))
          })
        )
      )
    ).rejects.toThrow()
  })

  it("should fail login with non-existent account", async () => {
    await expect(
      Effect.runPromise(
        withTestDatabase((environment) =>
          Effect.gen(function*() {
            const email = createEmail("nonexistent@example.com").pipe(Effect.runSync)

            yield* login({
              email,
              password: "Password123!"
            }).pipe(Effect.provide(environment.layer))
          })
        )
      )
    ).rejects.toThrow()
  })
})
