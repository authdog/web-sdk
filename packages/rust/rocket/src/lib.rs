//! [Rocket] bindings for Authdog: an `AuthContext` request guard, a
//! `RequireAuth` gate guard, a `401` catcher, and a logout route.
//!
//! Built on [`authdog_core`], it mirrors the TypeScript `@authdog/express` /
//! `@authdog/fastify` SDKs on the wire — same `authdog-session` cookie, same
//! OIDC `userinfo` flow, same trusted identity-host allowlist — so a single
//! Authdog environment serves Node and Rust services interchangeably.
//!
//! Manage the configured instance as Rocket state; the guards read it back:
//!
//! ```ignore
//! rocket::build()
//!     .manage(Authdog::new(&pk)?)
//!     .mount("/", rocket::routes![me, authdog_rocket::logout])
//!     .register("/", rocket::catchers![authdog_rocket::unauthorized]);
//! ```
//!
//! [Rocket]: https://docs.rs/rocket

use std::sync::Arc;

use rocket::http::{Cookie, CookieJar, Status};
use rocket::request::{FromRequest, Outcome, Request};
use rocket::response::content::RawJson;
use rocket::response::Redirect;
use serde_json::Value;

use authdog_core::cookies::{get_session_token, SESSION_COOKIE_NAME};
use authdog_core::identity::{fetch_user_data, is_authenticated_user_info, UserInfoResponse};
use authdog_core::public_key::{validate_and_parse_public_key, PublicKeyError, PublicKeyPayload};
use authdog_core::redirects::sanitize_redirect_path;

struct Inner {
    payload: PublicKeyPayload,
    fetch_user: bool,
    client: reqwest::Client,
}

/// A configured Authdog server instance for Rocket. Cheap to `clone()` (it
/// wraps an `Arc`); register it with `rocket::build().manage(authdog)`.
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
    /// When `false`, the guards surface the token but leave `is_authenticated`
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

/// Per-request authentication context. Use it as a request guard — it resolves
/// the session on demand and never fails (an unconfigured/anonymous request
/// yields an empty context):
///
/// ```ignore
/// #[get("/")]
/// fn index(ctx: AuthContext) -> String { format!("{}", ctx.is_authenticated) }
/// ```
#[derive(Clone, Debug, Default)]
pub struct AuthContext {
    pub token: Option<String>,
    pub user: Option<Value>,
    pub is_authenticated: bool,
    pub user_info: Option<UserInfoResponse>,
}

async fn resolve_ctx(req: &Request<'_>) -> AuthContext {
    let Some(authdog) = req.rocket().state::<Authdog>() else {
        return AuthContext::default();
    };
    let authorization = req.headers().get_one("authorization");
    let cookie = req.headers().get_one("cookie");
    authdog.resolve(authorization, cookie).await
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for AuthContext {
    type Error = std::convert::Infallible;

    async fn from_request(req: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        Outcome::Success(resolve_ctx(req).await)
    }
}

/// Gate guard. Resolves the session and forwards a `401` (handled by the
/// [`unauthorized`] catcher) for unauthenticated requests. **This is the real
/// server-side enforcement point**; take it as a parameter on protected
/// handlers. Deref to the inner [`AuthContext`] for the user payload.
pub struct RequireAuth(pub AuthContext);

impl std::ops::Deref for RequireAuth {
    type Target = AuthContext;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for RequireAuth {
    type Error = ();

    async fn from_request(req: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let ctx = resolve_ctx(req).await;
        if ctx.is_authenticated {
            Outcome::Success(RequireAuth(ctx))
        } else {
            Outcome::Error((Status::Unauthorized, ()))
        }
    }
}

/// `401` catcher rendering `{"error":"Unauthorized"}`. Register it with
/// `.register("/", rocket::catchers![unauthorized])` so [`RequireAuth`]
/// forwards produce a JSON body.
#[rocket::catch(401)]
pub fn unauthorized() -> RawJson<&'static str> {
    RawJson(r#"{"error":"Unauthorized"}"#)
}

/// Route that clears the session cookie and redirects to a safe, same-origin
/// path taken from the `redirect_uri` query parameter. Mount it with
/// `rocket::routes![authdog_rocket::logout]`.
#[rocket::get("/logout?<redirect_uri>")]
pub fn logout(redirect_uri: Option<String>, cookies: &CookieJar<'_>) -> Redirect {
    cookies.remove(Cookie::build(SESSION_COOKIE_NAME).path("/"));
    Redirect::to(sanitize_redirect_path(redirect_uri.as_deref(), "/"))
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
