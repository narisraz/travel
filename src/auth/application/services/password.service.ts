import type { Effect } from "effect"
import { Context } from "effect"

export class PasswordService extends Context.Tag("password-service")<
  PasswordService,
  {
    validatePassword: (password: string) => Effect.Effect<boolean, never, never>
  }
>() {}
