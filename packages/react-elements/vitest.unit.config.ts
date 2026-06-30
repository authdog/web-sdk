import { defineConfig } from "vitest/config";

// Unit tests for framework-agnostic pure logic (e.g. src/lib/utils.ts).
// The sibling vitest.config.ts is Storybook's browser-based story runner and
// requires playwright; this config keeps the plain unit suite independent.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
