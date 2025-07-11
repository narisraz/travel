import { TokenService } from "@/auth/domain/services/token.service.js"
import { Effect } from "effect"
import type { Context, Next } from "hono"
import { httpLayer } from "./http-layer.js"

export const refreshTokenMiddleware = () => {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return next()
    }

    const token = authHeader.split(" ")[1]

    const validateAndRefreshToken = Effect.gen(function*(_) {
      const tokenService = yield* _(TokenService)
      const validationResult = yield* _(tokenService.validateToken(token))

      if (!validationResult.isValid) {
        yield* _(Effect.promise(() => next()))
        return
      }

      if (validationResult.shouldRefresh) {
        const newToken = yield* _(tokenService.generateToken(validationResult.accountId))
        if (newToken) {
          c.res.headers.set("X-New-Token", newToken)
        }
      }

      yield* _(Effect.promise(() => next()))
    })

    await Effect.runPromise(
      Effect.provide(validateAndRefreshToken, httpLayer)
    )
  }
}
