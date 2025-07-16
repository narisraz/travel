import * as S from "effect/Schema"

const Address = S.Struct({
  street: S.optional(S.String),
  zipCode: S.optional(S.String),
  city: S.optional(S.String),
  country: S.optional(S.String)
})

type Address = S.Schema.Type<typeof Address>

const createAddress = (street?: string, zipCode?: string, city?: string, country?: string) => {
  return S.decode(Address)({ street, zipCode, city, country })
}

export { Address, createAddress }
