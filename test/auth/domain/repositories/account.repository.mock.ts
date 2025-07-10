import type { User } from "@/auth/domain/entities/account.entity.js"
import type { AccountRepository } from "@/auth/domain/repositories/account.repository.js"
import { Effect } from "effect"

class LiveAccountRepository implements AccountRepository {
  private accounts: Array<User> = []

  save(account: User): Effect.Effect<User> {
    this.accounts.push(account)
    return Effect.succeed(account)
  }

  getAll(): Effect.Effect<Array<User>> {
    return Effect.succeed(this.accounts)
  }
}

export { LiveAccountRepository }
