//! Public-key decoding and trusted identity-host validation.
//!
//! This is the single source of truth for parsing Authdog public keys (`pk_…`)
//! in Rust — it mirrors `@authdog/node-commons` so every framework SDK shares
//! the same base64/JSON decoding and the same SSRF / token-exfiltration guard.

use std::net::IpAddr;

use base64::Engine;
use serde::Deserialize;
use thiserror::Error;
use url::Url;

/// Hosts the SDK is allowed to send the bearer token to. The identity host is
/// decoded from the (potentially attacker-influenced) public key, so it MUST be
/// validated against this allowlist before it is ever used as a request target.
const DEFAULT_ALLOWED_HOST_SUFFIXES: &[&str] = &["authdog.com", "authdog.xyz"];

#[derive(Debug, Error, PartialEq, Eq)]
pub enum PublicKeyError {
    #[error("public key is not defined")]
    Missing,
    #[error("invalid public key")]
    Invalid,
    #[error("failed to parse public key")]
    Parse,
    #[error("invalid public key: missing {0}")]
    MissingField(&'static str),
    #[error("invalid identity host")]
    InvalidHost,
    #[error("identity host must use https")]
    NotHttps,
    #[error("untrusted identity host")]
    UntrustedHost,
}

/// Decoded contents of an Authdog public key.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize)]
pub struct PublicKeyPayload {
    #[serde(rename = "environmentId")]
    pub environment_id: String,
    #[serde(rename = "identityHost")]
    pub identity_host: String,
    #[serde(default)]
    pub version: Option<String>,
    #[serde(default)]
    pub region: Option<String>,
}

fn is_private_or_loopback_host(hostname: &str) -> bool {
    let h = hostname
        .trim_matches(|c| c == '[' || c == ']')
        .to_ascii_lowercase();
    if h == "localhost" || h.ends_with(".localhost") {
        return true;
    }
    match h.parse::<IpAddr>() {
        Ok(IpAddr::V4(ip)) => {
            ip.is_private()
                || ip.is_loopback()
                || ip.is_link_local()
                || ip.is_unspecified()
                || ip.is_broadcast()
        }
        Ok(IpAddr::V6(ip)) => {
            ip.is_loopback()
                || ip.is_unspecified()
                // unique-local (fc00::/7) — no stable std helper, check the prefix.
                || (ip.segments()[0] & 0xfe00) == 0xfc00
                // link-local (fe80::/10)
                || (ip.segments()[0] & 0xffc0) == 0xfe80
        }
        Err(_) => false,
    }
}

fn allowed_host_suffixes() -> Vec<String> {
    let mut suffixes: Vec<String> = DEFAULT_ALLOWED_HOST_SUFFIXES
        .iter()
        .map(|s| s.to_string())
        .collect();
    if let Ok(extra) = std::env::var("AUTHDOG_ALLOWED_IDENTITY_HOSTS") {
        for part in extra.split(',') {
            let trimmed = part.trim().to_ascii_lowercase();
            if !trimmed.is_empty() {
                suffixes.push(trimmed);
            }
        }
    }
    suffixes
}

/// Validate that `identity_host` is safe to send credentials to: a well-formed
/// `https:` URL whose hostname is on the allowlist and is not a private/loopback
/// address. Returns the host with trailing slashes stripped.
pub fn assert_trusted_identity_host(identity_host: &str) -> Result<String, PublicKeyError> {
    let url = Url::parse(identity_host).map_err(|_| PublicKeyError::InvalidHost)?;

    if url.scheme() != "https" {
        return Err(PublicKeyError::NotHttps);
    }
    let hostname = url
        .host_str()
        .ok_or(PublicKeyError::InvalidHost)?
        .to_ascii_lowercase();

    if is_private_or_loopback_host(&hostname) {
        return Err(PublicKeyError::UntrustedHost);
    }

    let allowed = allowed_host_suffixes()
        .iter()
        .any(|suffix| hostname == *suffix || hostname.ends_with(&format!(".{suffix}")));
    if !allowed {
        return Err(PublicKeyError::UntrustedHost);
    }

    Ok(identity_host.trim_end_matches('/').to_string())
}

/// Decode and fully validate an Authdog public key (`pk_…`).
pub fn validate_and_parse_public_key(public_key: &str) -> Result<PublicKeyPayload, PublicKeyError> {
    if public_key.is_empty() {
        return Err(PublicKeyError::Missing);
    }
    let raw = public_key
        .strip_prefix("pk_")
        .ok_or(PublicKeyError::Invalid)?;

    // Tolerate padded and unpadded standard base64.
    let decoded = base64::engine::general_purpose::STANDARD
        .decode(raw)
        .or_else(|_| base64::engine::general_purpose::STANDARD_NO_PAD.decode(raw))
        .map_err(|_| PublicKeyError::Parse)?;

    let mut payload: PublicKeyPayload =
        serde_json::from_slice(&decoded).map_err(|_| PublicKeyError::Parse)?;

    if payload.environment_id.is_empty() {
        return Err(PublicKeyError::MissingField("environmentId"));
    }
    if payload.identity_host.is_empty() {
        return Err(PublicKeyError::MissingField("identityHost"));
    }

    payload.identity_host = assert_trusted_identity_host(&payload.identity_host)?;
    Ok(payload)
}

#[cfg(test)]
mod tests {
    use super::*;
    use base64::Engine;

    fn make_pk(json: &str) -> String {
        format!(
            "pk_{}",
            base64::engine::general_purpose::STANDARD.encode(json)
        )
    }

    #[test]
    fn parses_valid_key_and_trims_host() {
        let pk = make_pk(r#"{"environmentId":"env_1","identityHost":"https://id.authdog.com/"}"#);
        let p = validate_and_parse_public_key(&pk).unwrap();
        assert_eq!(p.environment_id, "env_1");
        assert_eq!(p.identity_host, "https://id.authdog.com");
    }

    #[test]
    fn rejects_bad_keys() {
        assert!(validate_and_parse_public_key("").is_err());
        assert!(validate_and_parse_public_key("sk_abc").is_err());
        assert!(validate_and_parse_public_key("pk_!!!notbase64").is_err());
        let pk = make_pk(r#"{"identityHost":"https://id.authdog.com"}"#);
        assert!(validate_and_parse_public_key(&pk).is_err());
    }

    #[test]
    fn rejects_untrusted_hosts() {
        for host in [
            "http://id.authdog.com",
            "https://id.evil.com",
            "https://localhost",
            "https://127.0.0.1",
            "https://169.254.169.254",
            "https://10.0.0.5",
            "https://authdog.com.evil.com",
        ] {
            assert!(
                assert_trusted_identity_host(host).is_err(),
                "{host} should be rejected"
            );
        }
    }

    #[test]
    fn accepts_allowlisted_hosts() {
        assert_eq!(
            assert_trusted_identity_host("https://id.authdog.xyz").unwrap(),
            "https://id.authdog.xyz"
        );
        assert_eq!(
            assert_trusted_identity_host("https://authdog.com").unwrap(),
            "https://authdog.com"
        );
    }
}
