import { PrismaClient } from "@prisma/client"
import { Effect } from "effect"

export interface PrismaDatabase {
  readonly client: PrismaClient
  readonly close: () => Effect.Effect<void, never, never>
  readonly initialize: () => Effect.Effect<void, never, never>
}

export const createPrismaDatabase = (): Effect.Effect<PrismaDatabase, never, never> =>
  Effect.sync(() => {
    const client = new PrismaClient()

    const initialize = () =>
      Effect.tryPromise({
        try: () => client.$connect(),
        catch: () => new Error("Failed to connect to PostgreSQL database")
      }).pipe(Effect.catchAll(() => Effect.succeed(void 0)))

    const close = () =>
      Effect.tryPromise({
        try: () => client.$disconnect(),
        catch: () => new Error("Failed to disconnect from PostgreSQL database")
      }).pipe(Effect.catchAll(() => Effect.succeed(void 0)))

    return {
      client,
      close,
      initialize
    }
  })
