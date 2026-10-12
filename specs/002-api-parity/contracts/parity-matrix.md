# Parity Matrix (baseline at plan time)

Legend: **yes** = implemented with tests; **no** = planned; **na** = not applicable.

Tier-1 cores: `node-commons`, `javascript`, `python`, `go`, `rust-core`, `java`, `kotlin`.

| API group | Tier | node-commons | javascript | python | go | rust-core | java | kotlin |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| oidc-userinfo | P0 | yes | yes | yes | yes | yes | yes | yes |
| session-cookie | P0 | yes | partial | yes | yes | yes | yes | yes |
| billing | P0 | yes | yes | yes | yes | yes | yes | yes |
| account-sessions | P1 | no | no | no | no | no | no | no |
| account-devices | P1 | no | no | no | no | no | no | no |
| account-connected-apps | P1 | no | no | no | no | no | no | no |
| account-profile-actions | P1 | no | no | no | no | no | no | no |
| auth-eval-server | P2 | no | na | no | no | no | no | no |
| headless-auth | P2 | no | no | no | no | no | no | no |
| graphql-edge | P2 | no | no | na | na | na | na | na |
| management-crud | out | na | na | na | na | na | na | na |

### Wave targets

| Wave | Cells to flip to `yes` |
| --- | --- |
| 2 | billing → all Tier-1 |
| 3 | account-* → node-commons |
| 4 | account-* → javascript + Tier-1 polyglot |
| 7 | auth-eval-server → node-commons + one polyglot |

Update this file in the same PR as implementation. CI gate (Wave 1) enforces P0 rows.

### Exception waivers

To temporarily allow a P0 `no` cell during a multi-PR rollout, add an entry to `specs/002-api-parity/contracts/parity-exceptions.json` (`group`, `core`, `reason`, `expires`). The check script should ignore listed cells until `expires`.
