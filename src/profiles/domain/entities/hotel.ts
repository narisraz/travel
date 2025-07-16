import { Address } from "@/profiles/domain/value-objets/address.js"
import * as S from "effect/Schema"

const Hotel = S.Struct({
  id: S.String,
  name: S.String,
  description: S.String,
  authId: S.String,
  address: S.optional(Address)
})

type Hotel = S.Schema.Type<typeof Hotel>

const createHotel = (id: string, name: string, description: string, authId: string, address?: Address) => {
  return S.decode(Hotel)({ id, name, description, authId, address })
}

export { createHotel, Hotel }
