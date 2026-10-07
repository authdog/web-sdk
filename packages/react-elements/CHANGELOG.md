# @authdog/react-elements

## 0.4.1

### Patch Changes

- 5d40fb4: Extend components list

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

## 0.0.50

### Patch Changes

- b2a7971: Adding loader avatar

## 0.0.49

### Patch Changes

- 8d39e01: Fix display avatar menu

## 0.0.48

### Patch Changes

- 1be5751: Fix cursor nav elements
- 3c9f2fc: Enhance display dropdown avatar

## 0.0.47

### Patch Changes

- f71033d: Make avatar links customizable

## 0.0.46

### Patch Changes

- 25cc8b1: Enhance customization navbar logo

## 0.0.45

### Patch Changes

- 7f8b341: Improve navbar

## 0.0.44

### Patch Changes

- cf3409c: add navbar with logo story

## 0.0.43

### Patch Changes

- 648d361: enhance navbar element
- 21efe8c: Improve navbar display

## 0.0.42

### Patch Changes

- 1a0e603: Fix syntax

## 0.0.41

### Patch Changes

- 0354ca1: Minor syntax fix

## 0.0.40

### Patch Changes

- 624984c: Prettify

## 0.0.39

### Patch Changes

- b554d49: update profile component

## 0.0.38

### Patch Changes

- a7f7bdd: additional changes to modal setup

## 0.0.37

### Patch Changes

- fdb4af0: address shift behavior on profile trigger

## 0.0.36

### Patch Changes

- 7d2c857: enhance email management
- 6f3aa8c: fix display sign out

## 0.0.35

### Patch Changes

- 5248882: enhance verified email ui for user profile

## 0.0.34

### Patch Changes

- 2d78aba: scaffold tabs security and preferences in userprofile

## 0.0.33

### Patch Changes

- 94640cc: add user dropdown component

## 0.0.32

### Patch Changes

- ef53b12: fix text user-profile on dark mode

## 0.0.31

### Patch Changes

- 829c52a: fix padding user-profile

## 0.0.30

### Patch Changes

- 732d717: add totp validator component

## 0.0.29

### Patch Changes

- 83c8f6c: add client-only to react-elements

## 0.0.28

### Patch Changes

- 3d56a5d: handling auth session in remix sdk

## 0.0.27

### Patch Changes

- df1cbf4: handle photos, user payload in navbar and profile

## 0.0.26

### Patch Changes

- 799fb2e: display email/connected account in profile

## 0.0.25

### Patch Changes

- 1720b55: handle authenticated action

## 0.0.24

### Patch Changes

- 20ae693: handle user in navbar

## 0.0.23

### Patch Changes

- ad71221: fix authentication nextjs sample

## 0.0.22

### Patch Changes

- 5f63070: fix hydration icons

## 0.0.21

### Patch Changes

- 8283049: cleanup default options react-elements

## 0.0.20

### Patch Changes

- 9abef65: fix hydration

## 0.0.19

### Patch Changes

- bfbbef5: add placeholder-alert to exports

## 0.0.18

### Patch Changes

- 7fae1dc: define placeholder alert component

## 0.0.17

### Patch Changes

- 9ec3af6: adding basic navigation home onto navbar

## 0.0.16

### Patch Changes

- 6a9cb4f: cleanup navbar, handle router action via props

## 0.0.15

### Patch Changes

- 056c6b4: rollback dependencies react

## 0.0.14

### Patch Changes

- b8c6d45: add profile element, cleanup stories ladle

## 0.0.13

### Patch Changes

- eeca7af: minor changes, syntax/settings enhancements

## 0.0.12

### Patch Changes

- bffdb42: cleanup

## 0.0.12

### Patch Changes

- a897a13: add navbar to remix app

## 0.0.11

### Patch Changes

- 3734ad0: prototype navbar with shadcn/v0

## 0.0.10

### Patch Changes

- 5e3fbd8: add postcss cli to generate css bundle to be used in consumer app

## 0.0.9

### Patch Changes

- 352d31e: replace css filepath

## 0.0.8

### Patch Changes

- 57c41ef: add publish config

## 0.0.8

### Patch Changes

- 30fdfe6: bump

## 0.0.7

### Patch Changes

- 6c41c4d: bump version

## 0.0.2

### Patch Changes

- d6ac8e7: ensure all exports are available

## 0.0.1

### Patch Changes

- 8d5f1a9: adjust config to export tailwinded components and style
