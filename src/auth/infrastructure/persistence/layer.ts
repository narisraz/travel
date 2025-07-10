import { AccountRepository } from "@/auth/domain/repositories/account.repository.js"
import { Effect, Layer } from "effect"
import { createSQLiteAccountRepository } from "./account.repository.sqlite.js"
import { createDatabase } from "./database.js"

export const SQLiteAccountRepositoryLayer = Layer.effect(
  AccountRepository,
  Effect.gen(function*() {
    const database = yield* createDatabase()
    yield* database.initialize()
    return createSQLiteAccountRepository(database)
  })
)

export const SQLiteAccountRepositoryLayerWithPath = (dbPath: string) =>
  Layer.effect(
    AccountRepository,
    Effect.gen(function*() {
      const database = yield* createDatabase(dbPath)
      yield* database.initialize()
      return createSQLiteAccountRepository(database)
    })
  )
