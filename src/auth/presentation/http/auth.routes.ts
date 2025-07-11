import { loginController } from "@/auth/presentation/http/controllers/login.controller.js"
import { registerController } from "@/auth/presentation/http/controllers/register.controller.js"
import { refreshTokenMiddleware } from "@/auth/presentation/http/shared/refresh-token.middleware.js"
import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { z } from "zod"

const authRoutes = new Hono()

// Validation schemas
const createAccountSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8)
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

// Global middleware
authRoutes.use("*", refreshTokenMiddleware())

// Routes
authRoutes.post("/register", zValidator("json", createAccountSchema), async (c) => {
  const { confirmPassword, email, password } = c.req.valid("json")

  const result = await registerController({
    email,
    password,
    confirmPassword
  })

  return c.json(result.response, result.status as any)
})

authRoutes.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json")

  const result = await loginController({
    email,
    password
  })

  return c.json(result.response, result.status as any)
})

export { authRoutes }
