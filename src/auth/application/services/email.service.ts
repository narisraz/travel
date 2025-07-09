import { Effect } from "effect"

const validateEmail = (email: string): Effect.Effect<boolean, never, never> => {
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return Effect.succeed(false)
  }
  return Effect.succeed(true)
}

export { validateEmail }
