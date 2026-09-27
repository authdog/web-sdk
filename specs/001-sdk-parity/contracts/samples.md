# Contract: Samples

Each sample is private, depends on its package via `workspace:*`, and ships `.env.example` with `PK_AUTHDOG`. If that variable is missing, startup throws before listening.

## Server samples

Applies to `examples/hono`, `examples/koa`, and `examples/elysia`. Copy the Express sample journey.

| Route | Signed out | Signed in |
| --- | --- | --- |
| `/` | Page loads and reports not authenticated | Page loads and reports authenticated |
| `/api/public` | `200` and `authenticated: false` | `200` and `authenticated: true` |
| `/me` and `/protected` | Refused. No profile body | `200` with that session's user |
| `/logout` | Session cookie cleared. Redirect stays on a safe in-app path | Same |

`createAuthdog({ publicKey })` is called once at startup. `attachSession` runs for every request and does not throw when the session is missing. `requireAuth` is the only gate. Logout uses the package's existing sanitization.

Default ports: Hono `3012`, Koa `3013`, Elysia `3014`.

## Browser-framework samples

Applies to `examples/react-router`, `examples/nuxt`, and `examples/solid`. Copy the Vue sample journey.

- Signed out: sign-in action visible, profile hidden.
- Signed in: the signed-in person's profile is visible.
- Sign-out: profile clears and the sign-in action returns.
- Configuration visible to the page is the public key only.

Default ports: React Router `3002`, Nuxt `3003`, Solid `3004`.

React Router uses its loader-based session. Nuxt registers the plugin and may read the server session helper. Solid uses the provider and primitives. Do not route these samples through Express.

## JavaScript sample

`examples/javascript` on port `3005`.

- `createAuthdogClient({ publicKey })`.
- A return from the identity provider is consumed with the package's redirect handler.
- The page shows the signed-in person and a sign-out control.
- No framework runtime.

## Desktop harness

`examples/tauri` on port `3006`.

- `createAuthdogClient` with an injectable opener and redirect URI.
- A delivered callback URL resolves the session and the person.
- Sign-out clears the stored session.
- No `src-tauri` directory and no native bundle step.

## Non-contracts

Samples MUST NOT add a second session cookie, call userinfo against a host outside the existing allowlist, or accept a private credential.
