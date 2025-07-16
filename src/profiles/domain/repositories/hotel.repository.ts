import type { Hotel } from "@/profiles/domain/entities/hotel.js"
import { Context, type Effect } from "effect"

export interface HotelRepository {
  save(hotel: Hotel): Effect.Effect<void>
  getById(id: string): Effect.Effect<Hotel | null>
}

export const HotelRepository = Context.GenericTag<HotelRepository>("HotelRepository")
