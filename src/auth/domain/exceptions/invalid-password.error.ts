import { Data } from "effect"

export class InvalidPasswordError extends Data.TaggedError("InvalidPasswordError")<object> {}
