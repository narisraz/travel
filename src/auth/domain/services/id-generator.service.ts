import type { Effect } from "effect"
import { Context } from "effect"

export class IdGenerator extends Context.Tag("IdGenerator")<
  IdGenerator,
  {
    next: () => Effect.Effect<string, never, never>
  }
>() {}
