# Ten-Wave Implementation Roadmap

Each wave ends with matrix updates and (when code ships) Changesets for touched publishable packages.

## Wave 1 — Inventory, pins, parity matrix CI

**Deliverables**

- `identity-api-inventory.md`, `management-sdk-boundary.md`, `parity-matrix.md`
- `pins/*.json` for billing (+ stub for sessions when Wave 3 starts)
- `scripts/check-parity-matrix.ts` (or moon task) failing on P0 `no` for Tier-1 cores
- Link from root README “API coverage” to inventory

**Exit criteria**: Matrix baseline committed; CI gate runs; no code change required in packages yet.

---

## Wave 2 — Billing polyglot

**Deliverables**

- Python, Go, Rust core, Java, Kotlin: four billing functions matching node-commons URLs
- Tests using `pins/billing-plans-response.json`
- Package README rows for billing

**Exit criteria**: API group `billing` = `yes` for all Tier-1 cores in matrix.

---

## Wave 3 — Account REST in `@authdog/node-commons`

**Deliverables**

- `account.ts` (sessions, devices, connected apps, password, delete, signout, session check)
- Vitest with mocked fetch; pins for session list envelope
- Export from `index.ts`

**Exit criteria**: P1 account groups `yes` for `node-commons` only.

---

## Wave 4 — Account polyglot + javascript/react

**Deliverables**

- Port account module to Python, Go, Rust, Java, Kotlin
- `@authdog/javascript`: `client.account.*`
- `@authdog/react`: hooks or documented client usage
- Electron/Tauri: parity with javascript client surface

**Exit criteria**: P1 account groups `yes` for Tier-1 cores + javascript.

---

## Wave 5 — Mobile & desktop completeness

**Deliverables**

- iOS, Android, Flutter, React Native: billing + account (where token model supports)
- Sign-up / authorize URL parity documented
- Matrix mobile rows updated

**Exit criteria**: Mobile Tier-2 cores show `yes` for P0 billing and P1 account OR documented `na` with rationale.

---

## Wave 6 — React Elements wiring

**Deliverables**

- Example app: UserProfile + billing checkout + session revoke via javascript client
- Storybook “wired” story or adapter doc under react-elements
- No breaking changes to `UserProfileProps`

**Exit criteria**: SC-003 from spec.md satisfied; quickstart section 6 passes manually once.

---

## Wave 7 — Authorization & entitlements (server)

**Deliverables**

- Server-only eval helpers (AuthZEN evaluation, feature-flag evaluate)
- BFF example + update `useAuthz` docs in Vue/RN README
- Pins for eval request/response samples

**Exit criteria**: Matrix row `auth-eval-server` = `yes` for node-commons + at least Go or Python; client bundles clean per quickstart §7.

---

## Wave 8 — Headless authentication (optional P2)

**Deliverables** (if product approves)

- TS core `headless-auth.ts`: magic-link, OTP, email-password request/verify
- Propagate to javascript + one polyglot
- Security/rate-limit documentation

**Exit criteria**: Matrix P2 headless groups `yes` or wave marked waived in research.md.

---

## Wave 9 — Identity GraphQL edge (optional)

**Deliverables** (if REST duplication unacceptable)

- Minimal GraphQL client for `/edge/{environmentId}/graphql` or `/graphql`
- TS + javascript only initially
- Document REST as default

**Exit criteria**: Either wave waived with “REST only” decision recorded, or matrix `graphql-edge` = `yes` for TS.

---

## Wave 10 — Management API boundary

**Deliverables**

- Finalize `management-sdk-boundary.md` with explicit in/out lists
- **Option A (default)**: Link CLI OpenAPI codegen; no new npm package
- **Option B**: Scaffold `@authdog/management` with PAT auth + 5–10 pinned operations
- Cross-check Terraform provider scope

**Exit criteria**: SC-006 satisfied; decision record in research.md; no PAT helpers in browser exports.
