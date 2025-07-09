import { Email } from "@/auth/domain/value-objects/Email.js"
import * as S from "effect/Schema"

const User = S.Struct({
  email: Email,
  password: S.String
})

type User = S.Schema.Type<typeof User>

const createUser = (email: Email, password: string) => {
  return S.decode(User)({ email, password })
}

export { createUser, User }
