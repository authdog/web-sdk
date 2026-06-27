# Authdog × React Native (Expo) example

A minimal [Expo](https://expo.dev) app demonstrating the
[`@authdog/react-native`](../../packages/react-native) SDK: hosted sign‑in /
sign‑up via the system browser, deep‑link callback handling, fetching the
authenticated user, and sign‑out — with the session token persisted in the
device secure store.

## What it shows

- `AuthdogProvider` configured with a secure‑store token backend
  (`createSecureStoreAdapter` over `expo-secure-store`).
- `useSignIn` / `useSignUp` to open the hosted flow in the system browser.
- `useRedirectHandler` to complete sign‑in from the returned deep link — it
  validates that the `?token=` looks like a JWT **before** persisting it.
- `useSession` for the auth state and `useUser` to load the userinfo profile.
- `useSignOut` to clear the session.

## Prerequisites

- [Expo Go](https://expo.dev/go) (or a custom dev build) on a device/emulator.
- An Authdog environment and public key (`pk_…`).

## Configure

1. Set your public key — either edit `PUBLIC_KEY` in `App.tsx` or export
   `EXPO_PUBLIC_PK_AUTHDOG` before starting.
2. **Deep link:** `app.json` declares `"scheme": "authdogdemo"`. The app passes
   `authdogdemo://callback` as the redirect URL, so you must register
   `authdogdemo://callback` as an **allowed redirect URI** in the Authdog
   dashboard for this environment. Without it the identity server will refuse to
   return to the app.

## Run

From the repo root (installs the workspace first):

```bash
bun install
```

Then:

```bash
cd examples/react-native && bun run dev
# or, via moon, from the repo root:
moon run react-native-app:dev
```

Scan the QR code with Expo Go, or press `i` / `a` for the iOS / Android
simulator.

## Notes

- The token is stored via `expo-secure-store` (Keychain / Keystore), so it is
  encrypted at rest and survives restarts. The in‑memory default (`inMemoryStorage`)
  is fine for tests but loses the token on restart.
- The hosted flow opens in the **system browser** (not an in‑app webview) and
  returns to the app through the registered deep link.

## Security

- The identity host is derived from the validated public‑key payload, which is
  constrained to a trusted‑host allowlist — a crafted key cannot point the login
  flow at an attacker‑controlled origin.
- `useAuthz` / client‑side permission checks are **presentational only**; every
  protected operation must be enforced on your server.
