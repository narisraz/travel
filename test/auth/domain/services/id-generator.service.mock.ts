import type { IdGenerator } from "@/auth/domain/services/id-generator.service.js"
import { Effect, Ref } from "effect"

class LiveIdGenerator implements IdGenerator {
  constructor(private id: Ref.Ref<string>) {}

  next = (): Effect.Effect<string> => {
    const id = this.id
    return Effect.gen(function*() {
      const currentId = yield* Ref.get(id)
      return currentId.toString()
    })
  }
}

const createIdGenerator = (id: string) =>
  Effect.gen(function*() {
    const ref = yield* Ref.make(id)
    return new LiveIdGenerator(ref)
  })

export { createIdGenerator }
