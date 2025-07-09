import type { User } from "@/auth/domain/entities/account.entity.js"
import type { Effect } from "effect"
import { Context } from "effect"

export class AccountRepository extends Context.Tag("AccountRepository")<
  AccountRepository,
  {
    save: (account: User) => Effect.Effect<
      User,
      never,
      never
    >
  }
>() {}
