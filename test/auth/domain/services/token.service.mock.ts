import type { TokenService } from "@/auth/domain/services/token.service.js"
import { Effect } from "effect"

class TokenServiceMock implements TokenService {
  generateToken = (accountId: string) => Effect.succeed(`token-${accountId}`)
  validateToken = (_: string) =>
    Effect.succeed({
      accountId: "accountId",
      isValid: true,
      shouldRefresh: false
    })
}

export const createTokenService = () => Effect.succeed(new TokenServiceMock())
