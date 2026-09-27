# Feature Specification: New SDK Parity

**Feature Branch**: `001-sdk-parity`

**Created**: 2026-09-27

**Status**: Draft

**Input**: User description: "Plan the next logical wave for this repository."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Find and run a new server integration (Priority: P1)

A developer choosing a server stack can discover Hono, Koa, and Elysia alongside Express and Fastify, start a sample for the one they use, and see the same session behavior: a public page that reports whether they are signed in, a protected page that refuses anonymous visitors, and a sign-out that returns them to a safe page.

**Why this priority**: These three integrations already exist as libraries and match the server adapters developers already rely on. They are invisible in the project overview and have no sample, so the highest-value slice is making that existing capability findable and demonstrable.

**Independent Test**: From the project overview, open the Hono, Koa, or Elysia entry, start its sample with a public key, and complete the public, protected, and sign-out checks without using Express or Fastify.

**Acceptance Scenarios**:

1. **Given** a developer reading the project overview, **When** they look for server integrations, **Then** Hono, Koa, and Elysia appear with the same kind of description, version, and sample pointer as Express and Fastify.
2. **Given** a sample started with a valid public key and no session, **When** the developer opens the public page, **Then** the page reports that they are signed out and still responds successfully.
3. **Given** no session, **When** the developer opens the protected page, **Then** access is refused and no user profile is shown.
4. **Given** a signed-in session, **When** the developer opens the protected page, **Then** they see their own profile and not another person's.
5. **Given** a signed-in session, **When** the developer signs out, **Then** the session ends and they return only to a safe in-app destination.

---

### User Story 2 - Find and run a new browser integration (Priority: P2)

A developer building a browser app can discover React Router, Nuxt, and Solid alongside the browser integrations already listed, start a sample, sign in, see their profile, and sign out. The sample uses only a public key in the browser.

**Why this priority**: These integrations cover the next most common app hosts after the server adapters. Each can be demonstrated on its own once the server slice exists, and none of them require a new sign-in protocol.

**Independent Test**: Start the React Router, Nuxt, or Solid sample with a public key, sign in, confirm the profile belongs to that person, and sign out. Do this without starting the Vue sample.

**Acceptance Scenarios**:

1. **Given** the project overview, **When** a developer looks for browser integrations, **Then** React Router, Nuxt, and Solid are listed with a sample they can run.
2. **Given** a sample and a valid public key, **When** the developer is signed out, **Then** they see a sign-in action and no profile.
3. **Given** a completed sign-in, **When** the developer views the profile, **Then** they see the signed-in person and can sign out.
4. **Given** a browser sample, **When** the developer inspects what the page is configured with, **Then** only a public key is present.

---

### User Story 3 - Find the framework-free and desktop integrations (Priority: P3)

A developer who is not using a web framework, or who is building a desktop app, can discover the JavaScript browser client and the Tauri desktop client, run a sample of each, and complete sign-in and sign-out. The desktop sample can be checked without packaging a native desktop application.

**Why this priority**: These two clients complete the set of integrations that were added together and then left out of the overview. They serve narrower hosts than the server and browser-framework slices, so they follow those slices.

**Independent Test**: Start the JavaScript sample in a browser and the desktop sample in its checkable form. Each signs in, shows the signed-in person, and signs out, without using React Router, Nuxt, or Solid.

**Acceptance Scenarios**:

1. **Given** the project overview, **When** a developer looks for a framework-free browser client or a desktop client, **Then** both are listed with a way to run a sample.
2. **Given** the JavaScript sample after the identity provider redirects back, **When** the redirect is consumed, **Then** the page shows the signed-in person and offers sign-out.
3. **Given** the desktop sample, **When** a sign-in callback arrives, **Then** the sample resolves the signed-in person and can clear that session.
4. **Given** either sample, **When** it is checked in the project's normal verification, **Then** that check does not require building a native desktop bundle.

---

### User Story 4 - Trust that a change to a new integration is checked (Priority: P1)

A maintainer who changes one of the eight integrations gets the same automatic check the existing integrations already get, and can start that integration's sample from the same command list used for the current samples.

**Why this priority**: Discoverable samples are not enough if a later change can break an integration with no check. This story is tied to story 1 because the server integrations are the first ones a maintainer will change, and it applies to every integration in the wave.

**Independent Test**: Change only the Hono integration and confirm an automatic check runs for Hono and does not require the Vue or Express samples to change. Repeat the same observation for each of the other seven integrations.

**Acceptance Scenarios**:

1. **Given** a change that touches only one of the eight integrations, **When** the project's automatic checks run, **Then** that integration's existing tests run and the other integrations are not required to change.
2. **Given** the contributor command list, **When** a developer wants to start a new sample, **Then** each new sample has a command next to the existing sample commands.
3. **Given** the current Express, Fastify, and Vue entries, **When** this wave is complete, **Then** those entries still describe the same behavior they describe today.

### Edge Cases

- A sample started without a public key fails immediately with a message that tells the developer how to supply one, and it does not start serving traffic.
- A missing, invalid, or expired session does not block public pages and does not reveal a profile.
- Sign-out never sends the developer to an external or unexpected destination.
- A browser or desktop sample never asks for a private credential.
- An integration that already appears in the overview (the React SDK and the Chrome extension SDK) is left as it is.
- The empty data-commons placeholder is not presented as a new integration.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project overview MUST list Hono, Koa, Elysia, React Router, Nuxt, Solid, the framework-free JavaScript client, and the Tauri desktop client with the same kind of entry used for integrations that are already listed.
- **FR-002**: Each of those eight integrations MUST have a runnable sample linked from the overview.
- **FR-003**: Each server sample (Hono, Koa, Elysia) MUST show a public page, a protected page that refuses anonymous visitors, and a sign-out that returns to a safe destination.
- **FR-004**: Each browser-framework sample (React Router, Nuxt, Solid) MUST show signed-out, signed-in profile, and sign-out states, configured only with a public key.
- **FR-005**: The JavaScript sample MUST consume the return from the identity provider, show the signed-in person, and offer sign-out.
- **FR-006**: The desktop sample MUST accept a sign-in callback, resolve the signed-in person, and clear the session, and its ordinary check MUST NOT require a native desktop bundle.
- **FR-007**: A change to any one of the eight integrations MUST trigger that integration's existing automated tests, using the same per-integration check pattern already used for Express, Fastify, and Vue.
- **FR-008**: The contributor command list MUST include a start command for each new sample.
- **FR-009**: Samples MUST fail fast when the public key is missing, and MUST NOT weaken session, cookie, or redirect behavior of the existing integrations.
- **FR-010**: This wave MUST NOT change the public behavior of integrations that are already listed, and MUST NOT add a new session mechanism.
- **FR-011**: The React SDK, the Chrome extension SDK, and the data-commons placeholder MUST stay out of this wave.

### Key Entities

- **Integration**: One of the eight existing libraries a developer can adopt. Attributes that matter here are its audience (server, browser framework, framework-free browser, or desktop), its overview entry, and its sample.
- **Sample**: A private runnable demonstration of one integration. It shows signed-out, signed-in, and sign-out behavior and is configured with a public key.
- **Verification check**: The automatic test already attached to an integration, extended so each of the eight is checked the way existing integrations are.
- **Catalog entry**: The overview row and command-list item a developer uses to find an integration and start its sample.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can locate all 8 integrations from the project overview in one pass, without opening library source.
- **SC-002**: For each of the 8 integrations, a developer can start its sample and observe signed-out, signed-in, and sign-out behavior.
- **SC-003**: All 3 server samples refuse anonymous access to the protected page and still serve the public page.
- **SC-004**: A change isolated to 1 of the 8 integrations runs that integration's automated tests, and the other 7 do not need to be modified for that check to apply.
- **SC-005**: Existing overview entries for current integrations remain present and describe the same developer-facing behavior as before this wave.
- **SC-006**: Every new browser or desktop sample is configurable with a public key alone; zero samples require a private credential.

## Assumptions

- The eight integrations already implement sign-in, session resolution, and sign-out. This wave makes them discoverable, demonstrable, and checked. It does not redesign them.
- "The same kind of entry" means the overview table, sample list, and contributor command list already used for Express, Fastify, and Vue.
- Server samples follow the public / protected / sign-out journey developers already get from the Express and Fastify samples.
- Browser-framework samples follow the signed-out / profile / sign-out journey developers already get from the Vue sample.
- The desktop sample is considered runnable when a developer can exercise the callback, profile, and sign-out path without packaging a native application. Native packaging remains optional and outside this wave.
- The React SDK and Chrome extension SDK are already in the overview. The Chrome extension already has its own automatic check. They are not part of the gap this wave closes.
- data-commons is an empty placeholder, not a product integration.
- No new public library behavior is required, so this wave does not by itself need a new release note for the libraries.
