import path from "path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [],
  test: {
    setupFiles: [path.join(__dirname, "setupTests.ts")],
    include: ["./test/**/*.test.ts"],
    globals: true,
    testTimeout: 30000 // Augmenter le timeout pour les tests d'intégration
  },
  resolve: {
    alias: {
      "@": path.join(__dirname, "src"),
      "@test": path.join(__dirname, "test")
    }
  }
})
