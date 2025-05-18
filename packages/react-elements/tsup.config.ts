import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/components/ui/*.tsx",
    "src/lib/*.ts"
  ], // Build all entry points
  format: ["esm", "cjs"],
  dts: {
    resolve: true,
    entry: {
      index: "src/index.ts",
    },
  },
  splitting: false,
  sourcemap: true,
  minify: true,
  clean: true,
  target: "es2020",
  external: ["react", "react-dom"],
  outDir: "dist",
  platform: "browser",
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
    options.define = {
      'process.env.NODE_ENV': '"production"',
    };
    options.resolveExtensions = ['.tsx', '.ts', '.jsx', '.js', '.json'];
  },
  onSuccess: "cp src/global.css dist/global.css && cp postcss.config.mjs dist/postcss.config.mjs && cp tailwind.config.ts dist/tailwind.config.ts"
}); 