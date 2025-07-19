import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

import { AccountRepository } from "@/auth/domain/repositories/account.repository.js"
import { PrismaAccountRepository } from "@/auth/infrastructure/persistence/account.repository.prisma.js"
import { PrismaClientLayer, PrismaClientService } from "@/shared/infrastructure/persistence/prisma-client.js"

const createPrismaAccountRepository = (prismaClientService: PrismaClientService) =>
  new PrismaAccountRepository(prismaClientService.client)

export const PrismaAccountRepositoryLayer = Layer.effect(
  AccountRepository,
  Effect.gen(function*() {
    const prismaClientService = yield* PrismaClientService
    return createPrismaAccountRepository(prismaClientService)
  })
).pipe(
  Layer.provide(PrismaClientLayer)
)
