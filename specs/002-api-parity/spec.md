# Feature Specification: SDK API Parity & Completeness

**Feature Branch**: `002-api-parity`

**Created**: 2026-10-12

**Status**: Draft

**Input**: User description: "Extend SDK parity and completeness against Authdog API across ten implementation waves."

**Related**: [001-sdk-parity](../001-sdk-parity/spec.md) closed catalog/sample gaps; this feature closes **wire-level** gaps between language cores and the Authdog **identity host** (and bounded eval APIs).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Same billing APIs in every core (Priority: P1)

An app developer using Python, Go, or Rust expects the same identity billing calls that TypeScript already exposes (`listPlans`, subscription read/create/cancel) without reimplementing URLs or allowlist logic.

**Why this priority**: Billing is the only non-OIDC identity API already shipped in `@authdog/node-commons`; polyglot parity is the fastest measurable win.

**Independent Test**: From each Tier-1 core, call `listPlans` against mocked HTTP using pinned fixture JSON; assert allowlist rejects untrusted hosts.

**Acceptance Scenarios**:

1. **Given** a trusted identity host and environment id, **When** the developer lists plans, **Then** the client hits `GET /billing/{environmentId}/plans` and returns typed plans + publishable key.
2. **Given** a public key whose identity host is not allowlisted, **When** any billing helper runs, **Then** it fails before sending the token or request.

---

### User Story 2 - Account self-service from SDKs (Priority: P1)

A signed-in user managing their account in a custom app (not only hosted `/account`) can list/revoke sessions and devices, manage connected apps, change password, delete account, and sign out via identity REST APIs.

**Why this priority**: Platform identity app exposes `/api/v1/*` account routes; SDKs today implement none of them.

**Independent Test**: Node `account` module tests with mocked fetch cover sessions list + revoke; matrix marks P1 account group ✓ for node-commons.

**Acceptance Scenarios**:

1. **Given** a valid bearer session token, **When** the developer lists sessions, **Then** the SDK calls the identity sessions API and returns typed session rows.
2. **Given** revoke succeeds, **When** the developer lists sessions again, **Then** the revoked session is absent (mocked contract).

---

### User Story 3 - Browser client parity (Priority: P1)

A SPA author using `@authdog/javascript` gets `account` and `billing` namespaces on `createAuthdogClient`, matching documented identity APIs.

**Why this priority**: JavaScript is the reference public client; other UI stacks compose it or mirror its surface.

**Independent Test**: Unit tests on `createAuthdogClient` mock identity host; no live Authdog tenant required.

**Acceptance Scenarios**:

1. **Given** `createAuthdogClient({ publicKey })`, **When** the developer calls `client.billing.listPlans()`, **Then** behavior matches `@authdog/node-commons` billing helpers.
2. **Given** no token, **When** the developer calls `client.account.listSessions()`, **Then** the client returns empty or null without throwing (consistent with `getUser`).

---

### User Story 4 - Documented authorization (Priority: P2)

A full-stack developer wiring UI permission hints uses a documented server pattern (BFF + AuthZEN or feature-flag evaluate); client `useAuthz` remains presentational only.

**Why this priority**: Avoids fake `/api/permissions` defaults implying Authdog wired authz.

**Independent Test**: Example BFF route documented in quickstart; eval helpers unit-tested with pins.

**Acceptance Scenarios**:

1. **Given** server-side credentials, **When** the BFF evaluates access, **Then** the browser receives a permission list for UI only.
2. **Given** a client calling `hasPermission`, **When** an attacker bypasses the UI, **Then** protected server routes still enforce authorization independently.

---

### User Story 5 - Parity matrix stays honest (Priority: P1)

A maintainer changing identity routes in platform-next or adding SDK methods updates a checked parity matrix so drift is visible in CI.

**Why this priority**: Without inventory + matrix, completeness regressions recur silently.

**Independent Test**: CI script fails if P0 matrix cell is marked ✗ for a published Tier-1 core without an approved exception file.

**Acceptance Scenarios**:

1. **Given** the parity matrix in `specs/002-api-parity/contracts/`, **When** CI runs, **Then** P0 rows must all be ✓ for node-commons, python, go, rust/core, java, kotlin, javascript.
2. **Given** a new identity route added in platform-next, **When** pins break, **Then** web-sdk PR must update pins or matrix tier.

---

### Edge Cases

- Missing or expired bearer token: account APIs return structured errors; browser client methods degrade predictably (documented per method).
- Identity host unreachable: helpers throw or return errors; session middleware behavior unchanged (still non-throwing attach).
- Org-scoped billing (`for=org`): supported where identity billing handler supports it; documented when user-only.
- Management `/v1/*` CRUD: out of scope for framework SDKs unless Wave 10 opens `@authdog/management`.
- GraphQL edge: optional Wave 9; REST remains canonical default.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The feature MUST maintain an identity API inventory aligned with platform-next identity app routes (OIDC, billing, account REST, optional tiers).
- **FR-002**: Tier-1 language cores MUST implement P0 groups: public key, allowlist, OIDC userinfo (existing), billing four endpoints.
- **FR-003**: `@authdog/node-commons` MUST implement P1 account REST helpers with allowlisted fetch and unit tests.
- **FR-004**: `@authdog/javascript` MUST expose `billing` and `account` on `createAuthdogClient` (additive).
- **FR-005**: Polyglot cores (Python, Go, Rust, Java, Kotlin, mobile) MUST reach matrix targets per wave plan in [contracts/waves.md](./contracts/waves.md).
- **FR-006**: `@authdog/react-elements` MUST document or provide adapters wiring `UserProfile` to identity clients without breaking presentational props.
- **FR-007**: Server eval helpers for AuthZEN and feature-flag evaluate MUST NOT be importable from browser client entry points.
- **FR-008**: All new HTTP from SDKs MUST use centralized identity-host allowlisting equivalent to existing cores.
- **FR-009**: Additive publishable API changes MUST ship with Changesets; session cookie name and userinfo success semantics MUST NOT change.
- **FR-010**: Management API CRUD MUST remain outside framework adapters unless Wave 10 explicitly adds a separate management package.

### Key Entities

- **API group**: A named set of identity endpoints (e.g. billing, account-sessions) with tier P0/P1/P2/out.
- **Language core**: Shared library per language (`node-commons`, `authdog` Python module, `authdog-core`, etc.).
- **Parity cell**: Matrix intersection of core × API group with status ✓, ✗, N/A.
- **Contract pin**: Frozen JSON fixture or OpenAPI fragment used in unit tests.
- **Implementation wave**: One of ten ordered delivery slices in [contracts/waves.md](./contracts/waves.md).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: P0 API groups show ✓ for all Tier-1 cores in the parity matrix.
- **SC-002**: P1 account REST shows ✓ for node-commons, javascript, Python, Go, and rust/core by end of Wave 4.
- **SC-003**: At least one example app demonstrates billing checkout + session revoke using SDK clients only.
- **SC-004**: CI includes a matrix or pin gate that fails on undocumented P0 regression.
- **SC-005**: README package tables link to identity API inventory for Tier-1 packages.
- **SC-006**: Zero framework SDK documents management PAT operations as part of `@authdog/express` / `@authdog/vue` etc.

## Assumptions

- Source of truth for identity routes is platform-next `apps/identity` (e.g. `setupGeneral.ts`, `setupAuthbase.ts`).
- Management OpenAPI lives in platform-next `services/api` (`GET /v1/openapi`); CLI/Terraform own most of it.
- 001-sdk-parity catalog work is complete; this feature adds publishable client surface.
- Headless sign-in APIs (magic link, OTP) are Wave 8 / P2 and may be deferred by product decision recorded in research.md.
