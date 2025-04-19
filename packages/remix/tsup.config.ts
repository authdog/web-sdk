import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"], // Entry point for your source code
  format: ["esm"], // Output only ESM format
  dts: true, // Generate TypeScript declaration files
  splitting: false,
  sourcemap: true,
  minify: true,
  clean: true,
  target: "node16", // Ensure compatibility with Node.js 16
  external: ["@remix-run/node"],
  env: {
    NODE_ENV: process.env.NODE_ENV || "production",
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "production",
    ),
  },
  platform: "node",
  outExtension: ({ format }) => ({
    js: `.mjs`,
  }),
});
