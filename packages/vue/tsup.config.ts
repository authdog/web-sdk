import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/client.ts", "src/server.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  minify: true,
  clean: true,
  target: "node16",
  external: ["vue"],
  noExternal: [],
});
