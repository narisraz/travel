export interface HotelModel {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly authId: string
  readonly addressStreet: string | null
  readonly addressZipCode: string | null
  readonly addressCity: string | null
  readonly addressCountry: string | null
  readonly createdAt: Date
}

export const createHotelModel = (data: {
  id: string
  name: string
  description: string
  authId: string
  addressStreet: string | null
  addressZipCode: string | null
  addressCity: string | null
  addressCountry: string | null
  createdAt: Date
}): HotelModel => ({
  id: data.id,
  name: data.name,
  description: data.description,
  authId: data.authId,
  addressStreet: data.addressStreet,
  addressZipCode: data.addressZipCode,
  addressCity: data.addressCity,
  addressCountry: data.addressCountry,
  createdAt: data.createdAt
})

export const createHotelModelFromDomain = (data: {
  id: string
  name: string
  description: string
  authId: string
  address?: {
    street?: string
    zipCode?: string
    city?: string
    country?: string
  }
}): Omit<HotelModel, "createdAt"> => ({
  id: data.id,
  name: data.name,
  description: data.description,
  authId: data.authId,
  addressStreet: data.address?.street ?? null,
  addressZipCode: data.address?.zipCode ?? null,
  addressCity: data.address?.city ?? null,
  addressCountry: data.address?.country ?? null
})
