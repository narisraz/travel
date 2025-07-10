import { createAccount } from "@/auth/application/use-cases/create-account.js"
import { login } from "@/auth/application/use-cases/login.js"
import { createEmail } from "@/auth/domain/value-objects/Email.js"
import { zValidator } from "@hono/zod-validator"
import { Effect, Layer } from "effect"
import { Hono } from "hono"
import { z } from "zod"
import { handleAuthErrors } from "./effect-helpers.js"

// Mock dependencies for HTTP context
import { AccountRepository } from "@/auth/domain/repositories/account.repository.js"
import { IdGenerator } from "@/auth/domain/services/id-generator.service.js"
import { PasswordService } from "@/auth/domain/services/password.service.js"
import { TokenService } from "@/auth/domain/services/token.service.js"

const authRoutes = new Hono()

// Validation schemas
const createAccountSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8)
})

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1)
})

// Mock layer for HTTP context (this should be replaced with actual implementations)
const httpLayer = Layer.mergeAll(
  Layer.succeed(AccountRepository, {
    findByEmail: () => Effect.succeed(null),
    getAll: () => Effect.succeed([]),
    save: () => Effect.succeed(void 0)
  } as any),
  Layer.succeed(IdGenerator, {
    next: () => Effect.succeed("mock-id")
  } as any),
  Layer.succeed(PasswordService, {
    validatePassword: () => Effect.succeed(true),
    hashPassword: (password: string) => Effect.succeed(`hashed-${password}`)
  } as any),
  Layer.succeed(TokenService, {
    generateToken: () => Effect.succeed("mock-token")
  } as any)
)

// Routes
authRoutes.post("/register", zValidator("json", createAccountSchema), async (c) => {
  const { confirmPassword, email, password } = c.req.valid("json")

  return await Effect.gen(function*() {
    const emailValue = yield* createEmail(email)

    const request = {
      email: emailValue,
      password,
      confirmPassword
    }

    return yield* createAccount(request)
  }).pipe(
    Effect.provide(httpLayer),
    Effect.match({
      onFailure: (error) => {
        const { message, status } = handleAuthErrors(error)
        return c.json({
          success: false,
          error: message
        }, status as any)
      },
      onSuccess: (user) => {
        return c.json({
          success: true,
          data: {
            id: user.id,
            email
          }
        }, 201)
      }
    }),
    Effect.runPromise
  )
})

authRoutes.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json")

  return await Effect.gen(function*() {
    const emailValue = yield* createEmail(email)

    const request = {
      email: emailValue,
      password
    }

    return yield* login(request)
  }).pipe(
    Effect.provide(httpLayer),
    Effect.match({
      onFailure: (error) => {
        const { message, status } = handleAuthErrors(error)
        return c.json({
          success: false,
          error: message
        }, status as any)
      },
      onSuccess: (result) => {
        return c.json({
          success: true,
          data: {
            token: result.token
          }
        })
      }
    }),
    Effect.runPromise
  )
})

export { authRoutes }
