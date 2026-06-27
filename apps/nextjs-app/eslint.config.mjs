import { nextJsConfig } from "@authdog/eslint-config/next-js";

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    ignores: [".next/**", "node_modules/**"],
  },
];
