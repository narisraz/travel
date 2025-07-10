import type { Effect } from "effect"
import { Context } from "effect"

export interface PasswordService {
  validatePassword: (password: string) => Effect.Effect<boolean, never, never>
  hashPassword: (password: string) => Effect.Effect<string, never, never>
  comparePassword: (password: string, hashedPassword: string) => Effect.Effect<boolean, never, never>
}

export const PasswordService = Context.GenericTag<PasswordService>("PasswordService")
