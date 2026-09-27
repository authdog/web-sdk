/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PK_AUTHDOG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
