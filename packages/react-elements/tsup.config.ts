import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"], // Entry point for your source code
  format: ["esm", "cjs"],
  dts: true, // Generate TypeScript declaration files
  splitting: false,
  sourcemap: true,
  minify: true,
  clean: true,
  target: "node16", // Ensure compatibility with Node.js 16
  external: ["react", "react-dom"],
  env: {
    NODE_ENV: process.env.NODE_ENV || "production",
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "production",
    ),
  },
  platform: "browser",
  outExtension: ({ format }) => ({
    js: `.mjs`,
  }),
});
