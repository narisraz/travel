import type { TokenService } from "@/auth/domain/services/token.service.js"
import { TokenService as TokenServiceTag } from "@/auth/domain/services/token.service.js"
import { Effect, Layer } from "effect"
import jwt from "jsonwebtoken"

export class JWTTokenService implements TokenService {
  private readonly secret = process.env.JWT_SECRET || "your-secret-key-change-in-production"
  private readonly expiresIn = "24h"

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

  // Méthode utilitaire pour vérifier un token (peut être utilisée dans les middlewares)
  verifyToken = (token: string): Effect.Effect<{ accountId: string }, never, never> =>
    Effect.try(() => {
      const decoded = jwt.verify(token, this.secret) as { accountId: string }
      return { accountId: decoded.accountId }
    }).pipe(
      Effect.catchAll(() => Effect.succeed({ accountId: "" }))
    )
}

export const createJWTTokenService = (): JWTTokenService => new JWTTokenService()

export const JWTTokenServiceLayer = Layer.succeed(
  TokenServiceTag,
  createJWTTokenService()
)
