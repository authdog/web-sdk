# Quickstart: Validate New SDK Parity

Run these checks from the repository root after implementation. They prove the catalog, samples, and checks. They are not the implementation steps.

## Prerequisites

- Bun and moon, as in the root README
- `bun install`
- A valid `PK_AUTHDOG` only when manually exercising sign-in. Type-check and unit tests do not need a live identity provider

## 1. Catalog

Confirm `README.md` lists all eight packages and all eight samples, and that the Express, Fastify, and Vue rows are still present:

- `@authdog/hono`, `@authdog/koa`, `@authdog/elysia`
- `@authdog/react-router`, `@authdog/nuxt`, `@authdog/solid`
- `@authdog/javascript`, `@authdog/tauri`

Confirm `just --list` shows the eight new `dev-*` recipes and the previous ones.

## 2. Package tests

```bash
moon run hono:test koa:test elysia:test react-router:test nuxt:test solid:test javascript:test tauri:test
```

Expected: each task exits 0 using the tests already in that package.

## 3. Sample type-check

```bash
moon run hono-api:type-check koa-api:type-check elysia-api:type-check \
  react-router-app:type-check nuxt-app:type-check solid-app:type-check \
  javascript-app:type-check tauri-app:type-check
```

Expected: each task exits 0. The Tauri sample type-checks without a Rust toolchain or `src-tauri`.

## 4. Server journey

For Hono (`3012`), Koa (`3013`), and Elysia (`3014`):

```bash
just dev-hono   # or dev-koa / dev-elysia, with PK_AUTHDOG set
```

- Starting without `PK_AUTHDOG` exits before listening.
- `GET /api/public` with no cookie returns success and `authenticated: false`.
- `GET /me` with no cookie is refused and has no profile.
- `GET /logout` clears the session and stays on a safe in-app path.

## 5. Browser and desktop journey

Start `just dev-react-router`, `dev-nuxt`, `dev-solid`, `dev-javascript`, or `dev-tauri`.

- Signed out: sign-in is offered and no profile is shown.
- After sign-in or a supplied callback: the signed-in person is shown.
- Sign-out clears that state.
- The page configuration contains a public key and no private credential.

## 6. Isolation

Touch a file under `packages/hono` only and confirm the Hono workflow path filter matches that package and not `packages/vue`. Repeat the same observation for the other seven workflow files.
