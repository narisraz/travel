import { authRoutes } from "@/auth/presentation/http/auth.routes.js"
import { refreshTokenMiddleware } from "@/auth/presentation/http/shared/refresh-token.middleware.js"
import { profilesRoutes } from "@/profiles/presentation/http/profiles.routes.js"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { prettyJSON } from "hono/pretty-json"

const app = new Hono()

// Middleware
app.use("*", cors())
app.use("*", logger())
app.use("*", prettyJSON())
app.use("*", refreshTokenMiddleware())

// Health check endpoint
app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString()
  })
})

// API routes
app.route("/api/auth", authRoutes)
app.route("/api/profiles", profilesRoutes)

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: "Not found"
  }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error("Server error:", err)
  return c.json({
    success: false,
    error: "Internal server error"
  }, 500)
})

export { app }
