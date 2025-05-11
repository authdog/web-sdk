import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/tailwind.config.ts"], // Entry points including tailwind config
  format: ["cjs", "esm"],
  dts: {
    resolve: true,
    entry: {
      index: "src/index.ts",
      "tailwind.config": "src/tailwind.config.ts",
    },
  },
  splitting: false,
  sourcemap: true,
  minify: true,
  clean: true,
  target: "es2020", // Target a more modern environment
  external: ["react", "react-dom"],
  env: {
    NODE_ENV: process.env.NODE_ENV || "production",
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "production",
    ),
  },
  platform: "browser", // Change to browser since this is for React components
  outExtension: ({ format }) => ({
    js: format === "esm" ? ".mjs" : ".js",
  }),
  tsconfig: "tsconfig.json",
});
