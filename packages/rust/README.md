# authdog-axum

Authdog SDK for [axum](https://docs.rs/axum) — session middleware, an
`AuthContext` extractor, an authentication gate, and a logout handler. It
mirrors the TypeScript [`@authdog/express`](../express) /
[`@authdog/fastify`](../fastify) SDKs on the wire (same `authdog-session`
cookie, same OIDC `userinfo` flow, same trusted identity-host allowlist), so a
single Authdog environment serves Node and Rust services interchangeably.

## Install

```toml
[dependencies]
authdog-axum = "0.1"
axum = "0.8"
```

## Quick start

```rust
use std::env;
use axum::{middleware, routing::get, Router, Json};
use authdog_axum::{attach_session, logout, require_auth, Authdog, AuthContext};
use serde_json::{json, Value};

#[tokio::main]
async fn main() {
    // Validated + parsed once at startup — a malformed/untrusted key errors here.
    let authdog = Authdog::new(&env::var("PK_AUTHDOG").unwrap()).expect("invalid public key");

    let app = Router::new()
        .route("/", get(index))
        // Protected route — require_auth is the real server-side gate.
        .route("/me", get(me).layer(middleware::from_fn(require_auth)))
        .route("/logout", get(logout))
        // Resolve the session for every request; inserts AuthContext.
        .layer(middleware::from_fn_with_state(authdog.clone(), attach_session))
        .with_state(authdog);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn index(ctx: AuthContext) -> Json<Value> {
    Json(json!({ "authenticated": ctx.is_authenticated }))
}

async fn me(ctx: AuthContext) -> Json<Value> {
    Json(ctx.user.unwrap_or(Value::Null))
}
```

## How it works

- **`attach_session`** — middleware (use with `from_fn_with_state(authdog, …)`)
  that reads the token from the `authdog-session` cookie or an
  `Authorization: Bearer <token>` header, calls the identity provider's
  `userinfo` endpoint, and inserts an `AuthContext` into the request:

  ```rust
  pub struct AuthContext {
      pub token: Option<String>,
      pub user: Option<serde_json::Value>,
      pub is_authenticated: bool,
      pub user_info: Option<UserInfoResponse>,
  }
  ```

  It **never short-circuits** the request — a missing/invalid token yields an
  anonymous context. `AuthContext` is also an axum extractor, so any handler can
  take it as an argument.

- **`require_auth`** — gate middleware that responds
  `401 {"error":"Unauthorized"}` for unauthenticated requests. **This is the
  security boundary**; layer it on protected routes (after `attach_session`).

- **`logout`** — handler that expires the `authdog-session` cookie (`HttpOnly`,
  `SameSite=Lax`) and redirects to the `redirect_uri` query parameter after
  `sanitize_redirect_path` strips open redirects.

### Skip the userinfo round-trip

```rust
let authdog = Authdog::builder(&pk).fetch_user(false).build()?;
```

`AuthContext::token` is populated but `is_authenticated` stays false — you own
validation. Supply a custom client with `.http_client(reqwest::Client::new())`.

## Security

- The public key is validated and parsed **once at startup** (`Authdog::new`);
  an untrusted key (identity host not on the allowlist) errors immediately.
- The bearer token is only ever sent to a trusted, `https:` identity host.
  Self-hosted hosts can be allowlisted via `AUTHDOG_ALLOWED_IDENTITY_HOSTS`
  (comma-separated).
- A request is authenticated **only** when the `userinfo` envelope reports
  success (`meta.code == 200` with a `user`).

## Development

```bash
cd packages/rust
cargo test        # or:  moon run rust:test
```

## License

MIT
