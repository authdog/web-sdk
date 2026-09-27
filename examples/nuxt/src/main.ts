import { createApp } from "vue";
import { createAuthdog } from "@authdog/nuxt";
import App from "./App.vue";

const publicKey = import.meta.env.PK_AUTHDOG;
if (!publicKey) {
  throw new Error(
    "PK_AUTHDOG is not set. Copy .env.example to .env and add your Authdog public key.",
  );
}

const app = createApp(App);
app.use(createAuthdog({ publicKey }));
app.mount("#app");
