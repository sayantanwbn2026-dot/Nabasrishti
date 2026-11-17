import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  /* No single-file inlining: Vercel serves hashed assets from a CDN, and
     inlining would put ~480 KB of JS inside index.html where it cannot be
     cached separately and blocks the parser. */
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    // Guarantees one React instance. Without this, adding a dependency
    // mid-session can leave the optimizer serving a second copy, which shows
    // up as "Invalid hook call".
    dedupe: ["react", "react-dom"],
  },
  build: {
    target: "es2020",
    sourcemap: false,
    // Warn earlier than Vite's 500 KB default so regressions are visible.
    chunkSizeWarningLimit: 400,
    rollupOptions: {
      output: {
        /* Split the vendor libraries out of the app bundle: they change far
           less often, so returning visitors keep them cached. */
        manualChunks: {
          react: ["react", "react-dom", "react-dom/client", "react/jsx-runtime"],
          motion: ["framer-motion", "lenis", "lenis/react"],
          query: ["@tanstack/react-query"],
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "framer-motion",
      "lenis",
      "lenis/react",
      "@tanstack/react-query",
    ],
  },
});
