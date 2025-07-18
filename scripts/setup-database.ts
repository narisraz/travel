#!/usr/bin/env tsx

import { Effect } from "effect"
import { createPrismaDatabase } from "../src/auth/infrastructure/persistence/prisma.js"

const setupDatabase = Effect.gen(function*() {
  console.log("🔧 Initializing PostgreSQL database...")

  const database = yield* createPrismaDatabase()
  yield* database.initialize()

  console.log("✅ Database initialized successfully!")

  yield* database.close()
  console.log("🔌 Database connection closed.")
})

Effect.runPromise(setupDatabase)
  .then(() => {
    console.log("🎉 Database setup completed!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Database setup failed:", error)
    process.exit(1)
  })
