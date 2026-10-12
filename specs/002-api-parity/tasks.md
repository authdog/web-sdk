# Tasks: SDK API Parity & Completeness

**Input**: Design documents from `/specs/002-api-parity/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Unit/contract tests are included where spec acceptance criteria require mocked HTTP (US1, US2, US4). No TDD-only gate.

**Organization**: Phases follow spec user stories (US1–US5) plus polish for waves 5–10 from [contracts/waves.md](./contracts/waves.md).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks in same batch)
- **[Story]**: US1–US5 per [spec.md](./spec.md)

---

## Phase 1: Setup (Wave 1 — inventory & tooling)

**Purpose**: Finish Wave 1 deliverables not yet in repo tooling

- [x] T001 Create `scripts/check-parity-matrix.ts` to parse `specs/002-api-parity/contracts/parity-matrix.md` and exit non-zero when any **P0** row is `no` for Tier-1 cores (`node-commons`, `javascript`, `python`, `go`, `rust-core`, `java`, `kotlin`)
- [x] T002 Register a moon task (root `moon.yml` or `scripts/moon.yml`) that runs `bun run scripts/check-parity-matrix.ts`
- [x] T003 [P] Add root `README.md` subsection linking to `specs/002-api-parity/contracts/identity-api-inventory.md` and `specs/002-api-parity/contracts/parity-matrix.md`
- [x] T004 [P] Add `specs/002-api-parity/contracts/pins/sessions-list-response.json` stub aligned with identity `sessionsList` handler shape for Wave 3 tests

**Checkpoint**: Wave 1 exit criteria from [contracts/waves.md](./contracts/waves.md) met except CI wiring (Phase 2)

---

## Phase 2: Foundational — User Story 5 (Priority: P1)

**Goal**: Parity matrix stays honest in CI ([spec.md](./spec.md) US5)

**Independent Test**: Run `bun run scripts/check-parity-matrix.ts` — fails until billing polyglot completes; passes once matrix matches reality or approved exceptions exist

- [x] T005 [US5] Add `.github/workflows/ci-parity-matrix.yml` running the parity matrix check on changes to `specs/002-api-parity/**` or `scripts/check-parity-matrix.ts`
- [x] T006 [US5] Document matrix exception waiver format (optional `exception` column rules per [data-model.md](./data-model.md)) in `specs/002-api-parity/contracts/parity-matrix.md`
- [x] T007 [US5] Cross-check `specs/002-api-parity/contracts/identity-api-inventory.md` paths against platform-next `apps/identity/src/busilog/setupGeneral.ts` and note drift in `specs/002-api-parity/research.md` if any

**Checkpoint**: CI gate live; P0 `no` cells block merge until implementation updates matrix

---

## Phase 3: User Story 1 — Billing polyglot (Priority: P1) 🎯 MVP

**Goal**: Same identity billing four endpoints in every Tier-1 core (Wave 2)

**Independent Test**: Each core’s billing tests mock HTTP and load `specs/002-api-parity/contracts/pins/billing-plans-response.json`; untrusted host fails before fetch

- [x] T008 [P] [US1] Add contract test in `packages/node-commons/src/billing.test.ts` asserting parsed body matches `specs/002-api-parity/contracts/pins/billing-plans-response.json` for `listBillingPlans`
- [x] T009 [P] [US1] Implement `packages/python/src/authdog/billing.py` (`list_plans`, `get_subscription`, `create_subscription`, `cancel_subscription`) using identity paths from [identity-api-inventory.md](./contracts/identity-api-inventory.md)
- [x] T010 [P] [US1] Add `packages/python/tests/test_billing.py` with allowlist rejection and pin fixture
- [x] T011 [P] [US1] Implement `packages/go/billing.go` and `packages/go/billing_test.go` mirroring node-commons URLs
- [x] T012 [P] [US1] Implement `packages/rust/core/src/billing.rs` and unit tests in `packages/rust/core/src/` (cargo test via moon)
- [x] T013 [P] [US1] Implement Java billing helpers in `packages/java/src/main/java/com/authdog/` (new `Billing.java` or extend `Identity.java`) with tests under `packages/java/src/test/java/com/authdog/`
- [x] T014 [P] [US1] Implement Kotlin billing in `packages/kotlin/src/main/kotlin/com/authdog/` with tests under `packages/kotlin/src/test/kotlin/`
- [x] T015 [US1] Export billing from Python package `packages/python/src/authdog/__init__.py` and document in `packages/python/README.md`
- [x] T016 [US1] Document billing in `packages/go/README.md`, `packages/rust/README.md`, `packages/java/README.md`, `packages/kotlin/README.md`
- [x] T017 [US1] Set API group `billing` to `yes` for all Tier-1 cores in `specs/002-api-parity/contracts/parity-matrix.md`
- [x] T018 [US1] Add Changesets under `.changeset/` for every publishable package touched in US1

**Checkpoint**: SC-001 billing portion satisfied; `moon run python:test go:test rust:test java:test kotlin:test node-commons:test` pass

---

## Phase 4: User Story 2 — Account REST (Priority: P1)

**Goal**: Identity account APIs in node-commons then Tier-1 polyglot (Waves 3–4)

**Independent Test**: `packages/node-commons/src/account.test.ts` mocks sessions list + revoke using `specs/002-api-parity/contracts/pins/sessions-list-response.json`

- [ ] T019 [US2] Implement `packages/node-commons/src/account.ts` for routes in [identity-api-inventory.md](./contracts/identity-api-inventory.md) Tier P1 (sessions, devices, connected-apps, password, delete, signout, session check) with `assertTrustedIdentityHost` on every request
- [ ] T020 [US2] Add `packages/node-commons/src/account.test.ts` with mocked `fetch` and pin fixtures
- [ ] T021 [US2] Export account helpers from `packages/node-commons/src/index.ts`
- [ ] T022 [P] [US2] Implement `packages/python/src/authdog/account.py` and `packages/python/tests/test_account.py`
- [ ] T023 [P] [US2] Implement `packages/go/account.go` and `packages/go/account_test.go`
- [ ] T024 [P] [US2] Implement `packages/rust/core/src/account.rs` and tests
- [ ] T025 [P] [US2] Implement Java account module under `packages/java/src/main/java/com/authdog/` with tests
- [ ] T026 [P] [US2] Implement Kotlin account module under `packages/kotlin/src/main/kotlin/com/authdog/` with tests
- [ ] T027 [US2] Update P1 account rows to `yes` for Tier-1 cores in `specs/002-api-parity/contracts/parity-matrix.md`
- [ ] T028 [US2] Add Changesets for node-commons and polyglot packages touched in US2

**Checkpoint**: SC-002 satisfied for node-commons, python, go, rust-core, java, kotlin

---

## Phase 5: User Story 3 — Browser client parity (Priority: P1)

**Goal**: `@authdog/javascript` and siblings expose `billing` + `account` (Wave 4)

**Independent Test**: `packages/javascript` tests mock identity host; `client.account.listSessions()` without token returns null/empty without throw (per spec)

- [ ] T029 [US3] Extend `packages/javascript/src/client.ts` with `account` namespace delegating to `@authdog/node-commons` account helpers
- [ ] T030 [US3] Update/add tests in `packages/javascript/src/client.test.ts` (or adjacent test file) for account + existing billing
- [ ] T031 [P] [US3] Document `client.billing` and `client.account` in `packages/javascript/README.md`
- [ ] T032 [P] [US3] Add React integration notes or thin hooks in `packages/react/src/hooks.ts` and `packages/react/README.md` referencing `createAuthdogClient`
- [ ] T033 [P] [US3] Align `packages/electron/src/client.ts` with javascript `billing`/`account` surface
- [ ] T034 [P] [US3] Align `packages/tauri/src/client.ts` with javascript `billing`/`account` surface
- [ ] T035 [US3] Set `javascript` matrix cells for account groups to `yes` in `specs/002-api-parity/contracts/parity-matrix.md`
- [ ] T036 [US3] Add Changesets for `@authdog/javascript`, `@authdog/react`, `@authdog/electron`, `@authdog/tauri` as applicable

**Checkpoint**: US3 acceptance scenarios pass in unit tests

---

## Phase 6: User Story 4 — Documented authorization (Priority: P2)

**Goal**: Server eval helpers + BFF pattern (Wave 7)

**Independent Test**: Eval unit tests use pins; client bundles do not import eval module (quickstart §7)

- [ ] T037 [US4] Add `packages/node-commons/src/eval.ts` with AuthZEN evaluation and `POST /feature-flags/v1/evaluate` helpers per [management-sdk-boundary.md](./contracts/management-sdk-boundary.md)
- [ ] T038 [US4] Add `packages/node-commons/src/eval.test.ts` with mocked responses
- [ ] T039 [US4] Restrict eval exports to server-safe entry (document in `packages/node-commons/package.json` `exports` and README; must not be re-exported from `packages/javascript/src/index.ts`)
- [ ] T040 [P] [US4] Port eval helper to `packages/python/src/authdog/eval.py` or `packages/go/eval.go` (one polyglot minimum per research.md)
- [ ] T041 [US4] Add BFF sample route (e.g. `examples/express/src/routes/permissions.ts` or new `examples/bff-authz/`) calling eval helper; document in `specs/002-api-parity/quickstart.md`
- [ ] T042 [P] [US4] Update `packages/vue/README.md` with BFF + `useAuthz({ permissionsUrl })` pattern
- [ ] T043 [P] [US4] Update `packages/react-native/README.md` with absolute URL BFF pattern for `useAuthz`
- [ ] T044 [US4] Mark `auth-eval-server` row `yes` for node-commons + one polyglot in `specs/002-api-parity/contracts/parity-matrix.md`
- [ ] T045 [US4] Add Changeset for `@authdog/node-commons` eval exports

**Checkpoint**: US4 acceptance scenarios documented; eval not in browser entry points

---

## Phase 7: Polish & waves 5–10 (cross-cutting)

**Purpose**: Mobile, UI wiring, optional tiers, management boundary, validation

### Wave 5 — Mobile & desktop

- [ ] T046 [P] Add billing + account to `packages/ios/Sources/Authdog/` with tests in `packages/ios/Tests/AuthdogTests/`
- [ ] T047 [P] Add billing + account to `packages/android/src/main/kotlin/com/authdog/android/` with tests in `packages/android/src/test/`
- [ ] T048 [P] Add billing + account to `packages/flutter/lib/` with tests under `packages/flutter/test/`
- [ ] T049 [P] Extend `packages/react-native/` with documented wrapper or hooks using same API names as `packages/javascript/src/client.ts`
- [ ] T050 Update mobile Tier-2 rows in `specs/002-api-parity/contracts/parity-matrix.md` (`yes` or documented `na`)

### Wave 6 — React Elements wiring

- [ ] T051 Extend `examples/javascript/` (or `examples/react-router/`) to demonstrate `PricingTable`/`CheckoutButton` + session revoke via `createAuthdogClient` from `packages/javascript/src/client.ts`
- [ ] T052 [P] Add wired `UserProfile` story or adapter section in `packages/react-elements/README.md` without breaking `packages/react-elements/src/components/core/user-profile.tsx` props
- [ ] T053 [P] Optional Storybook wired story under `packages/react-elements/src/stories/user-authentication/`

### Wave 8 — Headless auth (optional P2)

- [ ] T054 If product approves in `specs/002-api-parity/research.md`, implement `packages/node-commons/src/headless-auth.ts` and tests; else record **waived** in `specs/002-api-parity/research.md` and skip implementation

### Wave 9 — GraphQL edge (optional)

- [ ] T055 If REST-only decision stands, document **waived** in `specs/002-api-parity/research.md`; else add minimal client under `packages/node-commons/src/graphql-edge.ts` and javascript re-export

### Wave 10 — Management boundary

- [ ] T056 Finalize Option A vs B in `specs/002-api-parity/contracts/management-sdk-boundary.md` and `specs/002-api-parity/research.md`
- [ ] T057 If Option B: scaffold `packages/management/` with PAT client and ≤10 pinned operations; if Option A: add CLI doc link in root `README.md` only
- [ ] T058 Verify no framework README (`packages/express/README.md`, `packages/vue/README.md`, etc.) documents management PAT CRUD (SC-006)

### Closeout

- [ ] T059 [P] Add identity API inventory links to Tier-1 package READMEs listed in root `README.md` (SC-005)
- [ ] T060 Run validation steps in `specs/002-api-parity/quickstart.md` and fix gaps
- [ ] T061 [P] Ensure `bun run scripts/check-parity-matrix.ts` passes on final matrix state
- [ ] T062 Confirm all publishable changes have Changesets and `moon ci` / affected package tests pass

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1** → **Phase 2** (CI needs script from T001)
- **Phase 2** → **Phases 3–6** (matrix gate; may start US1 implementation in parallel if exceptions documented for interim P0 `no`)
- **Phase 3 (US1)** before **Phase 4 (US2)** recommended (shared pin/test patterns)
- **Phase 4 (US2)** before **Phase 5 (US3)** (javascript account depends on node-commons account)
- **Phase 6 (US4)** after Phase 4 (needs stable bearer token story)
- **Phase 7** after Phases 3–5 minimum (SC-003 needs US1+US3+example)

### User story dependencies

| Story | Depends on | Independent test |
| --- | --- | --- |
| US5 | Phase 1 | CI script + matrix file |
| US1 | US5 (soft), Phase 1 pins | Per-core billing tests + pin |
| US2 | US1 patterns | node-commons account tests |
| US3 | US2 node-commons | javascript client tests |
| US4 | US2 token model | eval tests + BFF example |

### Parallel opportunities

- **Phase 3**: T009–T014 polyglot billing in parallel after T008
- **Phase 4**: T022–T026 polyglot account in parallel after T019–T021
- **Phase 5**: T031–T034 in parallel after T029–T030
- **Phase 7**: T046–T049 mobile; T051–T053 UI; T059 README links

---

## Parallel example: User Story 1

```bash
# After T008, launch polyglot billing together:
moon run python:test   # T009–T010
moon run go:test       # T011
moon run rust:test     # T012
moon run java:test     # T013
moon run kotlin:test   # T014
```

---

## Implementation strategy

### MVP (minimum shippable increment)

1. Complete Phase 1 + Phase 2 (matrix CI)
2. Complete Phase 3 (US1 billing polyglot) + T017 matrix update
3. Stop and validate: `check-parity-matrix` passes for billing row; Tier-1 billing tests green

### Incremental delivery

1. MVP → Phase 4 (account) → Phase 5 (javascript) → demo example (T051)
2. Phase 6 (authz) as second release train
3. Phase 7 mobile/management as subsequent releases

### Suggested PR slicing

| PR | Tasks |
| --- | --- |
| 1 | T001–T007 (Wave 1 + US5) |
| 2 | T008–T018 (US1) |
| 3 | T019–T028 (US2) |
| 4 | T029–T036 (US3) |
| 5 | T037–T045 (US4) |
| 6+ | T046–T062 (polish / waves 5–10) |

---

## Notes

- Parity cell status MUST use `yes` / `no` / `na` only (see [data-model.md](./data-model.md)); update matrix in the same PR as code
- All new identity HTTP MUST use language-core allowlist equivalent to `assertTrustedIdentityHost` in `packages/node-commons/src/public-key.ts`
- Do not add management `/v1/*` CRUD to framework middleware packages (FR-010)
- Optional waves 8–9: default **waived** unless T054/T055 explicitly implemented
