/**
 * Gère les erreurs d'authentification communes
 */
export const handleAuthErrors = (error: { _tag: string }) => {
  switch (error._tag) {
    case "InvalidPasswordError":
      return { status: 400, message: "Invalid password" }
    case "PasswordMismatchError":
      return { status: 400, message: "Passwords do not match" }
    case "AccountNotFoundError":
      return { status: 404, message: "Account not found" }
    case "BadCredentialsError":
      return { status: 401, message: "Invalid credentials" }
    case "ParseError":
      return { status: 400, message: "Invalid email format" }
    default:
      return { status: 500, message: "Internal server error" }
  }
}
