import { createHotelProfileController } from "@/profiles/presentation/http/controllers/create-hotel-profile.controller.js"
import { authMiddleware } from "@/profiles/presentation/http/shared/auth.middleware.js"
import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { z } from "zod"

const profilesRoutes = new Hono()

// 🔐 MIDDLEWARE D'AUTHENTIFICATION
// Toutes les routes de ce module nécessitent une authentification
profilesRoutes.use("*", authMiddleware())

// Validation schemas
const createHotelProfileSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  address: z.object({
    street: z.string().optional(),
    zipCode: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional()
  }).optional()
})

// 🔐 ROUTES PROTÉGÉES
// POST /api/profiles/hotels - Créer un profil d'hôtel (AUTHENTIFICATION REQUISE)
profilesRoutes.post("/hotels", zValidator("json", createHotelProfileSchema), async (c) => {
  // Le contexte est automatiquement enrichi par le middleware d'authentification
  const data = c.req.valid("json")

  // Récupération de l'ID utilisateur depuis le contexte authentifié
  const accountId = (c as any).user?.accountId
  if (!accountId) {
    return c.json({
      success: false,
      error: "Authentication required"
    }, 401)
  }

  const result = await createHotelProfileController({
    authId: accountId, // ← Récupéré automatiquement du token
    description: data.description,
    name: data.name,
    ...(data.address && { address: data.address })
  })

  return c.json(result.response, result.status as any)
})

export { profilesRoutes }
