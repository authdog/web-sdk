//! [poem] bindings for Authdog: an `AuthContext` extractor, a `RequireAuth`
//! gate extractor, and a logout handler.
//!
//! Built on [`authdog_core`], it mirrors the TypeScript `@authdog/express` /
//! `@authdog/fastify` SDKs on the wire — same `authdog-session` cookie, same
//! OIDC `userinfo` flow, same trusted identity-host allowlist — so a single
//! Authdog environment serves Node and Rust services interchangeably.
//!
//! Attach the configured instance with `.data(authdog)`; the extractors read it
//! back:
//!
//! ```ignore
//! let authdog = Authdog::new(&pk)?;
//! let app = Route::new()
//!     .at("/me", get(me))            // async fn me(user: RequireAuth)
//!     .at("/logout", get(logout))
//!     .data(authdog);
//! ```
//!
//! [poem]: https://docs.rs/poem

use std::collections::HashMap;
use std::sync::Arc;

use poem::http::{header, StatusCode};
use poem::web::{Json, Query};
use poem::{handler, FromRequest, IntoResponse, Request, RequestBody, Response, Result};
use serde_json::{json, Value};

use authdog_core::cookies::{get_session_token, SESSION_COOKIE_NAME};
use authdog_core::identity::{fetch_user_data, is_authenticated_user_info, UserInfoResponse};
use authdog_core::public_key::{validate_and_parse_public_key, PublicKeyError, PublicKeyPayload};
use authdog_core::redirects::sanitize_redirect_path;

struct Inner {
    payload: PublicKeyPayload,
    fetch_user: bool,
    client: reqwest::Client,
}

/// A configured Authdog server instance for poem. Cheap to `clone()` (it wraps
/// an `Arc`); attach a clone with `.data(authdog)`.
///
/// The public key is validated and parsed once in [`Authdog::new`] — enforcing
/// the trusted identity-host allowlist — so a malformed or untrusted key fails
/// fast at startup rather than per request.
#[derive(Clone)]
pub struct Authdog(Arc<Inner>);

impl Authdog {
    /// Validate the public key and build an instance with default settings.
    pub fn new(public_key: &str) -> std::result::Result<Self, PublicKeyError> {
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
    /// When `false`, the extractors surface the token but leave
    /// `is_authenticated` false (you validate it yourself). Defaults to `true`.
    pub fn fetch_user(mut self, fetch_user: bool) -> Self {
        self.fetch_user = fetch_user;
        self
    }

    /// Use a custom `reqwest::Client` for userinfo requests.
    pub fn http_client(mut self, client: reqwest::Client) -> Self {
        self.client = Some(client);
        self
    }

    pub fn build(self) -> std::result::Result<Authdog, PublicKeyError> {
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

/// Per-request authentication context. Use it as a handler argument — it is a
/// poem extractor that resolves the session on demand (and never fails):
///
/// ```ignore
/// #[handler]
/// async fn index(ctx: AuthContext) -> String { format!("{}", ctx.is_authenticated) }
/// ```
#[derive(Clone, Debug, Default)]
pub struct AuthContext {
    pub token: Option<String>,
    pub user: Option<Value>,
    pub is_authenticated: bool,
    pub user_info: Option<UserInfoResponse>,
}

fn header_str<'a>(req: &'a Request, name: header::HeaderName) -> Option<&'a str> {
    req.headers().get(name).and_then(|v| v.to_str().ok())
}

impl<'a> FromRequest<'a> for AuthContext {
    async fn from_request(req: &'a Request, _body: &mut RequestBody) -> Result<Self> {
        let authdog = req.extensions().get::<Authdog>().cloned().ok_or_else(|| {
            poem::Error::from_string(
                "Authdog not configured; attach it with .data(authdog)",
                StatusCode::INTERNAL_SERVER_ERROR,
            )
        })?;
        let authorization = header_str(req, header::AUTHORIZATION);
        let cookie = header_str(req, header::COOKIE);
        Ok(authdog.resolve(authorization, cookie).await)
    }
}

/// Gate extractor. Resolves the session and responds `401
/// {"error":"Unauthorized"}` for unauthenticated requests. **This is the real
/// server-side enforcement point**; take it as a handler argument on protected
/// routes. Deref to the inner [`AuthContext`] for the user payload.
pub struct RequireAuth(pub AuthContext);

impl std::ops::Deref for RequireAuth {
    type Target = AuthContext;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl<'a> FromRequest<'a> for RequireAuth {
    async fn from_request(req: &'a Request, body: &mut RequestBody) -> Result<Self> {
        let ctx = AuthContext::from_request(req, body).await?;
        if ctx.is_authenticated {
            Ok(RequireAuth(ctx))
        } else {
            let response = Json(json!({"error": "Unauthorized"}))
                .with_status(StatusCode::UNAUTHORIZED)
                .into_response();
            Err(poem::Error::from_response(response))
        }
    }
}

/// Handler that clears the session cookie and redirects to a safe, same-origin
/// path taken from the `redirect_uri` query parameter.
#[handler]
pub fn logout(Query(params): Query<HashMap<String, String>>) -> Response {
    let target = sanitize_redirect_path(params.get("redirect_uri").map(String::as_str), "/");
    let cookie = format!(
        "{SESSION_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax"
    );
    Response::builder()
        .status(StatusCode::FOUND)
        .header(header::LOCATION, target)
        .header(header::SET_COOKIE, cookie)
        .finish()
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
    async fn anonymous_request_is_not_authenticated() {
        let authdog = Authdog::new(&make_pk()).unwrap();
        let ctx = authdog.resolve(None, None).await;
        assert!(!ctx.is_authenticated);
        assert!(ctx.token.is_none());
    }
}
