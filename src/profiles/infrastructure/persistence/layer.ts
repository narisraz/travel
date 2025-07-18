import { createPrismaDatabase } from "@/auth/infrastructure/persistence/prisma.js"
import { HotelRepository } from "@/profiles/domain/repositories/hotel.repository.js"
import { Effect, Layer } from "effect"
import { createPostgreSQLHotelRepository } from "./hotel.repository.postgresql.js"

export const PostgreSQLHotelRepositoryLayer = Layer.effect(
  HotelRepository,
  Effect.gen(function*() {
    const database = yield* createPrismaDatabase()
    yield* database.initialize()
    return createPostgreSQLHotelRepository(database)
  })
)
