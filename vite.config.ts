import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    minify: "esbuild",

    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: true,
  },
  server: {
    fs: {
      strict: false,
    },
  },
  assetsInclude: [
    "**/*.png",
    "**/*.jpg",
    "**/*.jpeg",
    "**/*.gif",
    "**/*.svg",
    "**/*.webp",
    "**/*.avif",
  ],
  optimizeDeps: {
    include: ["react", "react-dom"],
    exclude: ["@vite/client", "@vite/env"],
  },
  css: {
    devSourcemap: false,
  },
});
