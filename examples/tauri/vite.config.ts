import { defineConfig } from "vite";

export default defineConfig({
  envPrefix: ["VITE_", "PK_"],
  server: {
    port: 3006,
  },
});
