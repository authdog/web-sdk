//! Identity-provider (OIDC `userinfo`) lookups.

use serde::Deserialize;
use serde_json::Value;

use crate::public_key::assert_trusted_identity_host;

/// Decoded OIDC `userinfo` envelope. `extra` retains the full object so callers
/// can read provider-specific fields.
#[derive(Debug, Clone, Deserialize)]
pub struct UserInfoResponse {
    #[serde(default)]
    pub user: Option<Value>,
    #[serde(default)]
    pub meta: Option<Meta>,
    #[serde(flatten)]
    pub extra: serde_json::Map<String, Value>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Meta {
    #[serde(default)]
    pub code: Option<i64>,
}

#[derive(Debug, thiserror::Error)]
pub enum IdentityError {
    #[error(transparent)]
    PublicKey(#[from] crate::public_key::PublicKeyError),
    #[error("failed to fetch user info (status {0})")]
    Status(u16),
    #[error(transparent)]
    Http(#[from] reqwest::Error),
}

/// Fetch user data from the identity host's OIDC `userinfo` endpoint.
///
/// `identity_host` is re-validated against the trusted-host allowlist before
/// the bearer token is sent, preventing SSRF / token exfiltration via a crafted
/// public key. Callers MUST still check [`is_authenticated_user_info`].
pub async fn fetch_user_data(
    client: &reqwest::Client,
    identity_host: &str,
    environment_id: &str,
    token: &str,
) -> Result<UserInfoResponse, IdentityError> {
    let safe_host = assert_trusted_identity_host(identity_host)?;
    let encoded_env = utf8_percent_encode_path(environment_id);
    let url = format!("{safe_host}/oidc/{encoded_env}/userinfo");

    let response = client
        .get(&url)
        .header("authorization", format!("Bearer {token}"))
        .send()
        .await?;

    if !response.status().is_success() {
        return Err(IdentityError::Status(response.status().as_u16()));
    }

    Ok(response.json::<UserInfoResponse>().await?)
}

/// Returns true only when the userinfo envelope represents a genuinely
/// authenticated user (`meta.code == 200` with a `user`).
pub fn is_authenticated_user_info(data: &UserInfoResponse) -> bool {
    matches!(data.meta.as_ref().and_then(|m| m.code), Some(200))
        && data.user.as_ref().is_some_and(|u| !u.is_null())
}

/// Percent-encode a single path segment (alnum and `-._~` pass through).
fn utf8_percent_encode_path(segment: &str) -> String {
    let mut out = String::with_capacity(segment.len());
    for b in segment.bytes() {
        if b.is_ascii_alphanumeric() || matches!(b, b'-' | b'_' | b'.' | b'~') {
            out.push(b as char);
        } else {
            out.push_str(&format!("%{b:02X}"));
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    fn parse(json: &str) -> UserInfoResponse {
        serde_json::from_str(json).unwrap()
    }

    #[test]
    fn authenticated_only_on_success_envelope() {
        assert!(is_authenticated_user_info(&parse(
            r#"{"meta":{"code":200},"user":{"id":"u1"}}"#
        )));
        assert!(!is_authenticated_user_info(&parse(r#"{"meta":{"code":401}}"#)));
        assert!(!is_authenticated_user_info(&parse(
            r#"{"meta":{"code":200}}"#
        )));
    }

    #[test]
    fn encodes_env_segment() {
        assert_eq!(utf8_percent_encode_path("env/../x"), "env%2F..%2Fx");
    }
}
