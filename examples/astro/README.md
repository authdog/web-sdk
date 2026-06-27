# Astro App with Authdog

An example Astro application demonstrating the Authdog Astro SDK
(`@authdog/astro`).

## Features

- Astro 5 in SSR mode (Node standalone adapter)
- Session handling via Authdog middleware (`Astro.locals.authdog`)
- Server-side user resolution with `createAuthdogServer().getUser()`
- Cookie-clearing logout endpoint
- Framework-agnostic client bootstrap (`initAuthdog`)

## Getting Started

1. Install dependencies (from the repo root):

```bash
bun install
```

2. Provide your Authdog public key:

```bash
echo 'PUBLIC_AUTHDOG_PUBLIC_KEY=pk_...' > .env
```

3. Run the dev server:

```bash
moon run astro-app:dev
# or, from this directory: bun run dev
```

## How it works

- `src/middleware.ts` wires `authdogMiddleware`, exposing
  `{ session, isAuthenticated }` on `Astro.locals.authdog` for every request.
- `src/env.d.ts` augments `App.Locals` so those values are typed.
- `src/pages/profile.astro` calls `createAuthdogServer().getUser()` to fetch the
  signed-in user's profile from the identity host.
- `src/pages/api/logout.ts` clears the session cookie and redirects.
