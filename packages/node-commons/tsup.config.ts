import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/index.server.ts"], // Entry point for your source code
  format: ["cjs", "esm"],
  dts: {
    compilerOptions: {
      moduleResolution: "bundler",
      module: "ESNext",
    },
  },
  splitting: false,
  sourcemap: true,
  minify: true,
  clean: true,
  target: "es2020", // Target modern environments
  platform: "node",
  external: [], // Treat `next/server` as an external dependency
  noExternal: [], // Include everything else
  outExtension: ({ format }) => ({
    js: format === "esm" ? ".mjs" : ".js",
  }),
});
