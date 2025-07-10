import type { Effect } from "effect"
import { Context } from "effect"

export interface TokenService {
  generateToken: (accountId: string) => Effect.Effect<string, never, never>
}

export const TokenService = Context.GenericTag<TokenService>("TokenService")
