import { TokenService as TokenServiceTag } from "@/auth/domain/services/token.service.js"
import { JWTTokenService } from "@/auth/infrastructure/services/token.service.jwt.js"
import { describe, expect, test } from "@effect/vitest"
import { Effect, Layer, pipe } from "effect"
import jwt from "jsonwebtoken"
import { afterEach, beforeEach, vi } from "vitest"

describe("JWTTokenService", () => {
  const secret = "test-secret"
  const accountId = "test-account-id"
  const now = 1625097600 // 2021-07-01T00:00:00Z (in seconds)

  // Mock process.env and Date.now
  const originalEnv = process.env
  const originalDateNow = Date.now

  const createTestLayer = () =>
    Layer.effect(
      TokenServiceTag,
      Effect.sync(() => new JWTTokenService())
    )

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv, JWT_SECRET: secret }
    Date.now = vi.fn(() => now * 1000) // Convert to milliseconds
  })

  afterEach(() => {
    process.env = originalEnv
    Date.now = originalDateNow
    vi.restoreAllMocks()
  })

  describe("generateToken", () => {
    test("should generate a non-empty token", () =>
      pipe(
        Effect.gen(function*() {
          const tokenService = yield* TokenServiceTag
          const token = yield* tokenService.generateToken(accountId)
          expect(token).not.toBe("")
        }),
        Effect.provide(createTestLayer()),
        Effect.runPromise
      ))

    test("should generate a token with correct payload and expiration", () =>
      pipe(
        Effect.gen(function*() {
          const tokenService = yield* TokenServiceTag
          const token = yield* tokenService.generateToken(accountId)

          const decoded = jwt.verify(token, secret) as { accountId: string; iat: number; exp: number }
          expect(decoded.accountId).toBe(accountId)
          expect(decoded.iat).toBe(now)
          expect(decoded.exp).toBe(now + 24 * 3600)
        }),
        Effect.provide(createTestLayer()),
        Effect.runPromise
      ))

    test("should return an empty string on error", () =>
      pipe(
        Effect.gen(function*() {
          // Simulate error by mocking jwt.sign
          vi.spyOn(jwt, "sign").mockImplementation(() => {
            throw new Error("Signing error")
          })

          const tokenService = yield* TokenServiceTag
          const token = yield* tokenService.generateToken(accountId)
          expect(token).toBe("")
        }),
        Effect.provide(createTestLayer()),
        Effect.runPromise
      ))
  })

  describe("validateToken", () => {
    test("should validate a valid token", () =>
      pipe(
        Effect.gen(function*() {
          // Create a valid token that expires in 23h
          const token = jwt.sign(
            { accountId, iat: now },
            secret,
            { expiresIn: "24h" }
          )
          const tokenService = yield* TokenServiceTag
          const result = yield* tokenService.validateToken(token)
          expect(result).toEqual({
            isValid: true,
            accountId,
            shouldRefresh: false
          })
        }),
        Effect.provide(createTestLayer()),
        Effect.runPromise
      ))

    test("should indicate when a token needs refresh", () =>
      pipe(
        Effect.gen(function*() {
          // Create a token that expires in 4 minutes (below 5 minutes threshold)
          const token = jwt.sign(
            { accountId, iat: now },
            secret,
            { expiresIn: "4m" }
          )
          const tokenService = yield* TokenServiceTag
          const result = yield* tokenService.validateToken(token)
          expect(result).toEqual({
            isValid: true,
            accountId,
            shouldRefresh: true
          })
        }),
        Effect.provide(createTestLayer()),
        Effect.runPromise
      ))

    test("should reject an expired token", () =>
      pipe(
        Effect.gen(function*() {
          // Create a token that expired 1 hour ago
          const token = jwt.sign(
            { accountId, iat: now - 7200 },
            secret,
            { expiresIn: "1h" }
          )
          const tokenService = yield* TokenServiceTag
          const result = yield* tokenService.validateToken(token)
          expect(result).toEqual({
            isValid: false,
            accountId: "",
            shouldRefresh: false
          })
        }),
        Effect.provide(createTestLayer()),
        Effect.runPromise
      ))

    test("should reject an invalid token", () =>
      pipe(
        Effect.gen(function*() {
          const tokenService = yield* TokenServiceTag
          const result = yield* tokenService.validateToken("invalid-token")
          expect(result).toEqual({
            isValid: false,
            accountId: "",
            shouldRefresh: false
          })
        }),
        Effect.provide(createTestLayer()),
        Effect.runPromise
      ))

    test("should reject a token with invalid signature", () =>
      pipe(
        Effect.gen(function*() {
          // Create a token with a different secret
          const token = jwt.sign(
            { accountId, iat: now },
            "wrong-secret",
            { expiresIn: "24h" }
          )
          const tokenService = yield* TokenServiceTag
          const result = yield* tokenService.validateToken(token)
          expect(result).toEqual({
            isValid: false,
            accountId: "",
            shouldRefresh: false
          })
        }),
        Effect.provide(createTestLayer()),
        Effect.runPromise
      ))
  })
})
