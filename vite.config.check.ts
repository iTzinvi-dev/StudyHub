import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// Builds scripts/dom-check.tsx into a runnable Node bundle so the real
// component tree can be mounted in jsdom and asserted against.
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
  build: {
    ssr: "scripts/dom-check.tsx",
    outDir: "dist-check",
    rollupOptions: { output: { entryFileNames: "dom-check.js" } },
  },
})
