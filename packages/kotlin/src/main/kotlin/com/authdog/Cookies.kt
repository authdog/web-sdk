package com.authdog

import java.io.ByteArrayOutputStream

/** Cookie parsing and session-token extraction. */

/** Name of the cookie that carries the Authdog session token. */
const val SESSION_COOKIE_NAME = "authdog-session"

/**
 * Parse a `Cookie` request header into `(name, value)` pairs.
 *
 * Each pair is split on the FIRST `=` only — cookie values routinely contain
 * `=` (base64 padding, JWTs), and a naive split would silently truncate the
 * value and corrupt the session token. Values are percent-decoded to mirror the
 * `encodeURIComponent` used when the cookie is written.
 */
fun parseCookies(cookieHeader: String): List<Pair<String, String>> =
    cookieHeader.split(';').mapNotNull { part ->
        val trimmed = part.trim()
        val idx = trimmed.indexOf('=')
        if (idx <= 0) return@mapNotNull null
        val name = trimmed.substring(0, idx).trim()
        if (name.isEmpty()) return@mapNotNull null
        val value = percentDecode(trimmed.substring(idx + 1).trim())
        name to value
    }

/**
 * Extract the session token, preferring an explicit `Authorization: Bearer
 * <token>` header over the `authdog-session` cookie.
 */
fun getSessionToken(authorization: String?, cookieHeader: String?): String? {
    if (authorization != null) {
        val rest = stripBearerPrefix(authorization)
        if (rest != null) {
            val token = rest.trim()
            if (token.isNotEmpty()) return token
        }
    }
    val header = cookieHeader ?: return null
    return parseCookies(header).firstOrNull { it.first == SESSION_COOKIE_NAME }?.second
}

private fun stripBearerPrefix(s: String): String? {
    val prefix = "bearer "
    return if (s.length >= prefix.length && s.substring(0, prefix.length).lowercase() == prefix) {
        s.substring(prefix.length)
    } else {
        null
    }
}

/** Minimal `%XX` percent-decoder. Leaves invalid sequences untouched. */
private fun percentDecode(input: String): String {
    val bytes = input.toByteArray(Charsets.UTF_8)
    val out = ByteArrayOutputStream(bytes.size)
    var i = 0
    while (i < bytes.size) {
        if (bytes[i] == '%'.code.toByte() && i + 2 < bytes.size) {
            val hi = Character.digit((bytes[i + 1].toInt() and 0xff).toChar(), 16)
            val lo = Character.digit((bytes[i + 2].toInt() and 0xff).toChar(), 16)
            if (hi >= 0 && lo >= 0) {
                out.write(hi * 16 + lo)
                i += 3
                continue
            }
        }
        out.write(bytes[i].toInt())
        i++
    }
    return out.toString(Charsets.UTF_8)
}
