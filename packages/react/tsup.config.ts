import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  minify: true,
  clean: true,
  target: "es2020",
  external: ["react", "react-dom", "@authdog/react-elements", "@authdog/node-commons"],
  platform: "browser",
  outExtension: ({ format }) => ({
    js: format === "esm" ? ".mjs" : ".js",
  }),
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
});
