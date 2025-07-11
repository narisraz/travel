import { Data } from "effect"

export class EmailAlreadyTakenError extends Data.TaggedError("EmailAlreadyTakenError")<object> {}
