import { JWTTokenService } from "@/auth/infrastructure/services/token.service.jwt.js"
import { Effect } from "effect"
import { describe, expect, test } from "vitest"

describe("JWTTokenService", () => {
  const tokenService = new JWTTokenService()

  test("should generate a token for a given account ID", async () => {
    const accountId = "test-account-id"

    const result = await Effect.runPromise(tokenService.generateToken(accountId))

    expect(result).toBeTypeOf("string")
    expect(result).not.toBe("")
    expect(result.length).toBeGreaterThan(0)
  })

  test("should generate different tokens for different account IDs", async () => {
    const accountId1 = "account-1"
    const accountId2 = "account-2"

    const token1 = await Effect.runPromise(tokenService.generateToken(accountId1))
    const token2 = await Effect.runPromise(tokenService.generateToken(accountId2))

    expect(token1).not.toBe(token2)
  })

  test("should verify a valid token", async () => {
    const accountId = "test-account-id"

    const token = await Effect.runPromise(tokenService.generateToken(accountId))
    const result = await Effect.runPromise(tokenService.verifyToken(token))

    expect(result.accountId).toBe(accountId)
  })

  test("should return empty account ID for invalid token", async () => {
    const invalidToken = "invalid-token"

    const result = await Effect.runPromise(tokenService.verifyToken(invalidToken))

    expect(result.accountId).toBe("")
  })

  test("should return empty account ID for expired token", async () => {
    // Test avec un token expiré (nous pourrions créer un service avec une expiration très courte)
    const expiredToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiJ0ZXN0IiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDF9.invalid"

    const result = await Effect.runPromise(tokenService.verifyToken(expiredToken))

    expect(result.accountId).toBe("")
  })
})
