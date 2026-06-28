//! [actix-web] bindings for Authdog: an `AuthContext` extractor, a `RequireAuth`
//! gate extractor, and a logout handler.
//!
//! Built on [`authdog_core`], it mirrors the TypeScript `@authdog/express` /
//! `@authdog/fastify` SDKs on the wire — same `authdog-session` cookie, same
//! OIDC `userinfo` flow, same trusted identity-host allowlist — so a single
//! Authdog environment serves Node and Rust services interchangeably.
//!
//! Register the configured instance as application data; the extractors read it
//! back:
//!
//! ```ignore
//! let authdog = Authdog::new(&pk)?;
//! App::new()
//!     .app_data(web::Data::new(authdog))
//!     .route("/me", web::get().to(me))      // me(user: RequireAuth)
//!     .route("/logout", web::get().to(logout));
//! ```
//!
//! [actix-web]: https://docs.rs/actix-web

use std::collections::HashMap;
use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;

use actix_web::{
    dev::Payload,
    error::{ErrorInternalServerError, InternalError},
    http::header,
    web, FromRequest, HttpRequest, HttpResponse,
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

/// A configured Authdog server instance for actix-web. Cheap to `clone()` (it
/// wraps an `Arc`); register a clone with `App::app_data(web::Data::new(..))`.
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

/// Per-request authentication context. Use it as a handler argument — it is an
/// actix-web extractor that resolves the session on demand (and never fails):
///
/// ```ignore
/// async fn index(ctx: AuthContext) -> HttpResponse { /* ctx.is_authenticated */ }
/// ```
#[derive(Clone, Debug, Default)]
pub struct AuthContext {
    pub token: Option<String>,
    pub user: Option<Value>,
    pub is_authenticated: bool,
    pub user_info: Option<UserInfoResponse>,
}

fn header_str<'a>(req: &'a HttpRequest, name: header::HeaderName) -> Option<&'a str> {
    req.headers().get(name).and_then(|v| v.to_str().ok())
}

impl FromRequest for AuthContext {
    type Error = actix_web::Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &HttpRequest, _payload: &mut Payload) -> Self::Future {
        let authdog = req
            .app_data::<web::Data<Authdog>>()
            .map(|d| d.get_ref().clone());
        let authorization = header_str(req, header::AUTHORIZATION).map(str::to_owned);
        let cookie = header_str(req, header::COOKIE).map(str::to_owned);
        Box::pin(async move {
            let Some(authdog) = authdog else {
                return Err(ErrorInternalServerError(
                    "Authdog not configured; add .app_data(web::Data::new(authdog))",
                ));
            };
            Ok(authdog
                .resolve(authorization.as_deref(), cookie.as_deref())
                .await)
        })
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

impl FromRequest for RequireAuth {
    type Error = actix_web::Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &HttpRequest, payload: &mut Payload) -> Self::Future {
        let ctx_fut = AuthContext::from_request(req, payload);
        Box::pin(async move {
            let ctx = ctx_fut.await?;
            if ctx.is_authenticated {
                Ok(RequireAuth(ctx))
            } else {
                let response = HttpResponse::Unauthorized().json(json!({"error": "Unauthorized"}));
                Err(InternalError::from_response("unauthorized", response).into())
            }
        })
    }
}

/// Handler that clears the session cookie and redirects to a safe, same-origin
/// path taken from the `redirect_uri` query parameter.
pub async fn logout(query: web::Query<HashMap<String, String>>) -> HttpResponse {
    let target = sanitize_redirect_path(query.get("redirect_uri").map(String::as_str), "/");
    let cookie = format!(
        "{SESSION_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax"
    );
    HttpResponse::Found()
        .insert_header((header::SET_COOKIE, cookie))
        .insert_header((header::LOCATION, target))
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
        // No token in either header → anonymous, no userinfo round-trip.
        let authdog = Authdog::new(&make_pk()).unwrap();
        let ctx = authdog.resolve(None, None).await;
        assert!(!ctx.is_authenticated);
        assert!(ctx.token.is_none());
    }
}
