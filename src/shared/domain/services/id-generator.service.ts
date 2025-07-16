import type { Effect } from "effect"
import { Context } from "effect"

export interface IdGenerator {
  next: () => Effect.Effect<string, never, never>
}

export const IdGenerator = Context.GenericTag<IdGenerator>("IdGenerator")
