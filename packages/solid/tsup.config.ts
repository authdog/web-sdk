import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
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
  target: "es2020",
  platform: "browser",
  external: ["solid-js"],
  noExternal: [],
  outExtension: ({ format }) => ({
    js: format === "esm" ? ".mjs" : ".js",
  }),
});
