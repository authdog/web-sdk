# @authdog/express

## 0.1.0

### Minor Changes

- 01eee99: Add four new framework-native SDKs, all built on the hardened
  `@authdog/node-commons` core (trusted-host allowlist, safe cookie parsing,
  redirect sanitization).

  **`@authdog/angular`** — Angular SPA SDK. Standalone `provideAuthdog()` wiring,
  a signals-based `AuthdogService`, an `authdogInterceptor` that attaches the
  bearer token, and an `authdogGuard` (documented as a presentational UX guard,
  not a security boundary). The `?token=` value is validated as a JWT before it
  is persisted; all browser APIs are SSR-guarded for Angular Universal.

  **`@authdog/express`** — Express backend middleware. `createAuthdog()` factory,
  an `attachSession` middleware that resolves the session from the
  `authdog-session` cookie or a bearer header and populates `req.authdog`, a
  `requireAuth` enforcement middleware (the real server-side gate), and a logout
  handler that clears the cookie (`Secure` in production) and sanitizes
  `redirect_uri`.

  **`@authdog/fastify`** — Fastify plugin (via `fastify-plugin`). Decorates the
  request with `request.authdog`, resolves the session in an `onRequest` hook,
  and exposes `fastify.authdog.requireAuth` / `logout` / `getPublicKey`. Cookies
  are parsed with `@authdog/node-commons` so no extra cookie plugin is required.

  **`@authdog/react-native`** — React Native / Expo client SDK. `AuthdogProvider`
  plus `useSession` / `useUser` / `useSignIn` / `useSignUp` / `useSignOut` /
  `useAuthz` hooks, a pluggable async `AuthdogStorage` interface (with an
  `expo-secure-store` adapter) for secure token storage, and deep-link Universal
  Login. Tokens are validated as JWTs before being persisted.

- 01eee99: Modernize codebase, add angular, express, fastify, react-native

### Patch Changes

- Updated dependencies [01eee99]
  - @authdog/node-commons@0.1.0
