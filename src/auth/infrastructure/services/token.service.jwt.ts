import type { TokenService, TokenValidationResult } from "@/auth/domain/services/token.service.js"
import { TokenService as TokenServiceTag } from "@/auth/domain/services/token.service.js"
import { Effect, Layer } from "effect"
import jwt from "jsonwebtoken"

export class JWTTokenService implements TokenService {
  private readonly secret = process.env.JWT_SECRET || "your-secret-key-change-in-production"
  private readonly expiresIn = "24h"
  private readonly refreshThresholdMinutes = 5

  generateToken = (accountId: string): Effect.Effect<string, never, never> =>
    Effect.try(() => {
      const payload = {
        accountId,
        iat: Math.floor(Date.now() / 1000)
      }

      return jwt.sign(payload, this.secret, {
        expiresIn: this.expiresIn,
        algorithm: "HS256"
      })
    }).pipe(
      Effect.catchAll(() => Effect.succeed(""))
    )

  validateToken = (token: string): Effect.Effect<TokenValidationResult, never, never> =>
    Effect.try(() => {
      const decoded = jwt.verify(token, this.secret) as { accountId: string; exp: number }

      const now = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = decoded.exp - now
      const shouldRefresh = timeUntilExpiry < (this.refreshThresholdMinutes * 60)

      return { accountId: decoded.accountId, isValid: true, shouldRefresh }
    }).pipe(
      Effect.catchAll(() => Effect.succeed({ accountId: "", isValid: false, shouldRefresh: false }))
    )
}

export const createJWTTokenService = (): JWTTokenService => new JWTTokenService()

export const JWTTokenServiceLayer = Layer.succeed(
  TokenServiceTag,
  createJWTTokenService()
)
