import type { User } from "@/auth/domain/entities/account.entity.js"
import type { AccountRepository } from "@/auth/domain/repositories/account.repository.js"
import { Effect, Ref } from "effect"

class LiveAccountRepository implements AccountRepository {
  constructor(private accounts: Ref.Ref<Array<User>>) {}

  save = (account: User) => {
    const accounts = this.accounts
    return Effect.gen(function*() {
      yield* Ref.update(accounts, (currentAccounts) => [...currentAccounts, account])
    })
  }

  getAll(): Effect.Effect<Array<User>> {
    return Ref.get(this.accounts)
  }
}

const createAccountRepository = (accounts: Array<User>) =>
  Effect.gen(function*() {
    const ref = yield* Ref.make(accounts)
    return new LiveAccountRepository(ref)
  })

export { createAccountRepository }
