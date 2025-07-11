import { Data } from "effect"

export class PasswordMismatchError extends Data.TaggedError("PasswordMismatchError")<object> {}
