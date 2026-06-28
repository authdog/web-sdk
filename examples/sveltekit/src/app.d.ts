// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
  namespace App {
    interface Locals {
      authdog: import("@authdog/sveltekit/server").AuthdogLocals;
    }
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_AUTHDOG_PUBLIC_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};
