/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    authdog: import("@authdog/astro/server").AuthdogLocals;
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_AUTHDOG_PUBLIC_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
