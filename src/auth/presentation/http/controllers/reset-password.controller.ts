import { resetPassword } from "@/auth/application/use-cases/reset-password.js"
import { createEmail } from "@/auth/domain/value-objects/Email.js"
import { Effect } from "effect"
import { handleAuthErrors } from "../effect-helpers.js"
import { httpLayer } from "../shared/http-layer.js"

export interface ResetPasswordRequest {
  email: string
  password: string
  confirmPassword: string
}

export interface ResetPasswordResponse {
  success: boolean
  data?: {
    message: string
  }
  error?: string
}

export interface ResetPasswordResult {
  response: ResetPasswordResponse
  status: number
}

export const resetPasswordController = async (request: ResetPasswordRequest): Promise<ResetPasswordResult> => {
  const { confirmPassword, email, password } = request

  return await Effect.gen(function*() {
    const emailValue = yield* createEmail(email)

    const resetPasswordRequest = {
      email: emailValue,
      password,
      confirmPassword
    }

    return yield* resetPassword(resetPasswordRequest)
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
      onSuccess: () => {
        return {
          response: {
            success: true,
            data: {
              message: "Password reset successfully"
            }
          },
          status: 200
        }
      }
    }),
    Effect.runPromise
  )
}
