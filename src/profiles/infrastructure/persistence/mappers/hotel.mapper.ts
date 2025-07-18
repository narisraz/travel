import type { Hotel } from "@/profiles/domain/entities/hotel.js"
import { createAddress } from "@/profiles/domain/value-objets/address.js"
import { Effect } from "effect"
import type { HotelModel } from "../models/hotel.model.js"

export const mapHotelModelToDomain = (hotelModel: HotelModel): Hotel => {
  // Reconstruct address if any address fields are present
  let address = undefined
  if (
    hotelModel.addressStreet ||
    hotelModel.addressZipCode ||
    hotelModel.addressCity ||
    hotelModel.addressCountry
  ) {
    address = createAddress(
      hotelModel.addressStreet ?? undefined,
      hotelModel.addressZipCode ?? undefined,
      hotelModel.addressCity ?? undefined,
      hotelModel.addressCountry ?? undefined
    ).pipe(Effect.runSync)
  }

  return {
    id: hotelModel.id,
    name: hotelModel.name,
    description: hotelModel.description,
    authId: hotelModel.authId,
    address
  }
}

export const mapDomainToHotelModel = (hotel: Hotel): Omit<HotelModel, "createdAt"> => ({
  id: hotel.id,
  name: hotel.name,
  description: hotel.description,
  authId: hotel.authId,
  addressStreet: hotel.address?.street ?? null,
  addressZipCode: hotel.address?.zipCode ?? null,
  addressCity: hotel.address?.city ?? null,
  addressCountry: hotel.address?.country ?? null
})
