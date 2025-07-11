import type { Effect } from "effect"
import { Context } from "effect"

export interface TokenValidationResult {
  isValid: boolean
  accountId: string
  shouldRefresh: boolean
}

export interface TokenService {
  generateToken: (accountId: string) => Effect.Effect<string, never, never>
  validateToken: (token: string) => Effect.Effect<TokenValidationResult, never, never>
}

export const TokenService = Context.GenericTag<TokenService>("TokenService")
