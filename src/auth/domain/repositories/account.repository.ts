import type { User } from "@/auth/domain/entities/account.entity.js"
import type { Effect } from "effect"
import { Context } from "effect"

export interface AccountRepository {
  save: (account: User) => Effect.Effect<User, never, never>
}

export const AccountRepository = Context.Tag("AccountRepository")<AccountRepository, AccountRepository>()
