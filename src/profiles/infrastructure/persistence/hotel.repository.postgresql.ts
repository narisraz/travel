import type { PrismaDatabase } from "@/auth/infrastructure/persistence/prisma.js"
import type { Hotel } from "@/profiles/domain/entities/hotel.js"
import type { HotelRepository } from "@/profiles/domain/repositories/hotel.repository.js"
import {
  mapDomainToHotelModel,
  mapHotelModelToDomain
} from "@/profiles/infrastructure/persistence/mappers/hotel.mapper.js"
import { createHotelModel, type HotelModel } from "@/profiles/infrastructure/persistence/models/hotel.model.js"
import { Effect } from "effect"

export class PostgreSQLHotelRepository implements HotelRepository {
  constructor(private readonly database: PrismaDatabase) {}

  save = (hotel: Hotel): Effect.Effect<void, never, never> =>
    Effect.tryPromise({
      try: () => {
        const hotelModel = mapDomainToHotelModel(hotel)
        return this.database.client.hotel.create({
          data: {
            id: hotelModel.id,
            name: hotelModel.name,
            description: hotelModel.description,
            authId: hotelModel.authId,
            addressStreet: hotelModel.addressStreet,
            addressZipCode: hotelModel.addressZipCode,
            addressCity: hotelModel.addressCity,
            addressCountry: hotelModel.addressCountry
          }
        })
      },
      catch: () => new Error("Failed to save hotel")
    }).pipe(Effect.catchAll(() => Effect.succeed(void 0)))

  getById = (id: string): Effect.Effect<Hotel | null, never, never> =>
    Effect.tryPromise({
      try: () =>
        this.database.client.hotel.findUnique({
          where: { id }
        }),
      catch: () => new Error("Failed to get hotel by id")
    })
      .pipe(
        Effect.map((hotel) => {
          if (!hotel) return null
          const typedHotel = hotel as HotelModel
          const hotelModel = createHotelModel(typedHotel)
          return mapHotelModelToDomain(hotelModel)
        }),
        Effect.catchAll(() => Effect.succeed(null))
      )
}

export const createPostgreSQLHotelRepository = (
  database: PrismaDatabase
): HotelRepository => new PostgreSQLHotelRepository(database)
