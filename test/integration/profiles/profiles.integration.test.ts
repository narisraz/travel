import { createAccount } from "@/auth/application/use-cases/create-account.js"
import { createEmail } from "@/auth/domain/value-objects/Email.js"
import { createHotelProfile } from "@/profiles/application/use-cases/create-hotel-profile.js"
import { Effect } from "effect"
import { describe, expect, it } from "vitest"
import { withTestDatabase } from "../helpers/test-database.js"

describe("Profiles Integration Tests", () => {
  it("should create hotel profile successfully", async () => {
    await Effect.runPromise(
      withTestDatabase((environment) =>
        Effect.gen(function*() {
          // Create a user account first
          const email = createEmail("hotel@example.com").pipe(Effect.runSync)

          const user = yield* createAccount({
            email,
            password: "Password123!",
            confirmPassword: "Password123!"
          }).pipe(Effect.provide(environment.layer))

          // Create hotel profile
          const hotelProfile = yield* createHotelProfile({
            name: "Grand Hotel",
            description: "A luxurious hotel in the city center",
            authId: user.id,
            address: {
              street: "123 Main Street",
              zipCode: "12345",
              city: "Paris",
              country: "France"
            }
          }).pipe(Effect.provide(environment.layer))

          expect(hotelProfile.name).toBe("Grand Hotel")
          expect(hotelProfile.description).toBe("A luxurious hotel in the city center")
          expect(hotelProfile.authId).toBe(user.id)
          expect(hotelProfile.address?.street).toBe("123 Main Street")
          expect(hotelProfile.address?.city).toBe("Paris")
        })
      )
    )
  })
})
