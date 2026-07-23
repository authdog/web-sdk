# @authdog/react-router

Authdog SDK for [React Router 7](https://reactrouter.com) (framework mode) — a
loader-based session, a logout loader, and a minimal client provider. Built on
[`@authdog/node-commons`](../node-commons), so public-key parsing, cookie
handling, and the trusted identity-host allowlist are shared with the rest of
the Authdog Web SDK.

React Router 7 loaders and actions run on the Web Fetch API, so this SDK returns
plain `Response` objects and pulls in no framework Node adapter.

## Install

```bash
bun add @authdog/react-router
```

`react`, `react-dom`, and `react-router` (v7) are peer dependencies.

Set `PK_AUTHDOG` (your `pk_…` public key) in the server environment.

## Use session

Wire the identity loader into a route and read it with `useLoaderData`:

```ts
// app/routes/_index.tsx
import { identityLoader } from "@authdog/react-router";

export const loader = identityLoader();
```

```tsx
import { useLoaderData } from "react-router";

export default function Index() {
  const { user, isAuthenticated, signinUri } = useLoaderData<typeof loader>();
  return isAuthenticated ? <p>Hi {user.displayName}</p> : <a href={signinUri}>Sign in</a>;
}
```

The loader reads a `?token=` from the callback URL, resolves it via the OIDC
`userinfo` endpoint, and persists the session in two HttpOnly `Secure`
`SameSite=Strict` cookies (`user_session_<envId>` and
`user_session_hash_<envId>`). On later requests it re-validates the session from
those cookies. The raw token never reaches client JS.

## Provider

Mount `AuthdogProvider` at the app root. It strips the `?token=` param from the
URL after the server has consumed it (and reloads once so the loader runs):

```tsx
import { AuthdogProvider } from "@authdog/react-router/client";

export default function App() {
  return <AuthdogProvider>{/* ... */}</AuthdogProvider>;
}
```

## Logout

```ts
// app/routes/logout.tsx
import { logoutLoader } from "@authdog/react-router";

export const loader = logoutLoader; // clears both cookies, redirects to "/"
```

For local development, `identityDevAction({ redirectTo })` clears the session
cookies and redirects (disabled in production, redirect target sanitized).

## License

MIT
