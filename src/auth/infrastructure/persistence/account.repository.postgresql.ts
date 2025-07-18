import type { User } from "@/auth/domain/entities/account.entity.js"
import type { AccountRepository } from "@/auth/domain/repositories/account.repository.js"
import type { Email } from "@/auth/domain/value-objects/Email.js"
import { mapDomainToUserModel, mapUserModelToDomain } from "@/auth/infrastructure/persistence/mappers/user.mapper.js"
import { createUserModel, type UserModel } from "@/auth/infrastructure/persistence/models/user.model.js"
import { Effect } from "effect"
import type { PrismaDatabase } from "./prisma.js"

export class PostgreSQLAccountRepository implements AccountRepository {
  constructor(private readonly database: PrismaDatabase) {}

  save = (account: User): Effect.Effect<void, never, never> =>
    Effect.tryPromise({
      try: () => {
        const userModel = mapDomainToUserModel(account)
        return this.database.client.user.create({
          data: {
            id: userModel.id,
            email: userModel.email,
            password: userModel.password
          }
        })
      },
      catch: () => new Error("Failed to save user")
    }).pipe(Effect.catchAll(() => Effect.succeed(void 0)))

  getAll = (): Effect.Effect<Array<User>, never, never> =>
    Effect.tryPromise({
      try: () => this.database.client.user.findMany(),
      catch: () => new Error("Failed to get all users")
    })
      .pipe(
        Effect.map((users) => {
          const typedUsers = users as Array<UserModel>
          return typedUsers.map((user) => {
            const userModel = createUserModel(user)
            return mapUserModelToDomain(userModel)
          })
        }),
        Effect.catchAll(() => Effect.succeed([]))
      )

  findByEmail = (email: Email): Effect.Effect<User | null, never, never> =>
    Effect.tryPromise({
      try: () =>
        this.database.client.user.findUnique({
          where: { email: String(email) }
        }),
      catch: () => new Error("Failed to find user by email")
    })
      .pipe(
        Effect.map((user) => {
          if (!user) return null
          const typedUser = user as UserModel
          const userModel = createUserModel(typedUser)
          return mapUserModelToDomain(userModel)
        }),
        Effect.catchAll(() => Effect.succeed(null))
      )

  update = (id: string, account: Partial<User>): Effect.Effect<void, never, never> =>
    Effect.tryPromise({
      try: () =>
        this.database.client.user.update({
          where: { id },
          data: account.password ? { password: account.password } : {}
        }),
      catch: () => new Error("Failed to update user")
    }).pipe(Effect.catchAll(() => Effect.succeed(void 0)))
}

export const createPostgreSQLAccountRepository = (
  database: PrismaDatabase
): AccountRepository => new PostgreSQLAccountRepository(database)
