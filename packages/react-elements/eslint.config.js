import { config } from "@authdog/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    ignores: ["dist/**", "storybook-static/**", "*.config.*"],
  },
];
