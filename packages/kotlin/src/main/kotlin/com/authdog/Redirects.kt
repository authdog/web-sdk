package com.authdog

/** Open-redirect protection for logout / post-auth redirects. */

/**
 * Return a safe, same-origin redirect target, falling back to [fallback] (use
 * `"/"` for the default) for anything that could be an open redirect.
 *
 * Only relative paths are allowed. A value is rejected if it is null/empty, is
 * protocol-relative (`//` or `/\`), contains a scheme, or contains a backslash
 * / control character a browser might normalize to `/`.
 */
fun sanitizeRedirectPath(target: String?, fallback: String): String {
    if (target.isNullOrEmpty()) return fallback

    if (!target.startsWith("/") || target.startsWith("//") || target.startsWith("/\\")) {
        return fallback
    }

    if (target.any { it == '\\' || it.code < 0x20 || it.code == 0x7f }) {
        return fallback
    }

    if (hasScheme(target)) return fallback

    return target
}

/** Matches a leading URL scheme like `^[a-z][a-z0-9+.-]*:` (case-insensitive). */
private fun hasScheme(s: String): Boolean {
    val first = s.firstOrNull() ?: return false
    if (!(first in 'a'..'z' || first in 'A'..'Z')) return false
    for (i in 1 until s.length) {
        val c = s[i]
        if (c == ':') return true
        val ok = c in 'a'..'z' || c in 'A'..'Z' || c in '0'..'9' || c == '+' || c == '.' || c == '-'
        if (!ok) return false
    }
    return false
}
