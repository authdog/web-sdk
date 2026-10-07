package com.authdog.android

import com.authdog.PublicKeyPayload
import java.net.URI
import java.net.URLDecoder
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

/** Storage key under which the session token is persisted. */
const val TOKEN_STORAGE_KEY = "authdog_token"

private val JWT_PATTERN = Regex("^[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+$")

/** Whether a value looks like a JWT (and is therefore safe to persist). */
fun isJwtShaped(value: String): Boolean = JWT_PATTERN.matches(value)

/** Builds the OIDC authorize URL for a validated public-key payload. */
fun buildAuthorizeUrl(
    payload: PublicKeyPayload,
    publicKey: String,
    redirectUri: String,
    prompt: String? = null,
): String {
    val env = URLEncoder.encode(payload.environmentId, StandardCharsets.UTF_8).replace("+", "%20")
    val base = "${payload.identityHost}/oidc/$env/authorize"
    val query = linkedMapOf(
        "client_id" to publicKey,
        "response_type" to "code",
        "scope" to "openid profile email",
        "redirect_uri" to redirectUri,
    )
    if (prompt != null) query["prompt"] = prompt
    val qs = query.entries.joinToString("&") { (k, v) ->
        "${enc(k)}=${enc(v)}"
    }
    return "$base?$qs"
}

/**
 * Extracts `token` from a deep-link callback. The token may be in the query
 * string or the fragment. Custom schemes are normalised before parsing.
 */
fun extractTokenFromRedirect(redirectUrl: String): String? {
    val parsable = if (redirectUrl.contains("://")) {
        redirectUrl
    } else {
        redirectUrl.replace(Regex("^([a-zA-Z][a-zA-Z0-9+.-]*):/?"), "$1://")
    }
    val url = try {
        URI(parsable)
    } catch (_: Exception) {
        return null
    }
    queryParam(url.rawQuery, "token")?.let { return it }
    val fragment = url.rawFragment ?: return null
    return queryParam(fragment, "token")
}

private fun queryParam(query: String?, name: String): String? {
    if (query.isNullOrEmpty()) return null
    for (part in query.split("&")) {
        val idx = part.indexOf("=")
        if (idx <= 0) continue
        val key = URLDecoder.decode(part.substring(0, idx), StandardCharsets.UTF_8)
        if (key == name) {
            return URLDecoder.decode(part.substring(idx + 1), StandardCharsets.UTF_8)
        }
    }
    return null
}

private fun enc(value: String): String =
    URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20")
