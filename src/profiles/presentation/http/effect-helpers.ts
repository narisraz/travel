/**
 * Gère les erreurs du module profiles
 */
export const handleProfileErrors = (error: { _tag: string }) => {
  switch (error._tag) {
    case "ParseError":
      return { status: 400, message: "Invalid data format" }
    case "HotelNotFoundError":
      return { status: 404, message: "Hotel not found" }
    case "HotelAlreadyExistsError":
      return { status: 400, message: "Hotel already exists" }
    default:
      return { status: 500, message: "Internal server error" }
  }
}
