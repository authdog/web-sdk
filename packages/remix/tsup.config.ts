import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/client.ts"], // Build both server and client entry points
  format: ["cjs", "esm"], // Output both CJS and ESM formats
  dts: true, // Generate TypeScript declaration files
  splitting: false,
  sourcemap: true,
  minify: true,
  clean: true,
  target: "es2020", // Target a more modern environment
  external: ["@remix-run/node", "react", "react-dom"],
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
    js: format === "esm" ? ".mjs" : ".js",
  }),
});
