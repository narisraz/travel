import * as S from "effect/Schema"

const Email = S.String.pipe(
  S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  S.brand("Email")
)

type Email = S.Schema.Type<typeof Email>

const createEmail = (email: string) => {
  return S.decode(Email)(email)
}

export { createEmail, Email }
