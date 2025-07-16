import type { Hotel } from "@/profiles/domain/entities/hotel.js"
import type { HotelRepository } from "@/profiles/domain/repositories/hotel.repository.js"
import { Effect, Ref } from "effect"

class MockHotelRepository implements HotelRepository {
  constructor(private hotels: Ref.Ref<Array<Hotel>>) {}

  save = (hotel: Hotel) => {
    const hotels = this.hotels
    return Effect.gen(function*() {
      yield* Ref.update(hotels, (currentHotels) => [...currentHotels, hotel])
    })
  }

  getById = (id: string) => {
    const hotelsRef = this.hotels
    return Effect.gen(function*() {
      const hotels = yield* Ref.get(hotelsRef)
      return hotels.find((hotel) => hotel.id === id) || null
    })
  }
}

const createMockHotelRepository = (hotels: Array<Hotel>) =>
  Effect.gen(function*() {
    const ref = yield* Ref.make(hotels)
    return new MockHotelRepository(ref)
  })

export { createMockHotelRepository }
