import type { SQLiteDatabase } from "@/auth/infrastructure/persistence/database.js"
import type { Hotel } from "@/profiles/domain/entities/hotel.js"
import type { HotelRepository } from "@/profiles/domain/repositories/hotel.repository.js"
import { createAddress } from "@/profiles/domain/value-objets/address.js"
import { Effect } from "effect"

export class SQLiteHotelRepository implements HotelRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  save = (hotel: Hotel): Effect.Effect<void, never, never> =>
    Effect.try(() => {
      const stmt = this.database.db.prepare(`
        INSERT INTO hotels (id, name, description, auth_id, address_street, address_zip_code, address_city, address_country)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      stmt.run(
        hotel.id,
        hotel.name,
        hotel.description,
        hotel.authId,
        hotel.address?.street ?? null,
        hotel.address?.zipCode ?? null,
        hotel.address?.city ?? null,
        hotel.address?.country ?? null
      )
    }).pipe(Effect.catchAll(() => Effect.succeed(void 0)))

  getById = (id: string): Effect.Effect<Hotel | null, never, never> =>
    Effect.try(() => {
      const stmt = this.database.db.prepare(`
        SELECT id, name, description, auth_id, address_street, address_zip_code, address_city, address_country
        FROM hotels 
        WHERE id = ?
      `)
      const row = stmt.get(id) as
        | {
          id: string
          name: string
          description: string
          auth_id: string
          address_street: string | null
          address_zip_code: string | null
          address_city: string | null
          address_country: string | null
        }
        | undefined

      if (!row) {
        return null
      }

      // Reconstruct address if any address fields are present
      let address = undefined
      if (
        row.address_street ||
        row.address_zip_code ||
        row.address_city ||
        row.address_country
      ) {
        address = Effect.runSync(
          createAddress(
            row.address_street ?? undefined,
            row.address_zip_code ?? undefined,
            row.address_city ?? undefined,
            row.address_country ?? undefined
          )
        )
      }

      return {
        id: row.id,
        name: row.name,
        description: row.description,
        authId: row.auth_id,
        address
      }
    }).pipe(Effect.catchAll(() => Effect.succeed(null)))
}

export const createSQLiteHotelRepository = (
  database: SQLiteDatabase
): HotelRepository => new SQLiteHotelRepository(database)
