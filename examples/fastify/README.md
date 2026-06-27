# Authdog × Fastify example

A minimal [Fastify](https://fastify.dev) server that demonstrates the
[`@authdog/fastify`](../../packages/fastify) plugin: per-request session
resolution, a `requireAuth` gate for protected routes, and a safe logout.

## What it shows

- Registering the plugin once with `app.register(authdogPlugin, { publicKey })`.
- Reading the informational per-request context from `request.authdog`
  (`token`, `user`, `isAuthenticated`).
- Gating protected routes with the `app.authdog.requireAuth` preHandler.
- Clearing the session cookie via `app.authdog.logout(request, reply)`.
- Inlining the validated public-key payload (`app.authdog.getPublicKey()`) into
  the home page for the browser.

## Running

```bash
cp .env.example .env   # then set PK_AUTHDOG to your Authdog public key

# from the repo root
moon run fastify-api:dev

# or directly
cd examples/fastify
bun run dev
```

The server listens on http://localhost:3011 (override with `PORT`).

## Routes

| Route          | Auth         | Description                                   |
| -------------- | ------------ | --------------------------------------------- |
| `GET /`        | public       | HTML home page; inlines the public key        |
| `GET /api/public` | public    | Reports whether the request is authenticated  |
| `GET /me`      | **required** | Returns the authenticated user object         |
| `GET /protected` | **required** | Returns a protected JSON message            |
| `GET /logout`  | public       | Clears the `authdog-session` cookie, redirects |

## Security notes

- The public key is **validated and parsed once at registration**, enforcing
  the trusted identity-host allowlist (SSRF / token-exfiltration protection). A
  malformed or untrusted key fails fast at startup, not per-request.
- `request.authdog` is **informational only**. `isAuthenticated` is only `true`
  when a token was present *and* the identity host confirmed it.
- `app.authdog.requireAuth` is the **real server-side enforcement point** —
  every protected route must sit behind it. Client-side checks are
  presentational and trivially bypassable.
- `logout` clears the cookie with the same security attributes it was set with
  and redirects only to a sanitized, same-origin path (open-redirect safe).
