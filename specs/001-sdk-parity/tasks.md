# Tasks: New SDK Parity

**Input**: Design documents from `/specs/001-sdk-parity/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No new test tasks. Existing package tests stay the verification check. Samples are type-checked.

**Organization**: Tasks are grouped by user story so each story can be implemented and checked on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Register the new samples in the existing moon and just tooling

- [x] T001 Register example project ids `hono-api`, `koa-api`, `elysia-api`, `react-router-app`, `nuxt-app`, `solid-app`, `javascript-app`, and `tauri-app` in `.moon/workspace.yml`
- [x] T002 Add `dev-hono`, `dev-koa`, `dev-elysia`, `dev-react-router`, `dev-nuxt`, `dev-solid`, `dev-javascript`, and `dev-tauri` recipes to `Justfile`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Confirm ignore rules already cover generated sample output

- [x] T003 Confirm `.gitignore` ignores `node_modules`, `dist`, `build`, and `.env` so new samples do not need a new ignore policy

**Checkpoint**: Tooling ids exist and sample artifacts stay untracked

---

## Phase 3: User Story 1 - Server integrations (Priority: P1) 🎯 MVP

**Goal**: Hono, Koa, and Elysia each have a private sample with a public page, a protected page, and sign-out

**Independent Test**: Type-check each sample, then start one with `PK_AUTHDOG` and request `/api/public`, `/me`, and `/logout`

- [x] T004 [P] [US1] Add the Hono sample on port 3012 in `examples/hono/` (`package.json`, `moon.yml`, `tsconfig.json`, `src/server.ts`, `README.md`, `.env.example`, `.gitignore`)
- [x] T005 [P] [US1] Add the Koa sample on port 3013 in `examples/koa/` (`package.json`, `moon.yml`, `tsconfig.json`, `src/server.ts`, `README.md`, `.env.example`, `.gitignore`)
- [x] T006 [P] [US1] Add the Elysia sample on port 3014 in `examples/elysia/` (`package.json`, `moon.yml`, `tsconfig.json`, `src/server.ts`, `README.md`, `.env.example`, `.gitignore`)

**Checkpoint**: Server samples type-check and follow the Express journey

---

## Phase 4: User Story 4 - Per-integration checks (Priority: P1)

**Goal**: A change to one of the eight packages runs that package's existing tests

**Independent Test**: Each workflow file path-filters only its package and runs `moon run <id>:test`

- [x] T007 [P] [US4] Add `.github/workflows/ci-hono.yml` running `hono:test`
- [x] T008 [P] [US4] Add `.github/workflows/ci-koa.yml` running `koa:test`
- [x] T009 [P] [US4] Add `.github/workflows/ci-elysia.yml` running `elysia:test`
- [x] T010 [P] [US4] Add `.github/workflows/ci-react-router.yml` running `react-router:test`
- [x] T011 [P] [US4] Add `.github/workflows/ci-nuxt.yml` running `nuxt:test`
- [x] T012 [P] [US4] Add `.github/workflows/ci-solid.yml` running `solid:test`
- [x] T013 [P] [US4] Add `.github/workflows/ci-javascript.yml` running `javascript:test`
- [x] T014 [P] [US4] Add `.github/workflows/ci-tauri.yml` running `tauri:test`

**Checkpoint**: Eight path-filtered workflows match the Fastify workflow shape

---

## Phase 5: User Story 2 - Browser-framework integrations (Priority: P2)

**Goal**: React Router, Nuxt, and Solid each have a sample that shows signed-out, profile, and sign-out with a public key only

**Independent Test**: Type-check each sample. The page configuration contains `PK_AUTHDOG` and no private credential

- [x] T015 [P] [US2] Add the React Router loader sample on port 3002 in `examples/react-router/`
- [x] T016 [P] [US2] Add the Nuxt SDK sample on port 3003 in `examples/nuxt/` including `server/api/me.ts`
- [x] T017 [P] [US2] Add the Solid sample on port 3004 in `examples/solid/`

**Checkpoint**: Browser samples type-check without embedding a private credential

---

## Phase 6: User Story 3 - JavaScript and Tauri (Priority: P3)

**Goal**: A framework-free browser sample and a desktop harness that completes callback, profile, and sign-out without a native bundle

**Independent Test**: Type-check both samples. `examples/tauri` has no `src-tauri` directory

- [x] T018 [P] [US3] Add the JavaScript browser sample on port 3005 in `examples/javascript/`
- [x] T019 [P] [US3] Add the Tauri callback harness on port 3006 in `examples/tauri/`

**Checkpoint**: Both samples type-check on the Bun toolchain

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Catalog entries for every integration and sample

- [x] T020 Add the eight packages, CI badges, sample rows, and layout entries to `README.md` without removing existing rows
- [x] T021 Run package tests and sample type-checks from `specs/001-sdk-parity/quickstart.md`

---

## Dependencies & Execution Order

- **Phase 1** before samples are registered with moon
- **US1, US2, and US3** can be written in parallel after Phase 1
- **US4** workflows do not depend on the samples
- **Polish** waits until samples and workflows exist

### User Story Dependencies

- **US1**: No dependency on US2 or US3
- **US4**: No dependency on the samples
- **US2**: No dependency on US1
- **US3**: No dependency on US1 or US2

### Parallel Opportunities

- T004, T005, and T006 touch different example directories
- T007–T014 touch different workflow files
- T015, T016, and T017 touch different example directories
- T018 and T019 touch different example directories

## Implementation Strategy

MVP is User Story 1 (Hono, Koa, Elysia samples) plus the three matching workflows from User Story 4. Browser and desktop samples follow without changing those server samples.

## Notes

- Do not change publishable package behavior
- Do not add a changeset unless a package defect fix is required
- Examples stay `private: true`
