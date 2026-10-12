# Research: SDK API Parity

## Decision: Two API planes

**Decision**: SDK completeness targets the **identity host** (derived from `pk_…` + user bearer JWT). The **Management API** (`/v1/*` on the API worker) stays out of framework SDKs except optional Wave 10 package.

**Rationale**: Constitution III separates app credentials from tenant admin PATs. Identity routes (`/oidc/…`, `/billing/…`, `/api/v1/account/…`) match how apps integrate today. Management has 100+ OpenAPI operations owned by CLI/Terraform/MCP.

**Alternatives considered**: Generate full OpenAPI client into every adapter — rejected (bundle size, auth model, boundary violation).

---

## Decision: REST canonical for account data

**Decision**: P1 account operations use identity **REST** (`/api/v1/sessions`, `/api/v1/devices`, etc.). GraphQL edge is Wave 9 optional.

**Rationale**: REST paths are stable, easy to pin in polyglot tests. GraphQL edge serves hosted account; duplicating both in every core doubles maintenance.

**Alternatives considered**: GraphQL-only SDK transport — rejected for Wave 3–4 scope.

---

## Decision: Billing URL shape

**Decision**: SDKs continue using identity paths ` /billing/{environmentId}/…` as implemented in `@authdog/node-commons` (not management `/v1/tenants/…/billing/plans`).

**Rationale**: Consumer checkout uses identity host with user JWT; management billing routes are admin CRUD with PAT.

**Alternatives considered**: Unify on management paths — rejected for public apps without tenant token.

---

## Decision: Client authorization pattern

**Decision**: Keep `useAuthz` presentational. Document BFF + **AuthZEN** `/access/v1/evaluation` (server). Feature flags via `POST /feature-flags/v1/evaluate` with `adenv_` secret server-only.

**Rationale**: Matches existing Vue/RN warnings and platform-next route layout (eval apps outside `/v1` prefix).

**Alternatives considered**: Default `useAuthz` to identity host — no single permissions list endpoint exists for all tenants; would imply false security.

---

## Decision: Headless auth (Wave 8)

**Decision**: **Defer by default** (P2). Ship only if product accepts support burden for magic-link, email/SMS OTP, email-password APIs on identity host.

**Rationale**: Most SDK users use hosted `/signin` and OIDC redirect; headless expands compliance and rate-limit documentation surface.

**Alternatives considered**: Wave 8 mandatory — rejected until product sign-off; recorded as optional in waves.md.

---

## Decision: Org billing

**Decision**: Support `for=org` on `listPlans` wherever identity billing handler supports it (already in node-commons). Subscription create remains user-scoped until platform adds org subscription identity routes.

**Rationale**: Matches current identity billing handlers and react-elements user-level checkout.

**Alternatives considered**: Org subscription in Wave 2 — blocked on identity API availability; track in matrix as N/A until platform ships.

---

## Decision: Upstream drift detection

**Decision**: Pin JSON fixtures in web-sdk copied from platform-next identity handler samples; optional future job fetches `GET /v1/openapi` only for management boundary doc, not for app SDK codegen in Waves 1–7.

**Rationale**: Mirrors platform-next pattern (`openapi-sdk-config-pin.json` in specs/025).

**Alternatives considered**: Live integration tests against staging — optional manual quickstart only; CI stays mocked.

---

## Decision: Tier-1 language cores

**Decision**: P0/P1 gates apply to: `node-commons`, `javascript`, Python, Go, `rust/core`, Java, Kotlin. Other cores (PHP, Ruby, C#, mobile) follow in Waves 5+ with matrix tracking.

**Rationale**: README “Backend SDKs” table and CI moon projects prioritize these paths.

**Alternatives considered**: All 20+ packages same wave — rejected; violates scoped changes.

---

## Inventory cross-check (2026-10-12)

Identity P0/P1 routes in [contracts/identity-api-inventory.md](./contracts/identity-api-inventory.md) were verified against platform-next `apps/identity/src/busilog/setupGeneral.ts` (billing + account REST) at implementation kickoff. Drift should be caught via pins and manual re-check when identity app changes.
