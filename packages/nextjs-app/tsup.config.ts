import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/index.server.ts"], // Entry point for your source code
  format: ["esm", "cjs"], // Output both ESM and CommonJS formats
  dts: true, // Generate TypeScript declaration files
  splitting: false,
  sourcemap: true,
  minify: true,
  clean: true,
  target: "node16", // Ensure compatibility with Node.js 16
  external: ["server-only", "@authdog/node-commons"], // Keep runtime deps external
  noExternal: ["next/server"], // Include everything else
});
