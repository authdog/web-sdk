# @authdog/elysia

Authdog SDK for [Elysia](https://elysiajs.com) — a session plugin, an
authentication gate, and a logout handler for the Bun-first Elysia framework.
Built on [`@authdog/node-commons`](../node-commons), so public-key parsing,
cookie handling, and the trusted identity-host allowlist are shared with the
rest of the Authdog Web SDK.

## Install

```bash
bun add @authdog/elysia elysia
```

`elysia` is a peer dependency (Elysia 1).

## Quick start

```ts
import { Elysia } from "elysia";
import { createAuthdog } from "@authdog/elysia";

const authdog = createAuthdog({
  publicKey: process.env.PK_AUTHDOG!, // pk_… (safe to expose to the browser)
});

const app = new Elysia()
  // Resolve the session for every request and inject `authdog` into context.
  .use(authdog.attachSession())

  // Public route — `authdog` is always present after `attachSession`.
  .get("/", ({ authdog: ctx }) => ({ authenticated: ctx.isAuthenticated }))

  // Protected route — `requireAuth` is the real server-side enforcement point.
  .get("/me", ({ authdog: ctx }) => ctx.user, {
    beforeHandle: authdog.requireAuth,
  })

  // Clears the session cookie and redirects to a sanitized `redirect_uri`.
  .get("/logout", authdog.logout)

  .listen(3000);
```

## How it works

- **`attachSession(options?)`** — an Elysia plugin that reads the session token
  from the `authdog-session` cookie or an `Authorization: Bearer <token>`
  header. When a token is present it calls the identity provider's `userinfo`
  endpoint and injects the result into the handler context as `authdog`:

  ```ts
  interface AuthdogRequestContext {
    token: string | null;
    user: unknown | null;
    isAuthenticated: boolean;
    userInfo?: UserInfoResponse | null;
  }
  ```

  It **never throws and never blocks** the request — a missing, invalid, or
  unverifiable token simply yields `isAuthenticated: false`. Apply it once,
  early (on the root app), so every downstream handler can read `authdog`.

- **`requireAuth`** — a `beforeHandle` helper that responds
  `401 { "error": "Unauthorized" }` when `authdog.isAuthenticated` is falsy,
  otherwise lets the handler run. **This is the security boundary.** Client-side
  checks are presentational only; every protected route must sit behind
  `requireAuth`.

- **`logout`** — returns a `302` Response that expires the `authdog-session`
  cookie (`HttpOnly`, `SameSite=Lax`, `Secure` in production) and redirects to
  the `redirect_uri` query parameter after running it through
  `sanitizeRedirectPath` to prevent open redirects.

## Options

### `attachSession({ fetchUser })`

By default `attachSession` performs **one outbound HTTPS request per incoming
request that carries a token** to resolve the full user object. For
high-throughput services that only need to know whether a token is present (and
validate it elsewhere), opt out:

```ts
app.use(authdog.attachSession({ fetchUser: false }));
```

With `fetchUser: false`, `authdog.token` is populated but `isAuthenticated`
stays `false` and `user` stays `null` — you are responsible for validating the
token where it matters.

## Security

- The public key is validated and parsed **once at startup**; a malformed or
  untrusted key (one whose identity host is not on the allowlist) throws
  immediately rather than per-request.
- The bearer token is only ever sent to a trusted, `https:` identity host —
  enforced by `@authdog/node-commons`.
- A request is treated as authenticated **only** when the `userinfo` envelope
  reports success (`meta.code === 200` with a `user`).

## License

MIT
