# @authdog/vue

## 0.3.1

### Patch Changes

- bddce7d: Harden security
- Updated dependencies [bddce7d]
  - @authdog/node-commons@0.3.1

## 0.3.0

### Minor Changes

- ac11fae: Cleanup packages

### Patch Changes

- Updated dependencies [ac11fae]
  - @authdog/node-commons@0.3.0

## 0.2.0

### Minor Changes

- a4ce926: Update versions

### Patch Changes

- Updated dependencies [a4ce926]
  - @authdog/node-commons@0.2.0

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

### Patch Changes

- Updated dependencies [01eee99]
  - @authdog/node-commons@0.1.0

## 0.0.2

### Patch Changes

- 624984c: Prettify

## 0.0.1

### Patch Changes

- c526e7c: Init package
- 3f3ffb2: Init vue integration
- 4c1c143: Scaffold vue integration
