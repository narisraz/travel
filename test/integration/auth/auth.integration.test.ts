import { createAccount } from "@/auth/application/use-cases/create-account.js"
import { login } from "@/auth/application/use-cases/login.js"
import { createEmail } from "@/auth/domain/value-objects/Email.js"
import { SQLiteAccountRepositoryLayerWithPath } from "@/auth/infrastructure/persistence/layer.js"
import { BcryptPasswordServiceLayer } from "@/auth/infrastructure/services/password.service.bcrypt.js"
import { JWTTokenServiceLayer } from "@/auth/infrastructure/services/token.service.jwt.js"
import { UuidIdGeneratorLayer } from "@/shared/infrastructure/services/id-generator.service.uuid.js"
import { randomUUID } from "crypto"
import { Effect, Layer } from "effect"
import { describe, expect, it } from "vitest"

describe("Auth Integration Tests", () => {
  const createTestLayer = () => {
    const dbPath = `:memory:${randomUUID()}`
    return Layer.mergeAll(
      SQLiteAccountRepositoryLayerWithPath(dbPath),
      BcryptPasswordServiceLayer,
      JWTTokenServiceLayer,
      UuidIdGeneratorLayer
    )
  }

  it("should create account and login successfully", async () => {
    const testLayer = createTestLayer()

    const email = createEmail("test1@example.com").pipe(Effect.runSync)

    const createAccountResult = await Effect.runPromise(
      createAccount({
        email,
        password: "Password123!",
        confirmPassword: "Password123!"
      }).pipe(Effect.provide(testLayer))
    )

    expect(createAccountResult.email).toBe("test1@example.com")

    const loginResult = await Effect.runPromise(
      login({
        email,
        password: "Password123!"
      }).pipe(Effect.provide(testLayer))
    )

    expect(loginResult.token).toBeDefined()
  })

  it("should fail login with wrong password", async () => {
    const testLayer = createTestLayer()

    const email = createEmail("test2@example.com").pipe(Effect.runSync)

    // Create account first
    await Effect.runPromise(
      createAccount({
        email,
        password: "Password123!",
        confirmPassword: "Password123!"
      }).pipe(Effect.provide(testLayer))
    )

    await expect(
      Effect.runPromise(
        login({
          email,
          password: "wrongpassword"
        }).pipe(Effect.provide(testLayer))
      )
    ).rejects.toThrow()
  })

  it("should fail to create account with existing email", async () => {
    const testLayer = createTestLayer()

    const email = createEmail("test3@example.com").pipe(Effect.runSync)

    // Create account first
    await Effect.runPromise(
      createAccount({
        email,
        password: "Password123!",
        confirmPassword: "Password123!"
      }).pipe(Effect.provide(testLayer))
    )

    // Try to create account with same email
    await expect(
      Effect.runPromise(
        createAccount({
          email,
          password: "Password123!",
          confirmPassword: "Password123!"
        }).pipe(Effect.provide(testLayer))
      )
    ).rejects.toThrow()
  })

  it("should fail login with non-existent account", async () => {
    const testLayer = createTestLayer()

    const email = createEmail("nonexistent@example.com").pipe(Effect.runSync)

    await expect(
      Effect.runPromise(
        login({
          email,
          password: "Password123!"
        }).pipe(Effect.provide(testLayer))
      )
    ).rejects.toThrow()
  })
})
