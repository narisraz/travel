import type { PasswordService } from "@/auth/domain/services/password.service.js"
import { Effect } from "effect"

class LivePasswordService implements PasswordService {
  private isValid: boolean
  private hashedPassword: string

  constructor(isValid: boolean, hashedPassword: string) {
    this.isValid = isValid
    this.hashedPassword = hashedPassword
  }

  validatePassword(_: string): Effect.Effect<boolean> {
    return Effect.succeed(this.isValid)
  }

  hashPassword(_: string): Effect.Effect<string> {
    return Effect.succeed(this.hashedPassword)
  }
}

export { LivePasswordService }
