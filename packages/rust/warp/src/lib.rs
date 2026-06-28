//! [warp] bindings for Authdog: a composable session `Filter`, an auth-gate
//! filter with rejection recovery, and a logout filter.
//!
//! Built on [`authdog_core`], it mirrors the TypeScript `@authdog/express` /
//! `@authdog/fastify` SDKs on the wire — same `authdog-session` cookie, same
//! OIDC `userinfo` flow, same trusted identity-host allowlist — so a single
//! Authdog environment serves Node and Rust services interchangeably.
//!
//! ```ignore
//! let authdog = Authdog::new(&pk)?;
//! let me = warp::path("me")
//!     .and(require_auth(authdog.clone()))
//!     .map(|ctx: AuthContext| warp::reply::json(&ctx.user));
//! let routes = me.or(logout()).recover(recover_unauthorized);
//! ```
//!
//! [warp]: https://docs.rs/warp

use std::collections::HashMap;
use std::sync::Arc;

use serde_json::{json, Value};
use warp::http::header::{LOCATION, SET_COOKIE};
use warp::http::StatusCode;
use warp::{Filter, Rejection, Reply};

use authdog_core::cookies::{get_session_token, SESSION_COOKIE_NAME};
use authdog_core::identity::{fetch_user_data, is_authenticated_user_info, UserInfoResponse};
use authdog_core::public_key::{validate_and_parse_public_key, PublicKeyError, PublicKeyPayload};
use authdog_core::redirects::sanitize_redirect_path;

struct Inner {
    payload: PublicKeyPayload,
    fetch_user: bool,
    client: reqwest::Client,
}

/// A configured Authdog server instance for warp. Cheap to `clone()` (it wraps
/// an `Arc`); pass a clone to [`with_session`] / [`require_auth`].
///
/// The public key is validated and parsed once in [`Authdog::new`] — enforcing
/// the trusted identity-host allowlist — so a malformed or untrusted key fails
/// fast at startup rather than per request.
#[derive(Clone)]
pub struct Authdog(Arc<Inner>);

impl Authdog {
    /// Validate the public key and build an instance with default settings.
    pub fn new(public_key: &str) -> Result<Self, PublicKeyError> {
        Self::builder(public_key).build()
    }

    /// Start a builder to override `fetch_user` or the HTTP client.
    pub fn builder(public_key: &str) -> AuthdogBuilder {
        AuthdogBuilder {
            public_key: public_key.to_string(),
            fetch_user: true,
            client: None,
        }
    }

    /// The validated, parsed public-key payload.
    pub fn public_key_payload(&self) -> &PublicKeyPayload {
        &self.0.payload
    }

    /// Resolve the per-request [`AuthContext`] from the raw `Authorization` and
    /// `Cookie` header values. Never errors — a missing/invalid/untrusted token
    /// simply yields an anonymous context.
    pub async fn resolve(&self, authorization: Option<&str>, cookie: Option<&str>) -> AuthContext {
        let Some(token) = get_session_token(authorization, cookie) else {
            return AuthContext::default();
        };

        if !self.0.fetch_user {
            return AuthContext {
                token: Some(token),
                ..Default::default()
            };
        }

        match fetch_user_data(
            &self.0.client,
            &self.0.payload.identity_host,
            &self.0.payload.environment_id,
            &token,
        )
        .await
        {
            Ok(info) if is_authenticated_user_info(&info) => AuthContext {
                token: Some(token),
                user: info.user.clone(),
                is_authenticated: true,
                user_info: Some(info),
            },
            // A failed/untrusted userinfo lookup is "not authenticated" — never
            // an error response and never an authenticated session.
            _ => AuthContext {
                token: Some(token),
                ..Default::default()
            },
        }
    }
}

/// Builder for [`Authdog`].
pub struct AuthdogBuilder {
    public_key: String,
    fetch_user: bool,
    client: Option<reqwest::Client>,
}

impl AuthdogBuilder {
    /// When `false`, the filters surface the token but leave `is_authenticated`
    /// false (you validate it yourself). Defaults to `true`.
    pub fn fetch_user(mut self, fetch_user: bool) -> Self {
        self.fetch_user = fetch_user;
        self
    }

    /// Use a custom `reqwest::Client` for userinfo requests.
    pub fn http_client(mut self, client: reqwest::Client) -> Self {
        self.client = Some(client);
        self
    }

    pub fn build(self) -> Result<Authdog, PublicKeyError> {
        if self.public_key.is_empty() {
            return Err(PublicKeyError::Missing);
        }
        let payload = validate_and_parse_public_key(&self.public_key)?;
        Ok(Authdog(Arc::new(Inner {
            payload,
            fetch_user: self.fetch_user,
            client: self.client.unwrap_or_default(),
        })))
    }
}

/// Per-request authentication context, produced by the [`with_session`] /
/// [`require_auth`] filters.
#[derive(Clone, Debug, Default)]
pub struct AuthContext {
    pub token: Option<String>,
    pub user: Option<Value>,
    pub is_authenticated: bool,
    pub user_info: Option<UserInfoResponse>,
}

/// Rejection raised by [`require_auth`] for unauthenticated requests; turn it
/// into a `401 {"error":"Unauthorized"}` with [`recover_unauthorized`].
#[derive(Debug)]
pub struct Unauthorized;

impl warp::reject::Reject for Unauthorized {}

/// A filter that resolves the session for every request and yields an
/// [`AuthContext`]. It never rejects — a missing/invalid token yields an
/// anonymous context.
pub fn with_session(
    authdog: Authdog,
) -> impl Filter<Extract = (AuthContext,), Error = Rejection> + Clone {
    warp::any()
        .map(move || authdog.clone())
        .and(warp::header::optional::<String>("authorization"))
        .and(warp::header::optional::<String>("cookie"))
        .and_then(
            |authdog: Authdog, authorization: Option<String>, cookie: Option<String>| async move {
                let ctx = authdog
                    .resolve(authorization.as_deref(), cookie.as_deref())
                    .await;
                Ok::<_, Rejection>(ctx)
            },
        )
}

/// Auth-gate filter. Yields the [`AuthContext`] for authenticated requests and
/// rejects with [`Unauthorized`] otherwise. **This is the real server-side
/// enforcement point**; `.and` it onto protected routes and pair it with
/// [`recover_unauthorized`].
pub fn require_auth(
    authdog: Authdog,
) -> impl Filter<Extract = (AuthContext,), Error = Rejection> + Clone {
    with_session(authdog).and_then(|ctx: AuthContext| async move {
        if ctx.is_authenticated {
            Ok(ctx)
        } else {
            Err(warp::reject::custom(Unauthorized))
        }
    })
}

/// Logout filter — matches `GET /logout`, clears the session cookie, and
/// redirects to a safe, same-origin path from the `redirect_uri` query param.
pub fn logout() -> impl Filter<Extract = (impl Reply,), Error = Rejection> + Clone {
    warp::path("logout")
        .and(warp::get())
        .and(warp::query::<HashMap<String, String>>())
        .map(|params: HashMap<String, String>| {
            let target = sanitize_redirect_path(params.get("redirect_uri").map(String::as_str), "/");
            let cookie = format!(
                "{SESSION_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax"
            );
            let reply = warp::reply::with_header(warp::reply(), SET_COOKIE, cookie);
            let reply = warp::reply::with_header(reply, LOCATION, target);
            warp::reply::with_status(reply, StatusCode::FOUND)
        })
}

/// Recover [`Unauthorized`] rejections as `401 {"error":"Unauthorized"}`. Other
/// rejections pass through unchanged. Add it via `.recover(recover_unauthorized)`.
pub async fn recover_unauthorized(err: Rejection) -> Result<impl Reply, Rejection> {
    if err.find::<Unauthorized>().is_some() {
        let body = warp::reply::json(&json!({"error": "Unauthorized"}));
        Ok(warp::reply::with_status(body, StatusCode::UNAUTHORIZED))
    } else {
        Err(err)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use base64::Engine;

    fn make_pk() -> String {
        let json = r#"{"environmentId":"env_1","identityHost":"https://id.authdog.com"}"#;
        format!(
            "pk_{}",
            base64::engine::general_purpose::STANDARD.encode(json)
        )
    }

    #[test]
    fn new_validates_key() {
        assert!(Authdog::new(&make_pk()).is_ok());
        assert!(Authdog::new("pk_garbage!!").is_err());
        assert!(Authdog::new("").is_err());
    }

    #[tokio::test]
    async fn with_session_yields_anonymous_without_token() {
        let authdog = Authdog::new(&make_pk()).unwrap();
        let filter = with_session(authdog);
        let ctx = warp::test::request()
            .filter(&filter)
            .await
            .expect("with_session never rejects");
        assert!(!ctx.is_authenticated);
    }

    #[tokio::test]
    async fn require_auth_rejects_anonymous() {
        let authdog = Authdog::new(&make_pk()).unwrap();
        let filter = require_auth(authdog);
        let result = warp::test::request().filter(&filter).await;
        assert!(result.is_err());
    }
}
