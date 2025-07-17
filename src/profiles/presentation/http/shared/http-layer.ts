import { Layer } from "effect"

import { JWTTokenServiceLayer } from "@/auth/infrastructure/services/token.service.jwt.js"
import { SQLiteHotelRepositoryLayerWithPath } from "@/profiles/infrastructure/persistence/layer.js"
import { UuidIdGeneratorLayer } from "@/shared/infrastructure/services/id-generator.service.uuid.js"

export const httpLayer = Layer.mergeAll(
  SQLiteHotelRepositoryLayerWithPath("travel.db"),
  UuidIdGeneratorLayer,
  JWTTokenServiceLayer
)
