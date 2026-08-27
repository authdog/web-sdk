# @authdog/elysia

## 0.4.0

### Minor Changes

- 225b972: Add server-framework SDKs for Hono, Koa, and Elysia. Each mirrors the existing
  `@authdog/express` / `@authdog/fastify` adapters: an eagerly-validated
  `createAuthdog({ publicKey })` factory, an `attachSession` middleware/plugin that
  resolves the session and degrades safely to anonymous, a `requireAuth`
  enforcement gate, and a `logout` handler — all built on `@authdog/node-commons`.
