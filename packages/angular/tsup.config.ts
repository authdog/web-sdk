import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  minify: true,
  clean: true,
  target: "es2022",
  external: [
    "@angular/core",
    "@angular/common",
    "@angular/common/http",
    "@angular/router",
    "rxjs",
  ],
  noExternal: [],
});
