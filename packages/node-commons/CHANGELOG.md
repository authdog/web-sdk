# @authdog/node-commons

## 0.3.1

### Patch Changes

- bddce7d: Harden security

## 0.3.0

### Minor Changes

- ac11fae: Cleanup packages

## 0.2.0

### Minor Changes

- a4ce926: Update versions

## 0.1.0

### Minor Changes

- 01eee99: Security and correctness hardening across the authentication surface.

  **`@authdog/node-commons`**

  - `validateAndParsePublicKey` now validates the decoded payload and enforces an
    allowlist (`assertTrustedIdentityHost`): the identity host must be `https:`,
    must match a trusted Authdog domain (configurable via
    `AUTHDOG_ALLOWED_IDENTITY_HOSTS`), and may not be a private/loopback address.
    This closes an SSRF / token-exfiltration / auth-bypass chain where a crafted
    public key could redirect the bearer token to an attacker-controlled host.
  - `fetchUserData` validates the host before sending the token and exposes
    `isAuthenticatedUserInfo` so callers only trust `meta.code === 200` responses.
  - `parseCookies` now splits on the first `=` and URL-decodes values (previously
    truncated tokens containing `=`).
  - New `sanitizeRedirectPath` helper for safe, same-origin redirects.

  **`@authdog/nextjs-app`**

  - Server session cookies now set `secure` (in production) and `sameSite=lax`;
    logout reliably clears them. Middleware gates auth on `isAuthenticatedUserInfo`.
  - The `?token=` value is validated as a JWT before being stored. New
    `clearAuthdogSession()` client helper for logout. Removed token polling in
    favor of event-driven sync. `browserCookiesOptions` no longer advertises the
    no-op `httpOnly` flag and now sets `secure`/`sameSite`.

  **`@authdog/react-elements`** (breaking)

  - `Navbar` now requires `identityHost` and `environmentId` (the hardcoded
    staging defaults were removed). Hardened the user-dropdown against
    `javascript:` URIs and tab-nabbing, replaced the fragile TOTP clipboard read
    with a native paste handler, and guarded user-profile rendering.

  **`@authdog/vue`** (breaking)

  - Fixed the provider context so reactive auth state propagates; `useSession`
    returns reactive refs. Token is validated before storage and cleared on
    sign-out. `useAuthz` endpoint is configurable and documented as presentational
    only. Logout sanitizes `redirect_uri` and the cleared cookie is `Secure`.

  **`@authdog/remix-node`**

  - Cookie-based auth now requires a successful `meta.code`. Removed the
    client-side `localStorage` token, dropped the invalid `*` + credentials CORS
    headers, sanitized `identityDevAction` redirects, and guarded it from running
    in production.

## 0.0.22

### Patch Changes

- 20ae693: handle user in navbar

## 0.0.21

### Patch Changes

- 30ffbd9: cleanup, prettify

## 0.0.20

### Patch Changes

- fae875f: general cleanup

## 0.0.19

### Patch Changes

- 6998828: cleanup build

## 0.0.18

### Patch Changes

- 2a116a9: define AuthdogProvider as part of remix-node package

## 0.0.17

### Patch Changes

- 7544676: isolate packages

## 0.0.16

### Patch Changes

- 24696d9: testing changeset

## 0.0.15

### Patch Changes

- 12e6468: cleanup

## 0.0.14

### Patch Changes

- 05a2c82: changeset

## 0.0.13

### Patch Changes

- 9066949: cleanup
- a4a7e84: bumping

## 0.0.12

### Patch Changes

- 0cbd724: remove region

## 0.0.11

### Patch Changes

- c16bd33: remove region

## 0.0.10

### Patch Changes

- 1890c50: test changeset

## 0.0.9

### Patch Changes

- cfe0f7c: setup
- 2f3f067: cleanup
- 3bc585a: add region to public key
