import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    setupFiles: ["./src/test/setupOffscreenCanvas.ts"],
    restoreMocks: true,
  },
});
