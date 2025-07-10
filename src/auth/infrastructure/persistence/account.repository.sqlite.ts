import type { User } from "@/auth/domain/entities/account.entity.js"
import type { AccountRepository } from "@/auth/domain/repositories/account.repository.js"
import type { Email } from "@/auth/domain/value-objects/Email.js"
import { createEmail } from "@/auth/domain/value-objects/Email.js"
import { Effect } from "effect"
import type { SQLiteDatabase } from "./database.js"

export class SQLiteAccountRepository implements AccountRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  save = (account: User): Effect.Effect<void, never, never> =>
    Effect.try(() => {
      const stmt = this.database.db.prepare(`
        INSERT INTO users (id, email, password)
        VALUES (?, ?, ?)
      `)
      stmt.run(account.id, account.email, account.password)
    }).pipe(Effect.catchAll(() => Effect.succeed(void 0)))

  getAll = (): Effect.Effect<Array<User>, never, never> =>
    Effect.try(() => {
      const stmt = this.database.db.prepare(`
        SELECT id, email, password FROM users
      `)
      const rows = stmt.all() as Array<{ id: string; email: string; password: string }>
      return rows.map((row) => ({
        id: row.id,
        email: Effect.runSync(createEmail(row.email)),
        password: row.password
      }))
    }).pipe(
      Effect.catchAll(() => Effect.succeed([]))
    )

  findByEmail = (email: Email): Effect.Effect<User | null, never, never> =>
    Effect.try(() => {
      const stmt = this.database.db.prepare(`
        SELECT id, email, password FROM users WHERE email = ?
      `)
      const row = stmt.get(String(email)) as { id: string; email: string; password: string } | undefined
      if (!row) {
        return null
      }
      return {
        id: row.id,
        email: Effect.runSync(createEmail(row.email)),
        password: row.password
      }
    }).pipe(
      Effect.catchAll(() => Effect.succeed(null))
    )
}

export const createSQLiteAccountRepository = (database: SQLiteDatabase): AccountRepository =>
  new SQLiteAccountRepository(database)
