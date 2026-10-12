# Implementation Plan: SDK API Parity & Completeness

**Branch**: `002-api-parity` | **Date**: 2026-10-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-api-parity/spec.md`

## Summary

Close wire-level gaps between Authdog **identity host** APIs and web-sdk **language cores**, delivered in **ten waves**. Wave 001 (separate spec) already made eight integrations discoverable; this program adds shared clients for billing, account self-service, browser ergonomics, mobile parity, UI wiring, server-side authz eval, optional headless auth and GraphQL, and a explicit management API boundary. Implementation is **cores first**, framework adapters second; additive Changesets required.

## Technical Context

**Language/Version**: TypeScript 5.9 on Bun `>= 1.2.15`; Node `>= 20.17.0`. Polyglot: Python 3.11+, Go 1.22+, Rust 2021, Java/Kotlin per existing packages, Swift/Android/Flutter/Dart per mobile packages.

**Primary Dependencies**: `@authdog/node-commons` as TS reference; platform-next identity app for route inventory; optional cross-repo OpenAPI pins from `platform-next/specs/*` for drift detection.

**Storage**: N/A. Clients are stateless HTTP wrappers; tokens remain in existing session stores.

**Testing**: Vitest (TS), native test runners per moon project; mocked `fetch`/HTTP with JSON pins under `specs/002-api-parity/contracts/pins/`. Contract gate script in CI (to be added in Wave 1 tasks).

**Target Platform**: All published `@authdog/*` and sibling PyPI/crates/Maven packages listed in root README Tier-1 table.

**Project Type**: Polyglot monorepo of framework-native SDKs + shared language cores.

**Performance Goals**: N/A for HTTP client wrappers; no extra userinfo round-trips in middleware unless opt-in (unchanged).

**Constraints**: Preserve `authdog-session`, OIDC userinfo envelope (`meta.code === 200`), identity-host allowlist. Server-only eval modules must not ship in `/client` bundles. Management CRUD not mounted on framework middleware.

**Scale/Scope**: ~10 API groups × ~15 language cores; ten waves; see [contracts/waves.md](./contracts/waves.md).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Result |
| --- | --- | --- |
| I. Framework-Native Packages | New logic in language cores; adapters re-export. No duplicated allowlist in each framework. | Pass |
| II. Shared Session Protocol | No new cookie or token transport. Account APIs use Bearer from existing session. attachSession still non-throwing. | Pass |
| III. Client/Server Boundary | AuthZEN / `adenv_` feature-flag eval server-only. Browser gets identity REST with user JWT only. | Pass |
| IV. Published API Compatibility | Additive exports → Changesets (minor). No breaking cookie/userinfo without major. | Pass (requires Changesets per wave) |
| V. Verified, Scoped Changes | Each wave updates tests + matrix; scoped to listed packages. | Pass |

Post-design re-check: **Pass**. Wave 10 optional `@authdog/management` is a separate package with its own entry points, not mixed into Express/Vue client bundles.

## Project Structure

### Documentation (this feature)

```text
specs/002-api-parity/
├── plan.md                 # this file
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── waves.md            # ten-wave roadmap
│   ├── identity-api-inventory.md
│   ├── management-sdk-boundary.md
│   ├── parity-matrix.md
│   └── pins/
│       └── billing-plans-response.json
└── tasks.md                # /speckit-tasks (not created by plan)
```

### Source Code (repository root)

```text
packages/node-commons/src/          # billing.ts (exists), account.ts (new), eval (new, server)
packages/javascript/src/client.ts     # account + billing namespaces
packages/python/src/authdog/          # billing.py, account.py
packages/go/                          # billing.go, account.go
packages/rust/core/src/               # billing.rs, account.rs
packages/java/ ... packages/ios/ ...  # per-wave ports
packages/react-elements/              # wiring docs / optional adapters
scripts/                              # parity-matrix-check (Wave 1)
```

**Structure Decision**: All identity HTTP clients live in language **cores**; framework packages depend on cores unchanged except optional examples.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| Ten waves vs one PR | Surface area spans 15+ packages | Single PR unreviewable and violates scoped-change principle |
| Optional Wave 9 GraphQL | Hosted account uses edge GraphQL | REST-only duplicates server evolution unless GraphQL client is shared |
| Optional Wave 10 management package | Some apps want OpenAPI client | Bolting `/v1` into `@authdog/express` breaks client/server boundary |

## Wave Overview

Detailed acceptance criteria per wave: [contracts/waves.md](./contracts/waves.md).

| Wave | Title |
| --- | --- |
| 1 | Inventory, pins, parity matrix CI |
| 2 | Billing polyglot |
| 3 | Account REST in node-commons |
| 4 | Account polyglot + javascript/react |
| 5 | Mobile & desktop clients |
| 6 | React Elements wiring |
| 7 | AuthZEN & feature-flag eval (server) |
| 8 | Headless auth APIs (optional P2) |
| 9 | Identity GraphQL edge (optional) |
| 10 | Management API boundary / optional package |
