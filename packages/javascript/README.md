# @authdog/javascript

Framework-agnostic Authdog SDK for the browser — a small vanilla-JS client that
handles the OIDC redirect, token storage, sign-in/out, and user resolution with
no framework dependency. Built on
[`@authdog/node-commons`](../node-commons), so public-key parsing and the
trusted identity-host allowlist are shared with the rest of the Authdog Web SDK.

## Install

```bash
bun add @authdog/javascript
```

No peer dependencies — works in any browser bundle.

## Quick start

```ts
import { createAuthdogClient } from "@authdog/javascript";

const authdog = createAuthdogClient({
  publicKey: "pk_…", // safe to expose to the browser
});

// On the page the identity provider redirects back to, consume the token.
authdog.handleRedirectCallback();

// Reflect auth state in the UI.
const render = async () => {
  if (authdog.isAuthenticated()) {
    const user = await authdog.getUser();
    console.log("signed in as", user);
  }
};
render();

// Wire up buttons.
signinButton.onclick = () => authdog.signIn();
signupButton.onclick = () => authdog.signUp();
signoutButton.onclick = () => authdog.signOut("/");

// React to token changes (this tab and others).
const unsubscribe = authdog.subscribe(() => render());
```

## How it works

- **`handleRedirectCallback()`** — reads `?token=` from the current URL, strips
  it from the address bar, and persists JWT-shaped values to `localStorage`.
  Non-JWT values are discarded. Call it on every load; it is a no-op without a
  token.
- **`signIn(redirectUri?)` / `signUp(redirectUri?)`** — redirect the browser to
  the OIDC `authorize` endpoint (sign-up adds `prompt=signup`). `redirectUri`
  defaults to `window.location.origin`.
- **`getUser()`** — calls the identity provider's `userinfo` endpoint with the
  stored token and returns the user (or `null` if unauthenticated / the token
  is rejected). Never throws.
- **`signOut(redirectTo?)`** — clears the stored token and optionally navigates.
- **`subscribe(listener)`** — fires on token changes in this tab (custom event)
  and other tabs (native `storage` event). Returns an unsubscribe function.

The token is stored in `localStorage`. This suits public-client SPA flows where
the browser must send the token itself. For server-rendered apps that can hold
an HttpOnly cookie, prefer the server-side framework SDKs.

## Security

- The public key is validated and parsed **once at startup**; a malformed or
  untrusted key (identity host not on the allowlist) throws immediately.
- Only JWT-shaped tokens are persisted, and the token is only ever sent to the
  trusted, `https:` identity host enforced by `@authdog/node-commons`.
- `isAuthenticated()` reflects token *presence* only; treat it as a UI hint.
  Every protected operation must be enforced server-side.

## License

MIT
