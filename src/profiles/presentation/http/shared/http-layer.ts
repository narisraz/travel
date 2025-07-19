import { Layer } from "effect"

import { JWTTokenServiceLayer } from "@/auth/infrastructure/services/token.service.jwt.js"
import { PrismaHotelRepositoryLayer } from "@/profiles/infrastructure/persistence/layer.prisma.js"
import { UuidIdGeneratorLayer } from "@/shared/infrastructure/services/id-generator.service.uuid.js"

// Composition des layers avec PrismaClientLayer en premier
export const httpLayer = Layer.mergeAll(
  PrismaHotelRepositoryLayer,
  UuidIdGeneratorLayer,
  JWTTokenServiceLayer
)
