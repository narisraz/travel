import { createHotelProfile } from "@/profiles/application/use-cases/create-hotel-profile.js"
import { HotelRepository } from "@/profiles/domain/repositories/hotel.repository.js"
import { createAddress } from "@/profiles/domain/value-objets/address.js"
import { IdGenerator } from "@/shared/domain/services/id-generator.service.js"
import { describe, expect, test } from "@effect/vitest"
import { createMockHotelRepository } from "@test/profiles/domain/repositories/hotel.repository.mock.js"
import { createMockIdGenerator } from "@test/shared/domain/services/id-generator.service.mock.js"
import { Effect, Layer, pipe } from "effect"

const address = Effect.runSync(createAddress("Hotel Street", "Hotel Zip Code", "Hotel City", "Hotel Country"))

const dependencies = Layer.mergeAll(
  Layer.effect(IdGenerator, createMockIdGenerator("generated-id")),
  Layer.effect(HotelRepository, createMockHotelRepository([]))
)

describe("CreateHotelProfile", () => {
  test("should return a hotel profile", () =>
    pipe(
      Effect.gen(function*() {
        const request = {
          name: "Hotel Name",
          description: "Hotel Description",
          address,
          authId: "authId"
        }

        const result = yield* createHotelProfile(request)

        expect(result).toStrictEqual({
          id: "generated-id",
          name: "Hotel Name",
          description: "Hotel Description",
          authId: "authId",
          address
        })
      }),
      Effect.provide(dependencies),
      Effect.runPromise
    ))

  test("should save the hotel profile", () =>
    pipe(
      Effect.gen(function*() {
        const request = {
          name: "Hotel Name",
          description: "Hotel Description",
          address,
          authId: "authId"
        }

        yield* createHotelProfile(request)

        const hotelRepository = yield* HotelRepository
        const hotel = yield* hotelRepository.getById("generated-id")

        expect(hotel).not.toBeNull()
      }),
      Effect.provide(dependencies),
      Effect.runPromise
    ))
})
