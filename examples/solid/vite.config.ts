import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  envPrefix: ["VITE_", "PK_"],
  server: {
    port: 3004,
  },
});
