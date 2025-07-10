import type { User } from "@/auth/domain/entities/account.entity.js"
import type { Email } from "@/auth/domain/value-objects/Email.js"
import type { Effect } from "effect"
import { Context } from "effect"

export interface AccountRepository {
  save: (account: User) => Effect.Effect<void, never, never>
  getAll: () => Effect.Effect<Array<User>, never, never>
  findByEmail: (email: Email) => Effect.Effect<User | null, never, never>
}

export const AccountRepository = Context.GenericTag<AccountRepository>("AccountRepository")
