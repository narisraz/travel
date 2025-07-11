import type { TokenService } from "@/auth/domain/services/token.service.js"
import { JWTTokenService } from "@/auth/infrastructure/services/token.service.jwt.js"
import { Effect } from "effect"
import jwt from "jsonwebtoken"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

describe("JWTTokenService", () => {
  const secret = "test-secret"
  const accountId = "test-account-id"
  const now = 1625097600 // 2021-07-01T00:00:00Z (in seconds)

  // Mock process.env and Date.now
  const originalEnv = process.env
  const originalDateNow = Date.now
  let tokenService: TokenService

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv, JWT_SECRET: secret }
    Date.now = vi.fn(() => now * 1000) // Convert to milliseconds
    tokenService = new JWTTokenService()
  })

  afterEach(() => {
    process.env = originalEnv
    Date.now = originalDateNow
    vi.restoreAllMocks()
  })

  describe("generateToken", () => {
    it("should generate a valid token", async () => {
      const token = await Effect.runPromise(tokenService.generateToken(accountId))
      expect(token).not.toBe("")

      const decoded = jwt.verify(token, secret) as { accountId: string; iat: number; exp: number }
      expect(decoded.accountId).toBe(accountId)
      expect(decoded.iat).toBe(now)
      expect(decoded.exp).toBe(now + 24 * 3600)
    })

    it("should return an empty string on error", async () => {
      // Simulate error by mocking jwt.sign
      vi.spyOn(jwt, "sign").mockImplementation(() => {
        throw new Error("Signing error")
      })

      const token = await Effect.runPromise(tokenService.generateToken(accountId))
      expect(token).toBe("")
    })
  })

  describe("validateToken", () => {
    it("should validate a valid token", async () => {
      // Create a valid token that expires in 23h
      const token = jwt.sign(
        { accountId, iat: now },
        secret,
        { expiresIn: "24h" }
      )
      const result = await Effect.runPromise(tokenService.validateToken(token))
      expect(result).toEqual({
        isValid: true,
        accountId,
        shouldRefresh: false
      })
    })

    it("should indicate when a token needs refresh", async () => {
      // Create a token that expires in 4 minutes (below 5 minutes threshold)
      const token = jwt.sign(
        { accountId, iat: now },
        secret,
        { expiresIn: "4m" }
      )
      const result = await Effect.runPromise(tokenService.validateToken(token))
      expect(result).toEqual({
        isValid: true,
        accountId,
        shouldRefresh: true
      })
    })

    it("should reject an expired token", async () => {
      // Create a token that expired 1 hour ago
      const token = jwt.sign(
        { accountId, iat: now - 7200 },
        secret,
        { expiresIn: "1h" }
      )
      const result = await Effect.runPromise(tokenService.validateToken(token))
      expect(result).toEqual({
        isValid: false,
        accountId: "",
        shouldRefresh: false
      })
    })

    it("should reject an invalid token", async () => {
      const result = await Effect.runPromise(tokenService.validateToken("invalid-token"))
      expect(result).toEqual({
        isValid: false,
        accountId: "",
        shouldRefresh: false
      })
    })

    it("should reject a token with invalid signature", async () => {
      // Create a token with a different secret
      const token = jwt.sign(
        { accountId, iat: now },
        "wrong-secret",
        { expiresIn: "24h" }
      )
      const result = await Effect.runPromise(tokenService.validateToken(token))
      expect(result).toEqual({
        isValid: false,
        accountId: "",
        shouldRefresh: false
      })
    })
  })
})
