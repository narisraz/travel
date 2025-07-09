import type { Effect } from "effect"
import { Context } from "effect"

export interface PasswordService {
  validatePassword: (password: string) => Effect.Effect<boolean, never, never>
  hashPassword: (password: string) => Effect.Effect<string, never, never>
}

export const PasswordService = Context.Tag("PasswordService")<PasswordService, PasswordService>()
