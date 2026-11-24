import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/merge.ts"],
      reporter: ["text", "lcov"],
      // The assignment asks for 100%; failing the run keeps that honest.
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
  },
});
