package com.authdog

import io.ktor.client.HttpClient
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.statement.bodyAsText
import io.ktor.http.HttpHeaders
import io.ktor.http.isSuccess
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.intOrNull
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

/** Identity-provider (OIDC `userinfo`) lookups. */

private val lenientJson = Json { ignoreUnknownKeys = true }

/** Raised when the userinfo request itself fails (network / non-2xx status). */
class IdentityException(message: String) : RuntimeException(message)

/**
 * Decoded OIDC `userinfo` envelope. The full object is retained as [raw] so
 * callers can read provider-specific fields.
 */
class UserInfoResponse(val raw: JsonObject) {
    val user: JsonElement?
        get() = raw["user"]

    val metaCode: Int?
        get() = (raw["meta"] as? JsonObject)?.get("code")?.jsonPrimitive?.intOrNull
}

/**
 * Fetch user data from the identity host's OIDC `userinfo` endpoint.
 *
 * [identityHost] is re-validated against the trusted-host allowlist before the
 * bearer token is sent, preventing SSRF / token exfiltration via a crafted
 * public key. Callers MUST still check [isAuthenticatedUserInfo].
 */
suspend fun fetchUserData(
    client: HttpClient,
    identityHost: String,
    environmentId: String,
    token: String,
): UserInfoResponse {
    val safeHost = assertTrustedIdentityHost(identityHost)
    val encodedEnv = percentEncodePathSegment(environmentId)
    val url = "$safeHost/oidc/$encodedEnv/userinfo"

    val response = client.get(url) {
        header(HttpHeaders.Authorization, "Bearer $token")
    }

    if (!response.status.isSuccess()) {
        throw IdentityException("failed to fetch user info (status ${response.status.value})")
    }

    val obj = lenientJson.parseToJsonElement(response.bodyAsText()).jsonObject
    return UserInfoResponse(obj)
}

/**
 * Returns true only when the userinfo envelope represents a genuinely
 * authenticated user (`meta.code == 200` with a non-null `user`).
 */
fun isAuthenticatedUserInfo(data: UserInfoResponse): Boolean {
    val user = data.user
    return data.metaCode == 200 && user != null && user !is JsonNull
}

/** Percent-encode a single path segment (alnum and `-._~` pass through). */
private fun percentEncodePathSegment(segment: String): String {
    val out = StringBuilder(segment.length)
    for (b in segment.toByteArray(Charsets.UTF_8)) {
        val c = (b.toInt() and 0xff).toChar()
        if (c in 'a'..'z' || c in 'A'..'Z' || c in '0'..'9' || c == '-' || c == '_' || c == '.' || c == '~') {
            out.append(c)
        } else {
            out.append('%').append("%02X".format(b.toInt() and 0xff))
        }
    }
    return out.toString()
}
