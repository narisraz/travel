import type { TokenService } from "@/auth/domain/services/token.service.js"
import { Effect } from "effect"

class TokenServiceMock implements TokenService {
  generateToken = (accountId: string) => Effect.succeed(`token-${accountId}`)
}

export const createTokenService = () => Effect.succeed(new TokenServiceMock())
