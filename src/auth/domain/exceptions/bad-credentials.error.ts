import { Data } from "effect"

export class BadCredentialsError extends Data.TaggedError("BadCredentialsError")<object> {}
