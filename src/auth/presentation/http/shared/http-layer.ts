import { Layer } from "effect"

import { PostgreSQLAccountRepositoryLayer } from "@/auth/infrastructure/persistence/layer.js"
import { BcryptPasswordServiceLayer } from "@/auth/infrastructure/services/password.service.bcrypt.js"
import { JWTTokenServiceLayer } from "@/auth/infrastructure/services/token.service.jwt.js"
import { UuidIdGeneratorLayer } from "@/shared/infrastructure/services/id-generator.service.uuid.js"

export const httpLayer = Layer.mergeAll(
  PostgreSQLAccountRepositoryLayer,
  UuidIdGeneratorLayer,
  BcryptPasswordServiceLayer,
  JWTTokenServiceLayer
)
