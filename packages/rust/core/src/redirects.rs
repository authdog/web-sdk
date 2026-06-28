//! Open-redirect protection for logout / post-auth redirects.

/// Return a safe, same-origin redirect target, falling back to `fallback`
/// (use `"/"` for the default) for anything that could be an open redirect.
///
/// Only relative paths are allowed. A value is rejected if it is empty, is
/// protocol-relative (`//` or `/\`), contains a scheme, or contains a
/// backslash / control character a browser might normalize to `/`.
pub fn sanitize_redirect_path(target: Option<&str>, fallback: &str) -> String {
    let Some(target) = target.filter(|t| !t.is_empty()) else {
        return fallback.to_string();
    };

    if !target.starts_with('/') || target.starts_with("//") || target.starts_with("/\\") {
        return fallback.to_string();
    }

    if target.bytes().any(|b| b == b'\\' || b.is_ascii_control()) {
        return fallback.to_string();
    }

    if has_scheme(target) {
        return fallback.to_string();
    }

    target.to_string()
}

/// Matches a leading URL scheme like `^[a-z][a-z0-9+.-]*:` (case-insensitive).
fn has_scheme(s: &str) -> bool {
    let mut chars = s.chars();
    match chars.next() {
        Some(c) if c.is_ascii_alphabetic() => {}
        _ => return false,
    }
    for c in chars {
        if c == ':' {
            return true;
        }
        if !(c.is_ascii_alphanumeric() || c == '+' || c == '.' || c == '-') {
            return false;
        }
    }
    false
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn allows_relative_paths() {
        assert_eq!(
            sanitize_redirect_path(Some("/dashboard"), "/"),
            "/dashboard"
        );
        assert_eq!(sanitize_redirect_path(Some("/a/b?x=1"), "/"), "/a/b?x=1");
    }

    #[test]
    fn rejects_open_redirects() {
        for bad in [
            "//evil.com",
            "/\\evil.com",
            "https://evil.com",
            "javascript:alert(1)",
            "",
            "/\tfoo",
        ] {
            assert_eq!(sanitize_redirect_path(Some(bad), "/"), "/", "{bad}");
        }
        assert_eq!(sanitize_redirect_path(None, "/"), "/");
    }
}
