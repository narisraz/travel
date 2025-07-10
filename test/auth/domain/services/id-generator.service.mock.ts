import type { IdGenerator } from "@/auth/domain/services/id-generator.service.js"
import { Effect } from "effect"

class LiveIdGenerator implements IdGenerator {
  private id: string

  constructor(id: string) {
    this.id = id
  }

  next(): Effect.Effect<string> {
    return Effect.succeed(this.id)
  }
}

export { LiveIdGenerator }
