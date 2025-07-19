import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

import { HotelRepository } from "@/profiles/domain/repositories/hotel.repository.js"
import { PrismaHotelRepository } from "@/profiles/infrastructure/persistence/hotel.repository.prisma.js"
import { PrismaClientLayer, PrismaClientService } from "@/shared/infrastructure/persistence/prisma-client.js"

const createPrismaHotelRepository = (prismaClientService: PrismaClientService) =>
  new PrismaHotelRepository(prismaClientService.client)

export const PrismaHotelRepositoryLayer = Layer.effect(
  HotelRepository,
  Effect.gen(function*() {
    const prismaClientService = yield* PrismaClientService
    return createPrismaHotelRepository(prismaClientService)
  })
).pipe(
  Layer.provide(PrismaClientLayer)
)
