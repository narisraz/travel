import { login } from "@/auth/application/use-cases/login.js"
import { createEmail } from "@/auth/domain/value-objects/Email.js"
import { Effect } from "effect"
import { handleAuthErrors } from "../effect-helpers.js"
import { httpLayer } from "../shared/http-layer.js"

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  data?: {
    token: string
  }
  error?: string
}

export interface LoginResult {
  response: LoginResponse
  status: number
}

export const loginController = async (request: LoginRequest): Promise<LoginResult> => {
  const { email, password } = request

  return await Effect.gen(function*() {
    const emailValue = yield* createEmail(email)

    const loginRequest = {
      email: emailValue,
      password
    }

    return yield* login(loginRequest)
  }).pipe(
    Effect.provide(httpLayer),
    Effect.match({
      onFailure: (error) => {
        const { message, status } = handleAuthErrors(error)
        return {
          response: {
            success: false,
            error: message
          },
          status
        }
      },
      onSuccess: (result) => {
        return {
          response: {
            success: true,
            data: {
              token: result.token
            }
          },
          status: 200
        }
      }
    }),
    Effect.runPromise
  )
}
