import { Email } from "@/auth/domain/value-objects/Email.js"
import * as S from "effect/Schema"

const User = S.Struct({
  id: S.String,
  email: Email,
  password: S.String
})

type User = S.Schema.Type<typeof User>

const createUser = (id: string, email: Email, password: string) => {
  return S.decode(User)({ id, email, password })
}

export { createUser, User }
