# @authdog/remix-node

## 0.0.14

### Patch Changes

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

- Updated dependencies [01eee99]
  - @authdog/node-commons@0.1.0

## 0.0.13

### Patch Changes

- 624984c: Prettify

## 0.0.12

### Patch Changes

- 1dcfb03: cleanup remix package structure, isolate client

## 0.0.11

### Patch Changes

- 3730c31: add logout loader for remix

## 0.0.10

### Patch Changes

- 3d56a5d: handling auth session in remix sdk

## 0.0.9

### Patch Changes

- Updated dependencies [20ae693]
  - @authdog/node-commons@0.0.22

## 0.0.8

### Patch Changes

- c81dc4f: adding signin uri to loader response

## 0.0.7

### Patch Changes

- 30ffbd9: cleanup, prettify
- Updated dependencies [30ffbd9]
  - @authdog/node-commons@0.0.21

## 0.0.6

### Patch Changes

- fae875f: general cleanup
- Updated dependencies [fae875f]
  - @authdog/node-commons@0.0.20

## 0.0.5

### Patch Changes

- Updated dependencies [6998828]
  - @authdog/node-commons@0.0.19

## 0.0.4

### Patch Changes

- 2a116a9: define AuthdogProvider as part of remix-node package
- Updated dependencies [2a116a9]
  - @authdog/node-commons@0.0.18

## 0.0.3

### Patch Changes

- 7544676: isolate packages
- Updated dependencies [7544676]
  - @authdog/node-commons@0.0.17

## 0.0.2

### Patch Changes

- c73c606: fix tsup config
