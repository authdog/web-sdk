# Identity API Inventory (SDK scope)

Reference implementation: platform-next `apps/identity` (`setupGeneral.ts`, `setupAuthbase.ts`). Paths are relative to **identity host** (`identityHost` from public key).

## Tier P0 — Session & OIDC (implemented in cores today)

| Method | Path | Auth | SDK module |
| --- | --- | --- | --- |
| GET | `/oidc/{environmentId}/authorize` | none (redirect) | session builders |
| GET | `/oidc/{environmentId}/userinfo` | Bearer | `fetchUserData` / identity |
| — | `authdog-session` cookie | cookie | server adapters |
| — | `/signin/{environmentId}` | hosted link | `buildSigninUrl` (JS) |

## Tier P0 — Billing (TS only today → Wave 2 polyglot)

| Method | Path | Auth | SDK |
| --- | --- | --- | --- |
| GET | `/billing/{environmentId}/plans?for=user\|org` | none | `listBillingPlans` |
| GET | `/billing/{environmentId}/subscription` | Bearer | `getBillingSubscription` |
| POST | `/billing/{environmentId}/subscriptions` | Bearer | `createBillingSubscription` |
| POST | `/billing/{environmentId}/subscriptions/cancel` | Bearer | `cancelBillingSubscription` |

## Tier P1 — Account & sessions (Wave 3–4)

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/v1/session/check` | Bearer/cookie | Session validity |
| GET | `/api/v1/sessions` | Bearer | List sessions |
| POST | `/api/v1/sessions/revoke` | Bearer | Revoke session |
| GET | `/api/v1/user-sessions` | Bearer | User session list |
| GET | `/api/v1/devices` | Bearer | List devices |
| POST | `/api/v1/devices/revoke` | Bearer | Revoke device |
| GET | `/api/v1/connected-apps` | Bearer | OAuth connections |
| POST | `/api/v1/connected-apps/revoke` | Bearer | Revoke connection |
| POST | `/api/v1/account/{environmentId}/password` | Bearer | Change password |
| POST | `/api/v1/account/delete` | Bearer | Delete account |
| POST | `/api/v1/account/signout` | Bearer | Identity signout |

## Tier P1 — Hosted account UI (SDK link only)

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/account/{environmentId}` | Hosted; react-elements documents vs embedded `UserProfile` |

## Tier P2 — Headless auth (Wave 8, optional)

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/v1/magic-link/request`, `…/verify` | Rate limits |
| POST | `/api/v1/email-otp/request`, `…/verify` | |
| POST | `/api/v1/sms-otp/request`, `…/verify` | |
| POST | `/api/v1/signin/email-password`, `…/signup/email-password` | |
| GET | `/api/v1/sso/discover` | Enterprise SSO |

## Tier P2 — GraphQL edge (Wave 9, optional)

| Method | Path | Notes |
| --- | --- | --- |
| GET/POST | `/edge/{environmentId}/graphql` | Hosted account data |
| GET/POST | `/graphql` | Env resolved from request |

## Tier out — Not app SDK

| Area | Examples |
| --- | --- |
| CLI OAuth | `/api/v1/cli/oauth/*` |
| Admin portal | `/portal`, `/management` HTML |
| Telemetry ingest | `/api/v1/telemetry/metrics` (optional future) |
| Impersonation | `/api/v1/identity/{environmentId}/impersonate` (admin) |

## Eval APIs (server SDK, Wave 7)

Hosted on API origin, not identity host:

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/access/v1/evaluation` (AuthZEN) | Bearer / per spec |
| POST | `/feature-flags/v1/evaluate` | Environment secret |

See [management-sdk-boundary.md](./management-sdk-boundary.md) for `/v1/*` admin CRUD.
