import { createHotel, type Hotel } from "@/profiles/domain/entities/hotel.js"
import { HotelRepository } from "@/profiles/domain/repositories/hotel.repository.js"
import type { Address } from "@/profiles/domain/value-objets/address.js"
import { IdGenerator } from "@/shared/domain/services/id-generator.service.js"
import { Effect } from "effect"
import type { ParseError } from "effect/ParseResult"

type CreateHotelProfileRequest = {
  name: string
  description: string
  address?: Address
  authId: string
}

type CreateHotelProfileResponse = Effect.Effect<
  Hotel,
  ParseError,
  IdGenerator | HotelRepository
>

export function createHotelProfile(request: CreateHotelProfileRequest): CreateHotelProfileResponse {
  return Effect.gen(function*() {
    const idGenerator = yield* IdGenerator
    const id = yield* idGenerator.next()

    const hotel = yield* createHotel(id, request.name, request.description, request.authId, request.address)

    const hotelRepository = yield* HotelRepository
    yield* hotelRepository.save(hotel)

    return hotel
  })
}
