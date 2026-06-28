//! Cookie parsing and session-token extraction.

/// Name of the cookie that carries the Authdog session token.
pub const SESSION_COOKIE_NAME: &str = "authdog-session";

/// Parse a `Cookie` request header into `(name, value)` pairs.
///
/// Each pair is split on the FIRST `=` only — cookie values routinely contain
/// `=` (base64 padding, JWTs), and a naive split would silently truncate the
/// value and corrupt the session token. Values are percent-decoded to mirror
/// the `encodeURIComponent` used when the cookie is written.
pub fn parse_cookies(cookie_header: &str) -> Vec<(String, String)> {
    cookie_header
        .split(';')
        .filter_map(|part| {
            let trimmed = part.trim();
            let idx = trimmed.find('=')?;
            if idx == 0 {
                return None;
            }
            let name = trimmed[..idx].trim();
            if name.is_empty() {
                return None;
            }
            let raw = trimmed[idx + 1..].trim();
            let value = percent_decode(raw);
            Some((name.to_string(), value))
        })
        .collect()
}

/// Extract the session token, preferring an explicit `Authorization: Bearer
/// <token>` header over the `authdog-session` cookie.
pub fn get_session_token(
    authorization: Option<&str>,
    cookie_header: Option<&str>,
) -> Option<String> {
    if let Some(auth) = authorization {
        if let Some(rest) = strip_bearer_prefix(auth) {
            let token = rest.trim();
            if !token.is_empty() {
                return Some(token.to_string());
            }
        }
    }
    let header = cookie_header?;
    parse_cookies(header)
        .into_iter()
        .find(|(name, _)| name == SESSION_COOKIE_NAME)
        .map(|(_, value)| value)
}

fn strip_bearer_prefix(s: &str) -> Option<&str> {
    let prefix = "bearer ";
    if s.len() >= prefix.len() && s[..prefix.len()].eq_ignore_ascii_case(prefix) {
        Some(&s[prefix.len()..])
    } else {
        None
    }
}

/// Minimal `%XX` percent-decoder. Leaves invalid sequences untouched.
fn percent_decode(input: &str) -> String {
    let bytes = input.as_bytes();
    let mut out: Vec<u8> = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'%' && i + 2 < bytes.len() {
            let hi = (bytes[i + 1] as char).to_digit(16);
            let lo = (bytes[i + 2] as char).to_digit(16);
            if let (Some(hi), Some(lo)) = (hi, lo) {
                out.push((hi * 16 + lo) as u8);
                i += 3;
                continue;
            }
        }
        out.push(bytes[i]);
        i += 1;
    }
    String::from_utf8(out).unwrap_or_else(|_| input.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn keeps_equals_in_value() {
        let cookies = parse_cookies("authdog-session=ab=cd==; other=1");
        assert_eq!(
            cookies[0],
            ("authdog-session".to_string(), "ab=cd==".to_string())
        );
        assert_eq!(cookies[1], ("other".to_string(), "1".to_string()));
    }

    #[test]
    fn decodes_percent_encoding() {
        let cookies = parse_cookies("k=a%20b");
        assert_eq!(cookies[0].1, "a b");
    }

    #[test]
    fn prefers_bearer_then_cookie() {
        assert_eq!(
            get_session_token(Some("Bearer abc"), Some("authdog-session=cookie")).as_deref(),
            Some("abc")
        );
        assert_eq!(
            get_session_token(None, Some("authdog-session=cookie")).as_deref(),
            Some("cookie")
        );
        assert_eq!(get_session_token(None, Some("other=1")), None);
    }
}
