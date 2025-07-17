import { TokenService } from "@/auth/domain/services/token.service.js"
import { Effect } from "effect"
import type { Context, Next } from "hono"
import { httpLayer } from "./http-layer.js"

export interface AuthenticatedContext extends Context {
  user: {
    accountId: string
  }
}

export const authMiddleware = () => {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header("Authorization")

    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({
        success: false,
        error: "Authorization header required"
      }, 401)
    }

    const token = authHeader.split(" ")[1]

    const authResult = await Effect.runPromise(
      Effect.gen(function*(_) {
        const tokenService = yield* _(TokenService)
        const validationResult = yield* _(tokenService.validateToken(token))

        Effect.fail({ _tag: "InvalidTokenError" }).pipe(Effect.unless(() => validationResult.isValid))
        ;(c as AuthenticatedContext).user = {
          accountId: validationResult.accountId
        }

        return validationResult.accountId
      }).pipe(
        Effect.provide(httpLayer),
        Effect.match({
          onFailure: () => ({ success: false, status: 401, error: "Authentication failed" }),
          onSuccess: () => ({ success: true })
        })
      )
    )

    if (!authResult.success) {
      return c.json(
        {
          success: false,
          error: (authResult as any).error
        },
        (authResult as any).status as any
      )
    }

    return next()
  }
}
