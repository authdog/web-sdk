package authdog

import (
	"regexp"
	"strings"
)

var (
	schemeRe           = regexp.MustCompile(`(?i)^[a-z][a-z0-9+.-]*:`)
	controlOrBackslash = regexp.MustCompile(`[\\\x00-\x1f]`)
)

// SanitizeRedirectPath returns a safe, same-origin redirect target, falling
// back to fallback (use "/" for the default) for anything that could be an
// open redirect.
//
// Only relative paths are allowed. A value is rejected if it is empty, is
// protocol-relative ("//" or "/\"), contains a scheme, or contains a
// backslash / control character a browser might normalize to '/'.
func SanitizeRedirectPath(target, fallback string) string {
	if target == "" {
		return fallback
	}
	if !strings.HasPrefix(target, "/") ||
		strings.HasPrefix(target, "//") ||
		strings.HasPrefix(target, "/\\") {
		return fallback
	}
	if controlOrBackslash.MatchString(target) {
		return fallback
	}
	if schemeRe.MatchString(target) {
		return fallback
	}
	return target
}
