import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    // Node SSR adapter so the Authdog hook can read the session cookie per request.
    adapter: adapter(),
  },
};

export default config;
