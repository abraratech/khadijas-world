import { defineConfig } from "vite";

const KIB = 1024;

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
    rolldownOptions: {
      output: {
        // Babylon registers several features through module side effects. Keep
        // their source order stable while separating the large dependency graph.
        strictExecutionOrder: true,
        codeSplitting: {
          groups: [
            {
              name: "babylon-loaders",
              test: /node_modules[\\/]@babylonjs[\\/]loaders/,
              maxSize: 360 * KIB,
              priority: 30,
              includeDependenciesRecursively: false,
            },
            {
              name: "babylon-core",
              test: /node_modules[\\/]@babylonjs[\\/]core/,
              maxSize: 390 * KIB,
              priority: 20,
              includeDependenciesRecursively: false,
            },
            {
              name: "game-runtime",
              test: /src[\\/]game[\\/]/,
              minSize: 24 * KIB,
              maxSize: 390 * KIB,
              priority: 10,
              includeDependenciesRecursively: false,
            },
          ],
        },
      },
    },
  },
});
