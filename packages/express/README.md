# @authdog/express

Authdog SDK for [Express](https://expressjs.com) — session middleware, an
authentication gate, and a logout handler for Node.js backends. Built on
[`@authdog/node-commons`](../node-commons), so public-key parsing, cookie
handling, and the trusted identity-host allowlist are shared with the rest of
the Authdog Web SDK.

## Install

```bash
bun add @authdog/express express
```

`express` is a peer dependency (Express 4 or 5).

## Quick start

```ts
import express from "express";
import { createAuthdog } from "@authdog/express";

const app = express();

const authdog = createAuthdog({
  publicKey: process.env.PK_AUTHDOG!, // pk_… (safe to expose to the browser)
});

// Resolve the session for every request and attach `req.authdog`.
app.use(authdog.attachSession());

// Public route — `req.authdog` is always present after `attachSession`.
app.get("/", (req, res) => {
  res.json({ authenticated: req.authdog?.isAuthenticated ?? false });
});

// Protected route — `requireAuth` is the real server-side enforcement point.
app.get("/me", authdog.requireAuth, (req, res) => {
  res.json(req.authdog!.user);
});

// Clears the session cookie and redirects to a sanitized `redirect_uri`.
app.get("/logout", authdog.logout);

app.listen(3000);
```

## How it works

- **`attachSession(options?)`** — reads the session token from the
  `authdog-session` cookie or an `Authorization: Bearer <token>` header. When a
  token is present it calls the identity provider's `userinfo` endpoint and
  attaches the result to `req.authdog`:

  ```ts
  interface AuthdogRequestContext {
    token: string | null;
    user: unknown | null;
    isAuthenticated: boolean;
    userInfo?: UserInfoResponse | null;
  }
  ```

  It **never throws and never blocks** the request — a missing, invalid, or
  unverifiable token simply yields `isAuthenticated: false`. Mount it once,
  early, so every downstream handler can read `req.authdog`.

- **`requireAuth`** — responds `401 { "error": "Unauthorized" }` when
  `req.authdog?.isAuthenticated` is falsy, otherwise calls `next()`. **This is
  the security boundary.** Client-side checks are presentational only; every
  protected route must sit behind `requireAuth`.

- **`logout`** — expires the `authdog-session` cookie (`HttpOnly`,
  `SameSite=Lax`, `Secure` in production) and redirects to the `redirect_uri`
  query parameter after running it through `sanitizeRedirectPath` to prevent
  open redirects.

## Options

### `attachSession({ fetchUser })`

By default `attachSession` performs **one outbound HTTPS request per incoming
request that carries a token** to resolve the full user object. For
high-throughput services that only need to know whether a token is present (and
validate it elsewhere), opt out:

```ts
app.use(authdog.attachSession({ fetchUser: false }));
```

With `fetchUser: false`, `req.authdog.token` is populated but
`isAuthenticated` stays `false` and `user` stays `null` — you are responsible
for validating the token where it matters.

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
