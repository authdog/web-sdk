# Quickstart: Validate SDK API Parity

Run from repository root after implementing waves. Uses mocks/pins unless noted.

## Prerequisites

- Bun and moon (root README)
- `bun install`
- Optional: `PK_AUTHDOG` for manual identity host smoke (not required for unit tests)

## 1. Documentation gate

- [identity-api-inventory.md](./contracts/identity-api-inventory.md) lists P0/P1 groups.
- [parity-matrix.md](./contracts/parity-matrix.md) has no unexplained P0 `no` for Tier-1 cores.
- [waves.md](./contracts/waves.md) matches completed implementation wave.

## 2. Node core tests

```bash
moon run node-commons:test
```

Expected: billing + account modules pass; fixtures load from `specs/002-api-parity/contracts/pins/`.

## 3. JavaScript client

```bash
moon run javascript:test
```

Expected: `createAuthdogClient` billing/account methods call allowlisted host (mocked).

## 4. Polyglot spot checks (after Waves 2–4)

```bash
moon run python:test go:test rust:test java:test
```

Expected: billing and/or account tests pass per matrix for completed waves.

## 5. Parity matrix script (Wave 1+)

When `scripts/check-parity-matrix` exists:

```bash
bun run scripts/check-parity-matrix.ts
```

Expected: exit 0; otherwise prints cells violating P0 policy.

## 6. Manual smoke (optional)

With valid `PK_AUTHDOG`:

1. Start an example using `@authdog/javascript` (e.g. `examples/javascript` after wired demo lands).
2. Sign in; call `client.billing.listPlans()` — plans render or empty list with 200 envelope.
3. If account wired: list sessions and revoke a non-current session in dev tenant.

Expected: no requests to non-allowlisted hosts; failures show identity `meta.message` when present.

## 7. Client/server boundary (Wave 7+)

Build a Next.js or Express sample importing only `/client` paths; verify bundle analysis does not include AuthZEN or feature-flag eval modules (server entry only).

Expected: build succeeds; grep of client chunk excludes `adenv_` eval helper paths.
