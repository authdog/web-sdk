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
  platform: "node",
  external: ["fastify", "fastify-plugin"],
  noExternal: [],
  outExtension: ({ format }) => ({
    js: format === "esm" ? ".mjs" : ".js",
  }),
});
