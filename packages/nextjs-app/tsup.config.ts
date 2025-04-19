import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/index.server.ts"], // Entry point for your source code
  format: ["esm"], // Output only ESM format
  dts: {
    compilerOptions: {
      moduleResolution: "bundler",
      module: "ESNext"
    }
  },
  splitting: false,
  sourcemap: true,
  minify: true,
  clean: true,
  target: "node20", // Ensure compatibility with Node.js 20
  platform: "node",
  external: [], // Treat `next/server` as an external dependency
  noExternal: [] // Include everything else
});
