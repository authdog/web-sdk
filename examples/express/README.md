# Authdog × Express example

A minimal [Express](https://expressjs.com) server showing how to protect routes
with the [`@authdog/express`](../../packages/express) SDK.

It demonstrates:

- `createAuthdog({ publicKey })` — validates and parses the public key once at
  startup (enforcing the trusted identity-host allowlist; SSRF / token
  exfiltration protection).
- `attachSession()` middleware — resolves the session and attaches
  `req.authdog` to every request. Never throws, never blocks.
- `requireAuth` — the **real** server-side enforcement point. It replies `401`
  unless the request carries a valid, authenticated session. Any client-side
  check is presentational only; every protected route must sit behind it.
- `logout` — clears the `authdog-session` cookie and performs a safe,
  same-origin redirect (open-redirect protected).

The session token is read from the `authdog-session` cookie or an
`Authorization: Bearer <token>` header.

## Run

From the repository root:

```bash
bun install
```

Then provide your Authdog public key and start the server:

```bash
cp examples/express/.env.example examples/express/.env
# edit examples/express/.env and set PK_AUTHDOG

# via moon (builds the SDK first)
moon run express-api:dev

# or directly
cd examples/express
PK_AUTHDOG=pk_... bun run dev
```

The server listens on http://localhost:3010 (override with `PORT`).

## Routes

| Route | Auth | Description |
| ----- | ---- | ----------- |
| `GET /` | public | HTML home page; injects the public key as `window.__AUTHDOG_PK__` |
| `GET /api/public` | public | Returns `{ authenticated: boolean }` |
| `GET /me` | protected | Returns the authenticated user object (`401` when signed out) |
| `GET /protected` | protected | Returns a JSON message for authenticated users |
| `GET /logout` | public | Clears the session cookie and redirects |
