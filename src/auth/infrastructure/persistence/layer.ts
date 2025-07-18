import { AccountRepository } from "@/auth/domain/repositories/account.repository.js"
import { Effect, Layer } from "effect"
import { createPostgreSQLAccountRepository } from "./account.repository.postgresql.js"
import { createPrismaDatabase } from "./prisma.js"

export const PostgreSQLAccountRepositoryLayer = Layer.effect(
  AccountRepository,
  Effect.gen(function*() {
    const database = yield* createPrismaDatabase()
    yield* database.initialize()
    return createPostgreSQLAccountRepository(database)
  })
)
