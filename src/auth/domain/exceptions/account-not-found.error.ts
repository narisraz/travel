import { Data } from "effect"

export class AccountNotFoundError extends Data.TaggedError("AccountNotFoundError")<object> {}
