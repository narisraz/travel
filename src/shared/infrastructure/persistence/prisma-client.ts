import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

import { PrismaClient } from "../../../../generated/prisma/index.js"

export interface PrismaClientService {
  readonly _: unique symbol
  readonly client: PrismaClient
}

export const PrismaClientService = Context.GenericTag<PrismaClientService>("PrismaClientService")

export const createPrismaClient = () => new PrismaClient()

export const PrismaClientLayer = Layer.effect(
  PrismaClientService,
  Effect.sync(createPrismaClient).pipe(
    Effect.map((client) => ({ _: Symbol() as any, client } as PrismaClientService))
  )
)
