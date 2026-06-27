# @authdog/astro

Authdog Astro SDK for authentication and user management.

Built for Astro's islands model: a framework-agnostic middleware + server
helpers handle sessions on the server, and a tiny vanilla client bootstrap
handles the login redirect — no UI-framework peer dependency required.

## Installation

```bash
bun add @authdog/astro
```

This SDK requires an SSR-capable Astro app (`output: "server"` or `"hybrid"`)
so middleware can read the session cookie per request.

## Usage

### Middleware

Wire the middleware once so every request gets `Astro.locals.authdog`:

```ts
// src/middleware.ts
import { defineMiddleware } from "astro:middleware";
import { authdogMiddleware } from "@authdog/astro/server";

export const onRequest = defineMiddleware(
  authdogMiddleware({ publicKey: import.meta.env.PUBLIC_AUTHDOG_PUBLIC_KEY }),
);
```

Augment `App.Locals` for typed access:

```ts
// src/env.d.ts
declare namespace App {
  interface Locals {
    authdog: import("@authdog/astro/server").AuthdogLocals;
  }
}
```

### Server-side (`.astro` pages, endpoints, actions)

```astro
---
import { createAuthdogServer } from "@authdog/astro/server";

const authdog = createAuthdogServer({
  publicKey: import.meta.env.PUBLIC_AUTHDOG_PUBLIC_KEY,
});

// From middleware-populated locals:
const isAuthenticated = Astro.locals.authdog?.isAuthenticated;

// Or resolve the full user profile on demand:
const user = await authdog.getUser(Astro.request);
---

{isAuthenticated ? <p>Welcome, {user?.user?.displayName}</p> : <a href="/login">Sign in</a>}
```

### Logout endpoint

```ts
// src/pages/api/logout.ts
import type { APIRoute } from "astro";
import { createAuthdogServer } from "@authdog/astro/server";

const authdog = createAuthdogServer({
  publicKey: import.meta.env.PUBLIC_AUTHDOG_PUBLIC_KEY,
});

export const GET: APIRoute = ({ request }) => authdog.logout(request);
```

### Client-side bootstrap

```astro
<script>
  import { initAuthdog } from "@authdog/astro/client";
  // Consumes ?token=… from the login redirect, persists it, then reloads.
  initAuthdog();
</script>
```

## API Reference

### Server

- `authdogMiddleware(config)` — Astro middleware that populates `Astro.locals.authdog`
- `createAuthdogServer(config)` — server instance (`getSession`, `getUser`, `getPublicKey`, `logout`)
- `getSessionCookie(request, cookieName?)` — read the raw session token
- `logoutHandler(request, cookieName?)` — build a cookie-clearing redirect response
- `getServerSidePayloadPublicKey(publicKey)` — validate the public key

### Client

- `initAuthdog()` — handle the `?token=…` login redirect and persist the token
- `clearAuthdogToken()` — client-side sign-out (clears localStorage)
- `fetchUserData(publicKey, token)` — fetch the user profile from the identity host
- `getTokenFromUri(url)`, `validatePublicKey(publicKey)`, `browserCookiesOptions`
