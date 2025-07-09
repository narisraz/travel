import type { Email } from "@/auth/domain/value-objects/Email.js"

function createAccount(email: Email, password: string, confirmPassword: string) {
  if (password !== confirmPassword) {
    return false
  }

  if (password.length < 8) {
    return false
  }

  return true
}

export { createAccount }
