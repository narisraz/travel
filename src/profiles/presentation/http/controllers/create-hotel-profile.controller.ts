import { createHotelProfile } from "@/profiles/application/use-cases/create-hotel-profile.js"
import { Effect } from "effect"
import { handleProfileErrors } from "../effect-helpers.js"
import { httpLayer } from "../shared/http-layer.js"

export interface CreateHotelProfileRequest {
  name: string
  description: string
  authId: string
  address?: {
    readonly street?: string | undefined
    readonly zipCode?: string | undefined
    readonly city?: string | undefined
    readonly country?: string | undefined
  }
}

export interface CreateHotelProfileResponse {
  success: boolean
  data?: {
    id: string
    name: string
    description: string
    authId: string
    address?: {
      readonly street?: string | undefined
      readonly zipCode?: string | undefined
      readonly city?: string | undefined
      readonly country?: string | undefined
    }
  }
  error?: string
}

export interface CreateHotelProfileResult {
  response: CreateHotelProfileResponse
  status: number
}

export const createHotelProfileController = async (
  request: CreateHotelProfileRequest
): Promise<CreateHotelProfileResult> => {
  const { address, authId, description, name } = request

  return await Effect.gen(function*() {
    const createHotelProfileRequest = {
      authId,
      description,
      name,
      ...(address && { address })
    }

    return yield* createHotelProfile(createHotelProfileRequest)
  }).pipe(
    Effect.provide(httpLayer),
    Effect.match({
      onFailure: (error) => {
        const { message, status } = handleProfileErrors(error)
        return {
          response: {
            success: false,
            error: message
          },
          status
        }
      },
      onSuccess: (hotel) => {
        return {
          response: {
            success: true,
            data: {
              authId: hotel.authId,
              description: hotel.description,
              id: hotel.id,
              name: hotel.name,
              ...(hotel.address && { address: hotel.address })
            }
          },
          status: 201
        }
      }
    }),
    Effect.runPromise
  )
}
