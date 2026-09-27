<!--
Sync Impact Report
- Version change: (none) → 1.0.0
- Modified principles: template placeholders replaced with repository-evidenced rules
  - [PRINCIPLE_1_NAME] → I. Framework-Native Packages
  - [PRINCIPLE_2_NAME] → II. Shared Session Protocol
  - [PRINCIPLE_3_NAME] → III. Client/Server Boundary
  - [PRINCIPLE_4_NAME] → IV. Published API Compatibility
  - [PRINCIPLE_5_NAME] → V. Verified, Scoped Changes
- Added sections: Security Constraints; Development Workflow; Governance
- Removed sections: none (template comments removed after substitution)
- Follow-up TODOs: none
-->

# Authdog Web SDK Constitution

## Core Principles

### I. Framework-Native Packages
Each published integration MUST live as its own package under `packages/`
and follow the host framework's idioms (providers, middleware, hooks,
interceptors, or equivalent). Shared protocol logic MUST be reused from
the language core (`@authdog/node-commons`, `authdog-core`, and siblings)
instead of copying cookie, token, or allowlist code into a new adapter.
New packages MUST have a moon project, a package README, and the matching
CI workflow pattern already used by sibling packages. Rationale: this is
a polyglot monorepo of drop-in SDKs, not a single application.

### II. Shared Session Protocol
Backend SDKs MUST speak the same wire contract: the `authdog-session`
cookie, the OIDC `userinfo` flow, and the trusted identity-host
allowlist. A new adapter MUST NOT invent a parallel session cookie name,
token transport, or host-validation rule. Session tokens MAY also be
accepted as `Authorization: Bearer <token>` when the sibling Node
adapters already do. `attachSession`-style resolvers MUST NOT throw or
block the request on a missing or invalid token; `requireAuth` (or the
framework equivalent) is the security boundary. Rationale: one Authdog
environment must work across Node, Python, Go, Rust, and Kotlin.

### III. Client/Server Boundary
Secrets and server-only session work MUST stay on the server. Packages
that expose both surfaces MUST ship explicit `/client` and `/server`
(or equivalent) entry points so client bundles cannot import
server-only modules. Public keys (`pk_…` / `PK_AUTHDOG`) MAY be used in
the browser; private credentials MUST NOT. Client-side signed-in checks
are presentational only and MUST NOT be treated as authorization.

### IV. Published API Compatibility
Publishable package exports, types, and on-the-wire behavior are public
contracts. Breaking a public export, type, cookie name, or session
payload REQUIRES a Changeset and a major version bump. Additive,
backward-compatible changes use minor or patch via Changesets. Internal
workspace packages (`@authdog/eslint-config`,
`@authdog/typescript-config`) are not a public runtime contract.
Example apps under `examples/` MUST keep working against the packages
they showcase, but they are not themselves published APIs.

### V. Verified, Scoped Changes
A change MUST stay inside the packages, examples, and workflows it
affects. Do not rewrite unrelated adapters or "document the entire
existing system" unless that inventory is the requested deliverable.
The existing tests for every touched moon project MUST keep passing.
`bun run ci` / `moon ci` MUST pass before merge. New behavior that
alters session resolution, auth gates, logout, or public exports MUST
add or update tests in the same change.

## Security Constraints

- Token validation, cookie flags, and identity-host allowlisting MUST
  remain centralized in the language core. Adapters MUST NOT weaken
  `HttpOnly`, `SameSite=Lax`, or production `Secure` cookie behavior.
- Logout MUST expire `authdog-session` and sanitize redirect targets
  (`sanitizeRedirectPath` or equivalent) to prevent open redirects.
- A request is authenticated only when the identity provider's
  `userinfo` envelope reports success, matching existing Node adapters.
- Vulnerabilities MUST be reported to security@authdog.com. Do not open
  a public issue or commit exploit details. See `SECURITY.md`.
- Published `@authdog/*` runtime packages MUST stay free of
  high/critical dependency advisories that CI's `bun audit` would fail.

## Development Workflow

- Tooling is Bun (`>= 1.2.15`) and moon. Node packages build with tsup
  and MUST ship dual CJS/ESM plus TypeScript types. Set
  `sideEffects: false` unless the package has documented CSS or other
  side-effect imports (as `react-elements` does).
- TypeScript packages MUST pass `type-check`. Non-Node SDKs use their
  native toolchain through the existing moon `system` tasks.
- User-facing changes to a publishable package MUST include a Changeset
  (`bun run changeset`).
- Contributions land via feature-branch pull requests against `main`.
  Do not amend published history or skip hooks.
- Spec Kit artifacts describe the next bounded change. They MUST NOT
  invent process (mandatory TDD, new release trains, extra linters)
  that the repository does not already run.

## Governance

This constitution is the governance input for Spec Kit planning,
analysis, and implementation in this repository. Later specs and plans
MUST NOT contradict it. When a principle and a new feature request
conflict, the principle wins until this file is amended.

Amendments happen in a pull request that updates
`.specify/memory/constitution.md`, states the version bump, and names
the principles that changed. Versioning is semantic:

- MAJOR: remove or redefine a principle in a backward-incompatible way
- MINOR: add a principle or materially expand guidance
- PATCH: clarifications and wording fixes only

Reviews of Spec Kit plans and implementation PRs MUST check compliance
with the five core principles, the security constraints, and the
development workflow. Unjustified complexity or a new session mechanism
is a compliance failure, not a style preference.

**Version**: 1.0.0 | **Ratified**: 2026-09-27 | **Last Amended**: 2026-09-27
