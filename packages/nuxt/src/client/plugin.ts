import type { App, Plugin } from "vue";
import { getPublicKeyPayload } from "../commons";
import { AUTHDOG_CONTEXT_KEY, createAuthdogContext } from "./context";

export interface AuthdogPluginOptions {
  /** The Authdog public key (`pk_…`). Safe to expose to the browser. */
  publicKey: string;
}

/**
 * Creates the Authdog Vue plugin for Nuxt. Register it from a Nuxt plugin file:
 *
 * ```ts
 * // plugins/authdog.ts
 * import { createAuthdog } from "@authdog/nuxt";
 *
 * export default defineNuxtPlugin((nuxtApp) => {
 *   nuxtApp.vueApp.use(
 *     createAuthdog({ publicKey: useRuntimeConfig().public.authdogPublicKey }),
 *   );
 * });
 * ```
 *
 * The public key is validated once here (enforcing the trusted identity-host
 * allowlist), so a malformed or untrusted key fails fast at startup.
 */
export const createAuthdog = (options: AuthdogPluginOptions): Plugin => {
  if (!options.publicKey) {
    throw new Error("Public key is not defined");
  }
  // Validate + parse eagerly so an invalid/untrusted key throws at startup.
  getPublicKeyPayload(options.publicKey);

  return {
    install(app: App) {
      const context = createAuthdogContext(options.publicKey);
      context.bootstrap();
      app.provide(AUTHDOG_CONTEXT_KEY, context);
    },
  };
};
