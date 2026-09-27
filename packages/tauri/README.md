# @authdog/tauri

Authdog SDK for [Tauri](https://tauri.app) desktop apps — sign-in via the system
browser with a deep-link callback, a pluggable token store, and user resolution
against the OIDC `userinfo` endpoint. Built on
[`@authdog/node-commons`](../node-commons), so public-key parsing and the
trusted identity-host allowlist are shared with the rest of the Authdog Web SDK.

## Install

```bash
bun add @authdog/tauri
```

No hard Tauri dependency — the opener and token store are injectable. For the
native experience, pair it with `@tauri-apps/plugin-opener` (open the system
browser) and `@tauri-apps/plugin-deep-link` (receive the callback).

## Quick start

```ts
import { createAuthdogClient } from "@authdog/tauri";
import { openUrl } from "@tauri-apps/plugin-opener";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";

const authdog = createAuthdogClient({
  publicKey: "pk_…",
  redirectUri: "myapp://auth/callback", // your registered deep link
  openUrl, // open the flow in the system browser
});

// Complete sign-in when the OS delivers the deep link back to the app.
await onOpenUrl(async (urls) => {
  const token = await authdog.handleCallback(urls[0]);
  if (token) {
    const user = await authdog.getUser();
    console.log("signed in as", user);
  }
});

// Trigger sign-in / sign-out from the UI.
signinButton.onclick = () => authdog.signIn();
signoutButton.onclick = () => authdog.signOut();
```

## How it works

- **`signIn({ prompt? })` / `signUp()`** — build the OIDC `authorize` URL and
  open it with `openUrl` (defaults to `window.open`). The provider redirects to
  your `redirectUri` deep link.
- **`handleCallback(url)`** — extracts the token from the deep-link URL (query
  or fragment, custom schemes supported), persists JWT-shaped values, and
  returns the token or `null`.
- **`getToken()` / `isAuthenticated()`** — read the persisted token from the
  configured `TokenStorage` (defaults to `localStorage`; inject
  `@tauri-apps/plugin-store` or the OS keychain for hardened storage).
- **`getUser()`** — calls `userinfo` with the stored token; returns the user or
  `null`. Never throws.
- **`signOut()`** — clears the persisted token.

## Security

- The public key is validated and parsed **once**; a malformed or untrusted key
  (identity host not on the allowlist) throws immediately.
- Credentials never pass through the app webview — sign-in happens in the system
  browser. Only JWT-shaped tokens are persisted, and the token is only ever sent
  to the trusted, `https:` identity host enforced by `@authdog/node-commons`.
- `isAuthenticated()` reflects token *presence* only — a UI hint. Enforce every
  protected operation server-side.

## License

MIT
