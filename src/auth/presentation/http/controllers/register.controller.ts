import { createAccount } from "@/auth/application/use-cases/create-account.js"
import { createEmail } from "@/auth/domain/value-objects/Email.js"
import { Effect } from "effect"
import { handleAuthErrors } from "../effect-helpers.js"
import { httpLayer } from "../shared/http-layer.js"

export interface RegisterRequest {
  email: string
  password: string
  confirmPassword: string
}

export interface RegisterResponse {
  success: boolean
  data?: {
    id: string
    email: string
  }
  error?: string
}

export interface RegisterResult {
  response: RegisterResponse
  status: number
}

export const registerController = async (request: RegisterRequest): Promise<RegisterResult> => {
  const { confirmPassword, email, password } = request

  return await Effect.gen(function*() {
    const emailValue = yield* createEmail(email)

    const createAccountRequest = {
      email: emailValue,
      password,
      confirmPassword
    }

    return yield* createAccount(createAccountRequest)
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
      onSuccess: (user) => {
        return {
          response: {
            success: true,
            data: {
              id: user.id,
              email
            }
          },
          status: 201
        }
      }
    }),
    Effect.runPromise
  )
}
