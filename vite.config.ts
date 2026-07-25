import { defineConfig } from "vite";

export default defineConfig({
  // Relative production assets work under WAMP subfolders and normal static hosts.
  base: "./",
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
  },
  build: {
    target: "es2020",
    // Public and WAMP builds omit source maps; debug diagnostics remain opt-in.
    sourcemap: false,
  },
});
