# Authdog × Angular example

A minimal standalone Angular 18 app demonstrating the
[`@authdog/angular`](../../packages/angular) SDK.

## What it shows

- **`provideAuthdog({ publicKey, loginPath })`** — wires the SDK into the
  standalone app config.
- **`authdogInterceptor`** — functional HTTP interceptor registered via
  `provideHttpClient(withInterceptors([authdogInterceptor]))`. It attaches
  `Authorization: Bearer <token>` to outgoing requests when a session token is
  present.
- **`AuthdogService` signals** — `token()`, `isLoading()`, `user()`, `error()`,
  `isAuthenticated()` drive the navbar and pages reactively. The service
  bootstraps a `?token=` query parameter (validated as a JWT) and persists the
  token in `localStorage`.
- **`authdogGuard`** — gates navigation to `/profile`.

## Run it

From the repo root:

```bash
bun install
```

Set your public key in [`src/environments/environment.ts`](src/environments/environment.ts):

```ts
export const environment = {
  authdogPublicKey: "pk_your_public_key_here",
};
```

Then start the dev server:

```bash
moon run angular-app:dev
# or
cd examples/angular && bun run dev
```

The app runs on http://localhost:4205.

## Routes

| Route      | Description                                            |
| ---------- | ------------------------------------------------------ |
| `/`        | Home — explains the demo and shows the auth state.     |
| `/profile` | Calls `fetchUser()` and renders the profile (guarded). |

## ⚠️ Security note

`authdogGuard` is **presentational/UX only** — it runs entirely in the browser
and is trivially bypassable. It only prevents an unauthenticated user from
*navigating* to a route so they see a login redirect instead of a broken page.
Every protected operation **must be independently enforced server-side**: the
API behind the route has to validate the session on each request regardless of
what the guard decides.
