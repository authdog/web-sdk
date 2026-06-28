//! [axum] bindings for Authdog: session middleware, an `AuthContext` extractor,
//! an authentication gate, and a logout handler.
//!
//! Built on [`authdog_core`], it mirrors the TypeScript `@authdog/express` /
//! `@authdog/fastify` SDKs on the wire — same `authdog-session` cookie, same
//! OIDC `userinfo` flow, same trusted identity-host allowlist — so a single
//! Authdog environment serves Node and Rust services interchangeably.
//!
//! [axum]: https://docs.rs/axum

use std::collections::HashMap;
use std::sync::Arc;

use axum::{
    extract::{FromRequestParts, Query, Request, State},
    http::{header, request::Parts, HeaderMap, StatusCode},
    middleware::Next,
    response::{IntoResponse, Redirect, Response},
    Json,
};
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

/// A configured Authdog server instance for axum. Cheap to `clone()` (it wraps
/// an `Arc`); pass a clone as router state for [`attach_session`].
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

    async fn resolve(&self, headers: &HeaderMap) -> AuthContext {
        let auth = headers
            .get(header::AUTHORIZATION)
            .and_then(|v| v.to_str().ok());
        let cookie = headers.get(header::COOKIE).and_then(|v| v.to_str().ok());

        let Some(token) = get_session_token(auth, cookie) else {
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
    /// When `false`, [`attach_session`] surfaces the token but leaves
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

/// Per-request authentication context, inserted into request extensions by
/// [`attach_session`] and available via the [`AuthContext`] extractor.
#[derive(Clone, Debug, Default)]
pub struct AuthContext {
    pub token: Option<String>,
    pub user: Option<Value>,
    pub is_authenticated: bool,
    pub user_info: Option<UserInfoResponse>,
}

/// Session middleware. Use with `axum::middleware::from_fn_with_state`:
///
/// ```ignore
/// let app = Router::new()
///     .route("/me", get(me))
///     .layer(middleware::from_fn_with_state(authdog.clone(), attach_session));
/// ```
///
/// It never short-circuits the request — a missing/invalid token simply yields
/// an anonymous [`AuthContext`].
pub async fn attach_session(
    State(authdog): State<Authdog>,
    mut req: Request,
    next: Next,
) -> Response {
    let ctx = authdog.resolve(req.headers()).await;
    req.extensions_mut().insert(ctx);
    next.run(req).await
}

/// Gate middleware that responds `401 {"error":"Unauthorized"}` for
/// unauthenticated requests. **This is the real server-side enforcement
/// point**; layer it on protected routes (after [`attach_session`]).
pub async fn require_auth(req: Request, next: Next) -> Response {
    let authenticated = req
        .extensions()
        .get::<AuthContext>()
        .map(|c| c.is_authenticated)
        .unwrap_or(false);

    if !authenticated {
        return (
            StatusCode::UNAUTHORIZED,
            Json(json!({"error": "Unauthorized"})),
        )
            .into_response();
    }
    next.run(req).await
}

/// Handler that clears the session cookie and redirects to a safe, same-origin
/// path taken from the `redirect_uri` query parameter.
pub async fn logout(Query(params): Query<HashMap<String, String>>) -> Response {
    let target = sanitize_redirect_path(params.get("redirect_uri").map(String::as_str), "/");
    let cookie = format!(
        "{SESSION_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax"
    );
    ([(header::SET_COOKIE, cookie)], Redirect::to(&target)).into_response()
}

impl<S> FromRequestParts<S> for AuthContext
where
    S: Send + Sync,
{
    type Rejection = std::convert::Infallible;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        Ok(parts
            .extensions
            .get::<AuthContext>()
            .cloned()
            .unwrap_or_default())
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

    #[test]
    fn anonymous_request_is_not_authenticated() {
        use axum::body::Body;
        use axum::http::Request as HttpRequest;

        // A request with no AuthContext extension reads as unauthenticated,
        // which is what `require_auth` gates on.
        let req = HttpRequest::builder().body(Body::empty()).unwrap();
        let authed = req
            .extensions()
            .get::<AuthContext>()
            .map(|c| c.is_authenticated)
            .unwrap_or(false);
        assert!(!authed);

        let mut req = req;
        req.extensions_mut().insert(AuthContext {
            is_authenticated: true,
            ..Default::default()
        });
        assert!(
            req.extensions()
                .get::<AuthContext>()
                .unwrap()
                .is_authenticated
        );
    }
}
