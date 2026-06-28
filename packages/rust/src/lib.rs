//! Authdog SDK for Rust web backends, with first-class [axum] middleware.
//!
//! It mirrors the TypeScript `@authdog/express` / `@authdog/fastify` SDKs on
//! the wire — same `authdog-session` cookie, same OIDC `userinfo` flow, and the
//! same trusted identity-host allowlist — so one Authdog environment serves
//! Node and Rust services interchangeably.
//!
//! The framework-agnostic core ([`validate_and_parse_public_key`],
//! [`get_session_token`], [`fetch_user_data`], [`sanitize_redirect_path`]) is
//! reusable from any framework; the [`axum`] module wires it into axum.
//!
//! [axum]: https://docs.rs/axum

pub mod axum;
pub mod cookies;
pub mod identity;
pub mod public_key;
pub mod redirects;

pub use cookies::{get_session_token, parse_cookies, SESSION_COOKIE_NAME};
pub use identity::{fetch_user_data, is_authenticated_user_info, UserInfoResponse};
pub use public_key::{
    assert_trusted_identity_host, validate_and_parse_public_key, PublicKeyError, PublicKeyPayload,
};
pub use redirects::sanitize_redirect_path;

pub use axum::{attach_session, logout, require_auth, AuthContext, Authdog, AuthdogBuilder};
