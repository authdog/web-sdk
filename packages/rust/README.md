# Authdog Rust SDKs

Backend SDKs for Rust web services. A shared core crate
([`authdog-core`](core)) implements the wire protocol — public-key validation,
session-token extraction, OIDC `userinfo` lookups, and redirect sanitization —
and one crate per framework wires it into idiomatic middleware / extractors:

| Crate | Framework | crates.io |
|-------|-----------|-----------|
| [`authdog-core`](core)   | _(framework-agnostic core)_ | [crates.io](https://crates.io/crates/authdog-core) |
| [`authdog-axum`](axum)   | [axum](https://docs.rs/axum)         | [crates.io](https://crates.io/crates/authdog-axum) |
| [`authdog-actix`](actix) | [actix-web](https://docs.rs/actix-web) | [crates.io](https://crates.io/crates/authdog-actix) |
| [`authdog-rocket`](rocket) | [Rocket](https://docs.rs/rocket)   | [crates.io](https://crates.io/crates/authdog-rocket) |
| [`authdog-warp`](warp)   | [warp](https://docs.rs/warp)         | [crates.io](https://crates.io/crates/authdog-warp) |
| [`authdog-poem`](poem)   | [poem](https://docs.rs/poem)         | [crates.io](https://crates.io/crates/authdog-poem) |

Every crate mirrors the TypeScript [`@authdog/express`](../express) /
[`@authdog/fastify`](../fastify) SDKs on the wire (same `authdog-session`
cookie, same OIDC `userinfo` flow, same trusted identity-host allowlist), so a
single Authdog environment serves Node and Rust services interchangeably.

## Common API

Each framework crate exposes the same building blocks, named for the framework's
idioms:

- **`Authdog::new(&pk)`** — validates and parses the public key **once at
  startup** (a malformed/untrusted key errors here, not per request).
  `Authdog::builder(&pk).fetch_user(false).http_client(client).build()` opts out
  of the `userinfo` round-trip or supplies a custom `reqwest::Client`.
- **Session resolution** — reads the token from the `authdog-session` cookie or
  an `Authorization: Bearer <token>` header, calls the identity provider's
  `userinfo` endpoint, and yields an `AuthContext`:

  ```rust
  pub struct AuthContext {
      pub token: Option<String>,
      pub user: Option<serde_json::Value>,
      pub is_authenticated: bool,
      pub user_info: Option<UserInfoResponse>,
  }
  ```

  It **never short-circuits** the request — a missing/invalid token yields an
  anonymous context.
- **`require_auth`** — the gate that responds `401 {"error":"Unauthorized"}` for
  unauthenticated requests. **This is the security boundary**; apply it to
  protected routes.
- **`logout`** — clears the `authdog-session` cookie (`HttpOnly`,
  `SameSite=Lax`) and redirects to the `redirect_uri` query parameter after
  `sanitize_redirect_path` strips open redirects.

## Quick start

### axum (`authdog-axum`)

```rust
use axum::{middleware, routing::get, Router, Json};
use authdog_axum::{attach_session, logout, require_auth, Authdog, AuthContext};
use serde_json::{json, Value};

let authdog = Authdog::new(&std::env::var("PK_AUTHDOG")?)?;
let app = Router::new()
    .route("/", get(|ctx: AuthContext| async move { Json(json!({"authenticated": ctx.is_authenticated})) }))
    .route("/me", get(|ctx: AuthContext| async move { Json(ctx.user.unwrap_or(Value::Null)) })
        .layer(middleware::from_fn(require_auth)))
    .route("/logout", get(logout))
    .layer(middleware::from_fn_with_state(authdog.clone(), attach_session))
    .with_state(authdog);
```

### actix-web (`authdog-actix`)

```rust
use actix_web::{web, App, HttpServer};
use authdog_actix::{logout, Authdog, RequireAuth};

let authdog = Authdog::new(&std::env::var("PK_AUTHDOG")?)?;
HttpServer::new(move || {
    App::new()
        .app_data(web::Data::new(authdog.clone()))
        // `RequireAuth` is the gate: 401 unless authenticated.
        .route("/me", web::get().to(|user: RequireAuth| async move {
            web::Json(user.0.user.clone())
        }))
        .route("/logout", web::get().to(logout))
});
```

### Rocket (`authdog-rocket`)

```rust
use authdog_rocket::{logout, unauthorized, Authdog, RequireAuth};

#[rocket::get("/me")]
fn me(user: RequireAuth) -> rocket::serde::json::Value {
    rocket::serde::json::json!(user.0.user)
}

rocket::build()
    .manage(Authdog::new(&std::env::var("PK_AUTHDOG").unwrap()).unwrap())
    .mount("/", rocket::routes![me, logout])
    .register("/", rocket::catchers![unauthorized]);
```

### warp (`authdog-warp`)

```rust
use authdog_warp::{logout, recover_unauthorized, require_auth, Authdog, AuthContext};
use warp::Filter;

let authdog = Authdog::new(&std::env::var("PK_AUTHDOG")?)?;
let me = warp::path("me")
    .and(require_auth(authdog.clone()))
    .map(|ctx: AuthContext| warp::reply::json(&ctx.user));
let routes = me.or(logout()).recover(recover_unauthorized);
```

### poem (`authdog-poem`)

```rust
use poem::{get, EndpointExt, Route};
use authdog_poem::{logout, Authdog, RequireAuth};

let authdog = Authdog::new(&std::env::var("PK_AUTHDOG")?)?;
let app = Route::new()
    .at("/me", get(|user: RequireAuth| async move {
        poem::web::Json(user.0.user.clone())
    }))
    .at("/logout", get(logout))
    .data(authdog);
```

## Security

- The public key is validated and parsed **once at startup** (`Authdog::new`);
  an untrusted key (identity host not on the allowlist) errors immediately.
- The bearer token is only ever sent to a trusted, `https:` identity host.
  Self-hosted hosts can be allowlisted via `AUTHDOG_ALLOWED_IDENTITY_HOSTS`
  (comma-separated).
- A request is authenticated **only** when the `userinfo` envelope reports
  success (`meta.code == 200` with a `user`).

## Development

This directory is a Cargo workspace; the commands build/test every crate:

```bash
cd packages/rust
cargo test        # or:  moon run rust:test
```

## License

MIT
