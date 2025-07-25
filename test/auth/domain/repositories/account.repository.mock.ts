import type { User } from "@/auth/domain/entities/account.entity.js"
import type { AccountRepository } from "@/auth/domain/repositories/account.repository.js"
import type { Email } from "@/auth/domain/value-objects/Email.js"
import { Effect, Ref } from "effect"

class MockAccountRepository implements AccountRepository {
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

  findByEmail = (email: Email) => {
    const accountsRef = this.accounts
    return Effect.gen(function*() {
      const accounts = yield* Ref.get(accountsRef)
      return accounts.find((account) => account.email === email) || null
    })
  }

  update = (id: string, account: Partial<User>) => {
    const accountsRef = this.accounts
    return Effect.gen(function*() {
      yield* Ref.update(
        accountsRef,
        (currentAccounts) =>
          currentAccounts.map((currentAccount) =>
            currentAccount.id === id ? { ...currentAccount, ...account } : currentAccount
          )
      )
    })
  }
}

const createMockAccountRepository = (accounts: Array<User>) =>
  Effect.gen(function*() {
    const ref = yield* Ref.make(accounts)
    return new MockAccountRepository(ref)
  })

export { createMockAccountRepository }
