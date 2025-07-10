import { Layer } from "effect"

import { SQLiteAccountRepositoryLayerWithPath } from "@/auth/infrastructure/persistence/layer.js"
import { UuidIdGeneratorLayer } from "@/auth/infrastructure/services/id-generator.service.uuid.js"
import { BcryptPasswordServiceLayer } from "@/auth/infrastructure/services/password.service.bcrypt.js"
import { JWTTokenServiceLayer } from "@/auth/infrastructure/services/token.service.jwt.js"

export const httpLayer = Layer.mergeAll(
  SQLiteAccountRepositoryLayerWithPath("travel.db"),
  UuidIdGeneratorLayer,
  BcryptPasswordServiceLayer,
  JWTTokenServiceLayer
)
