import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/socialsync2.0/" : "./",
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: false }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@": "/src",
    },
  },
  build: {
    // Disable code splitting — bundle everything into a single JS file.
    // This prevents stale cached chunk filenames causing 404s after GitHub Pages deploys.
    rollupOptions: {
      output: {
        manualChunks: undefined,
        inlineDynamicImports: true,
      },
    },
  },
});
