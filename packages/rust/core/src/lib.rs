//! Framework-agnostic core for the Authdog Rust SDKs.
//!
//! It mirrors the TypeScript `@authdog/node-commons` package on the wire — same
//! `authdog-session` cookie, same OIDC `userinfo` flow, and the same trusted
//! identity-host allowlist — so one Authdog environment serves Node and Rust
//! services interchangeably.
//!
//! The per-framework crates ([axum], [actix-web], [Rocket], [warp], [poem])
//! build their middleware / extractors on top of these primitives:
//! [`validate_and_parse_public_key`], [`get_session_token`], [`fetch_user_data`],
//! and [`sanitize_redirect_path`].
//!
//! [axum]: https://docs.rs/authdog-axum
//! [actix-web]: https://docs.rs/authdog-actix
//! [Rocket]: https://docs.rs/authdog-rocket
//! [warp]: https://docs.rs/authdog-warp
//! [poem]: https://docs.rs/authdog-poem

pub mod cookies;
pub mod identity;
pub mod public_key;
pub mod redirects;

pub use cookies::{get_session_token, parse_cookies, SESSION_COOKIE_NAME};
pub use identity::{fetch_user_data, is_authenticated_user_info, IdentityError, UserInfoResponse};
pub use public_key::{
    assert_trusted_identity_host, validate_and_parse_public_key, PublicKeyError, PublicKeyPayload,
};
pub use redirects::sanitize_redirect_path;
