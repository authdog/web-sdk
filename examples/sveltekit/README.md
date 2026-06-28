# SvelteKit App with Authdog

An example SvelteKit application demonstrating the Authdog SvelteKit SDK
(`@authdog/sveltekit`).

## Features

- SvelteKit 2 + Svelte 5 in SSR mode (Node adapter)
- Session handling via the Authdog `handle` hook (`event.locals.authdog`)
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
moon run sveltekit-app:dev
# or, from this directory: bun run dev
```

## How it works

- `src/hooks.server.ts` wires `createAuthdogHandle`, exposing
  `{ session, isAuthenticated }` on `event.locals.authdog` for every request.
- `src/app.d.ts` augments `App.Locals` so those values are typed.
- `src/routes/profile/+page.server.ts` calls `createAuthdogServer().getUser()`
  to fetch the signed-in user's profile from the identity host.
- `src/routes/logout/+server.ts` clears the session cookie and redirects.
