import { createDatabase } from "@/auth/infrastructure/persistence/database.js"
import { HotelRepository } from "@/profiles/domain/repositories/hotel.repository.js"
import { Effect, Layer } from "effect"
import { createSQLiteHotelRepository } from "./hotel.repository.sqlite.js"

export const SQLiteHotelRepositoryLayer = Layer.effect(
  HotelRepository,
  Effect.gen(function*() {
    const database = yield* createDatabase()
    yield* database.initialize()
    return createSQLiteHotelRepository(database)
  })
)

export const SQLiteHotelRepositoryLayerWithPath = (dbPath: string) =>
  Layer.effect(
    HotelRepository,
    Effect.gen(function*() {
      const database = yield* createDatabase(dbPath)
      yield* database.initialize()
      return createSQLiteHotelRepository(database)
    })
  )
