import type { TokenService } from "@/auth/domain/services/token.service.js"
import { Effect } from "effect"

class MockTokenService implements TokenService {
  generateToken = (accountId: string) => Effect.succeed(`token-${accountId}`)
  validateToken = (_: string) =>
    Effect.succeed({
      accountId: "accountId",
      isValid: true,
      shouldRefresh: false
    })
}

export const createMockTokenService = () => Effect.succeed(new MockTokenService())
