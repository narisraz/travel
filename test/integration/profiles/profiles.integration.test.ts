import { createAccount } from "@/auth/application/use-cases/create-account.js"
import { createEmail } from "@/auth/domain/value-objects/Email.js"
import { SQLiteAccountRepositoryLayer } from "@/auth/infrastructure/persistence/layer.js"
import { BcryptPasswordServiceLayer } from "@/auth/infrastructure/services/password.service.bcrypt.js"
import { JWTTokenServiceLayer } from "@/auth/infrastructure/services/token.service.jwt.js"
import { createHotelProfile } from "@/profiles/application/use-cases/create-hotel-profile.js"
import { SQLiteHotelRepositoryLayer } from "@/profiles/infrastructure/persistence/layer.js"
import { UuidIdGeneratorLayer } from "@/shared/infrastructure/services/id-generator.service.uuid.js"
import { Effect, Layer } from "effect"
import { describe, expect, it } from "vitest"

describe("Profiles Integration Tests", () => {
  it("should create hotel profile successfully", async () => {
    const testLayer = Layer.mergeAll(
      SQLiteAccountRepositoryLayer,
      BcryptPasswordServiceLayer,
      JWTTokenServiceLayer,
      UuidIdGeneratorLayer,
      SQLiteHotelRepositoryLayer
    )

    // Create a user account first
    const email = createEmail("hotel@example.com").pipe(Effect.runSync)

    const user = await Effect.runPromise(
      createAccount({
        email,
        password: "Password123!",
        confirmPassword: "Password123!"
      }).pipe(Effect.provide(testLayer))
    )

    // Create hotel profile
    const hotelProfile = await Effect.runPromise(
      createHotelProfile({
        name: "Grand Hotel",
        description: "A luxurious hotel in the city center",
        authId: user.id,
        address: {
          street: "123 Main Street",
          zipCode: "12345",
          city: "Paris",
          country: "France"
        }
      }).pipe(Effect.provide(testLayer))
    )

    expect(hotelProfile.name).toBe("Grand Hotel")
    expect(hotelProfile.description).toBe("A luxurious hotel in the city center")
    expect(hotelProfile.authId).toBe(user.id)
    expect(hotelProfile.address?.street).toBe("123 Main Street")
    expect(hotelProfile.address?.city).toBe("Paris")
  })
})
