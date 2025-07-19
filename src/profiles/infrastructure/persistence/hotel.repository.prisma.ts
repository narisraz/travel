import * as Effect from "effect/Effect"

import type { Hotel } from "@/profiles/domain/entities/hotel.js"
import type { HotelRepository } from "@/profiles/domain/repositories/hotel.repository.js"
import { createAddress } from "@/profiles/domain/value-objets/address.js"
import type { PrismaClient } from "../../../../generated/prisma/index.js"

export class PrismaHotelRepository implements HotelRepository {
  constructor(private readonly prisma: PrismaClient) {}

  save = (hotel: Hotel): Effect.Effect<void> => {
    const prisma = this.prisma
    return Effect.gen(function*() {
      yield* Effect.promise(() =>
        prisma.hotel.create({
          data: {
            id: hotel.id,
            name: hotel.name,
            description: hotel.description,
            authId: hotel.authId,
            street: hotel.address?.street ?? null,
            zipCode: hotel.address?.zipCode ?? null,
            city: hotel.address?.city ?? null,
            country: hotel.address?.country ?? null
          }
        })
      ).pipe(Effect.catchAll(() => Effect.succeed(void 0)))
    })
  }

  getById = (id: string): Effect.Effect<Hotel | null> => {
    const prisma = this.prisma
    return Effect.gen(function*() {
      const hotel = yield* Effect.promise(() =>
        prisma.hotel.findUnique({
          where: { id }
        })
      ).pipe(Effect.catchAll(() => Effect.succeed(null)))

      if (!hotel) return null

      const address = Effect.runSync(createAddress(
        hotel.street ?? undefined,
        hotel.zipCode ?? undefined,
        hotel.city ?? undefined,
        hotel.country ?? undefined
      ))

      return {
        id: hotel.id,
        name: hotel.name,
        description: hotel.description,
        authId: hotel.authId,
        address
      }
    })
  }
}
