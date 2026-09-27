# @authdog/solid

Authdog SDK for [SolidJS](https://www.solidjs.com) — a reactive provider and a
set of primitives (`useSession`, `useUser`, `useSignIn`, `useSignUp`,
`useSignOut`). Built on [`@authdog/node-commons`](../node-commons), so
public-key parsing and the trusted identity-host allowlist are shared with the
rest of the Authdog Web SDK.

## Install

```bash
bun add @authdog/solid solid-js
```

`solid-js` is a peer dependency.

## Quick start

```tsx
import { AuthdogProvider, useSession, useUser, useSignIn, useSignOut } from "@authdog/solid";

function Content() {
  const { isAuthenticated } = useSession();
  const { user, load } = useUser();
  const { signIn } = useSignIn();
  const { signOut } = useSignOut();

  return (
    <Show when={isAuthenticated()} fallback={<button onClick={() => signIn()}>Sign in</button>}>
      <button onClick={() => load()}>Load profile</button>
      <button onClick={() => signOut("/")}>Sign out</button>
      <pre>{JSON.stringify(user(), null, 2)}</pre>
    </Show>
  );
}

export default function App() {
  return (
    <AuthdogProvider publicKey="pk_…">
      <Content />
    </AuthdogProvider>
  );
}
```

## How it works

- **`AuthdogProvider`** — validates the public key once, then on mount consumes
  a `?token=` from the URL (persisting JWT-shaped values to `localStorage` and
  reloading so the server can process the token), or hydrates from
  `localStorage`. Provides the reactive context to descendants.
- **`useSession()`** — returns `{ token, isAuthenticated, isLoading }` as Solid
  accessors.
- **`useUser()`** — returns `{ user, isLoading, error, load }`; `load()` calls
  the identity provider's `userinfo` endpoint and never throws.
- **`useSignIn()` / `useSignUp()`** — redirect to the OIDC `authorize` flow
  (sign-up adds `prompt=signup`).
- **`useSignOut()`** — clears the token and optionally navigates.

## Security

- The public key is validated and parsed **once**; a malformed or untrusted key
  (identity host not on the allowlist) throws immediately.
- Only JWT-shaped tokens are persisted; the token is only ever sent to the
  trusted, `https:` identity host enforced by `@authdog/node-commons`.
- `isAuthenticated()` reflects token *presence* only — a UI hint. Enforce every
  protected operation server-side.

## License

MIT
