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
  // React Native bundles the JS itself; never inline the runtime peers.
  external: ["react", "react-native"],
  noExternal: [],
  platform: "browser",
  outExtension: ({ format }) => ({
    js: format === "esm" ? ".mjs" : ".js",
  }),
});
