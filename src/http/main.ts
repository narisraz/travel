import { serve } from "@hono/node-server"
import { app } from "./server.js"

const port = Number(process.env.PORT) || 3000

console.log(`🚀 Serveur démarré sur le port ${port}`)

serve({
  fetch: app.fetch,
  port
})
