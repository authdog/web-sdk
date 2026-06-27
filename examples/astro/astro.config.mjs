import { defineConfig } from "astro/config";
import node from "@astrojs/node";

// SSR mode so the Authdog middleware can read the session cookie per request.
export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
});
