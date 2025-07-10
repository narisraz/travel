import type { IdGenerator } from "@/auth/domain/services/id-generator.service.js"
import { IdGenerator as IdGeneratorTag } from "@/auth/domain/services/id-generator.service.js"
import { Effect, Layer } from "effect"
import { v4 as uuidv4 } from "uuid"

export class UuidIdGenerator implements IdGenerator {
  next = (): Effect.Effect<string, never, never> => Effect.succeed(uuidv4())
}

export const createUuidIdGenerator = (): UuidIdGenerator => new UuidIdGenerator()

export const UuidIdGeneratorLayer = Layer.succeed(
  IdGeneratorTag,
  createUuidIdGenerator()
)
