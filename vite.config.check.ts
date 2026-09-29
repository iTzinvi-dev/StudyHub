import path from "node:path"
import { defineConfig } from "vite"

// Builds the logic check into a runnable Node bundle, so the derived
// streak/heatmap maths is executed rather than merely typechecked.
export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
  build: {
    ssr: "scripts/check-sessions.ts",
    outDir: "dist-check",
    rollupOptions: { output: { entryFileNames: "check-sessions.js" } },
  },
})
