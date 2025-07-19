import * as Effect from "effect/Effect"

import type { User } from "@/auth/domain/entities/account.entity.js"
import type { AccountRepository } from "@/auth/domain/repositories/account.repository.js"
import { createEmail, type Email } from "@/auth/domain/value-objects/Email.js"
import type { Account, PrismaClient } from "../../../../generated/prisma/index.js"

export class PrismaAccountRepository implements AccountRepository {
  constructor(private readonly prisma: PrismaClient) {}

  save = (account: User): Effect.Effect<void, never, never> => {
    const prisma = this.prisma
    return Effect.gen(function*() {
      yield* Effect.promise(() =>
        prisma.account.create({
          data: {
            id: account.id,
            email: account.email,
            password: account.password
          }
        })
      ).pipe(Effect.catchAll(() => Effect.succeed(void 0)))
    })
  }

  getAll = (): Effect.Effect<Array<User>, never, never> => {
    const prisma = this.prisma
    return Effect.gen(function*() {
      const accounts = yield* Effect.promise(() => prisma.account.findMany()).pipe(
        Effect.catchAll(() => Effect.succeed([]))
      )

      return accounts.map((account: Account) => {
        return {
          ...account,
          email: Effect.runSync(createEmail(account.email))
        }
      })
    })
  }

  findByEmail = (email: Email): Effect.Effect<User | null, never, never> => {
    const prisma = this.prisma
    return Effect.gen(function*() {
      const account = yield* Effect.promise(() =>
        prisma.account.findUnique({
          where: { email }
        })
      ).pipe(Effect.catchAll(() => Effect.succeed(null)))

      if (!account) return null

      return {
        id: account.id,
        email,
        password: account.password
      }
    })
  }

  update = (id: string, account: Partial<User>): Effect.Effect<void, never, never> => {
    const prisma = this.prisma
    return Effect.gen(function*() {
      yield* Effect.promise(() =>
        prisma.account.update({
          where: { id },
          data: {
            ...(account.email && { email: account.email }),
            ...(account.password && { password: account.password })
          }
        })
      ).pipe(Effect.catchAll(() => Effect.succeed(void 0)))
    })
  }
}
