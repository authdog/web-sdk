package authdog

import (
	"net/url"
	"strings"
)

// SessionCookieName is the name of the cookie that carries the Authdog session
// token.
const SessionCookieName = "authdog-session"

// ParseCookies parses a Cookie request header into a name → value map.
//
// Each pair is split on the FIRST '=' only — cookie values routinely contain
// '=' (base64 padding, JWTs), and a naive split would silently truncate the
// value and corrupt the session token. Values are URL-decoded to mirror the
// encodeURIComponent used when the cookie is written.
func ParseCookies(cookieHeader string) map[string]string {
	cookies := map[string]string{}
	if cookieHeader == "" {
		return cookies
	}
	for _, part := range strings.Split(cookieHeader, ";") {
		trimmed := strings.TrimSpace(part)
		idx := strings.Index(trimmed, "=")
		if idx <= 0 {
			continue
		}
		name := strings.TrimSpace(trimmed[:idx])
		if name == "" {
			continue
		}
		value := strings.TrimSpace(trimmed[idx+1:])
		if decoded, err := url.QueryUnescape(value); err == nil {
			value = decoded
		}
		cookies[name] = value
	}
	return cookies
}

// GetSessionToken extracts the session token, preferring an explicit
// "Authorization: Bearer <token>" header over the authdog-session cookie.
func GetSessionToken(authorization, cookieHeader string) string {
	if authorization != "" {
		if rest, ok := cutBearerPrefix(authorization); ok {
			if token := strings.TrimSpace(rest); token != "" {
				return token
			}
		}
	}
	return ParseCookies(cookieHeader)[SessionCookieName]
}

func cutBearerPrefix(s string) (string, bool) {
	const prefix = "bearer "
	if len(s) >= len(prefix) && strings.EqualFold(s[:len(prefix)], prefix) {
		return s[len(prefix):], true
	}
	return "", false
}
