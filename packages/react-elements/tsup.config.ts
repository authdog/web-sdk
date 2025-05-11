import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"], // Entry point for your source code
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  minify: true,
  clean: true,
  target: "es2020",
  external: ["react", "react-dom"],
  outDir: "dist",
  platform: "browser",
  outExtension: ({ format }) => ({
    js: format === "esm" ? ".mjs" : ".js",
  }),
  onSuccess: "cp src/global.module.css dist/global.css && cp postcss.config.mjs dist/postcss.config.mjs && cp tailwind.config.ts dist/tailwind.config.ts"
}); 