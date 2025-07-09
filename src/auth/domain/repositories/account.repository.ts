import type { Email } from "@/auth/domain/value-objects/Email.js"
import type { Effect } from "effect"
import { Context } from "effect"

export class AccountRepository extends Context.Tag("AccountRepository")<
  AccountRepository,
  {
    save: (account: {
      readonly email: Email
      readonly password: string
    }) => Effect.Effect<
      {
        readonly email: Email
        readonly password: string
      },
      never,
      never
    >
  }
>() {}
