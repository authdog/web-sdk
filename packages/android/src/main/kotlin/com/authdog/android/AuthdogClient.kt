package com.authdog.android

import com.authdog.PublicKeyException
import com.authdog.PublicKeyPayload
import com.authdog.assertTrustedIdentityHost
import com.authdog.validateAndParsePublicKey
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.intOrNull
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import java.net.HttpURLConnection
import java.net.URI

private val userInfoJson = Json { ignoreUnknownKeys = true }

/** Pluggable token store. Wire this to EncryptedSharedPreferences on Android. */
interface TokenStorage {
    fun getItem(key: String): String?
    fun setItem(key: String, value: String)
    fun removeItem(key: String)
}

/** Opens a URL. Wire this to Chrome Custom Tabs on Android. */
fun interface UrlOpener {
    fun open(url: String)
}

fun interface UserInfoFetcher {
    fun fetch(url: String, bearerToken: String): String
}

/**
 * Authdog client for native Android apps.
 *
 * Sign-in opens the system browser and returns via a deep link. The public key
 * is validated once — an untrusted identity host fails fast. Protocol helpers
 * (`validateAndParsePublicKey`, the host allowlist) come from the Kotlin core.
 */
class AuthdogClient(
    publicKey: String,
    private val redirectUri: String,
    private val openUrl: UrlOpener,
    private val storage: TokenStorage,
    private val storageKey: String = TOKEN_STORAGE_KEY,
    private val fetcher: UserInfoFetcher = UserInfoFetcher { url, token -> httpGet(url, token) },
) {
    private val payload: PublicKeyPayload = validateAndParsePublicKey(publicKey)
    private val publicKey: String = publicKey

    init {
        if (redirectUri.isEmpty()) throw PublicKeyException("redirectUri is not defined")
    }

    fun getToken(): String? = storage.getItem(storageKey)

    /** Token presence only — not a server-side authorization check. */
    fun isAuthenticated(): Boolean = getToken() != null

    fun signIn(prompt: String? = null) {
        openUrl.open(buildAuthorizeUrl(payload, publicKey, redirectUri, prompt))
    }

    fun signUp() = signIn("signup")

    fun handleCallback(callbackUrl: String): String? {
        val token = extractTokenFromRedirect(callbackUrl) ?: return null
        if (!isJwtShaped(token)) return null
        storage.setItem(storageKey, token)
        return token
    }

    fun signOut() {
        storage.removeItem(storageKey)
    }

    /** User from `userinfo`, or null. Never throws. */
    fun getUser(): JsonObject? {
        val token = getToken() ?: return null
        return try {
            val url = userInfoUrl(payload)
            val body = fetcher.fetch(url, token)
            val obj = userInfoJson.parseToJsonElement(body).jsonObject
            val code = (obj["meta"] as? JsonObject)?.get("code")?.jsonPrimitive?.intOrNull
            val user = obj["user"]
            if (code == 200 && user is JsonObject) user else null
        } catch (_: Exception) {
            null
        }
    }

    fun getPublicKeyPayload(): PublicKeyPayload = payload

    private fun userInfoUrl(payload: PublicKeyPayload): String {
        val host = assertTrustedIdentityHost(payload.identityHost)
        val env = java.net.URLEncoder.encode(payload.environmentId, Charsets.UTF_8).replace("+", "%20")
        return "$host/oidc/$env/userinfo"
    }
}

private fun httpGet(url: String, bearerToken: String): String {
    val connection = URI(url).toURL().openConnection() as HttpURLConnection
    connection.requestMethod = "GET"
    connection.setRequestProperty("Authorization", "Bearer $bearerToken")
    connection.connectTimeout = 10_000
    connection.readTimeout = 10_000
    try {
        val code = connection.responseCode
        if (code !in 200..299) error("failed to fetch user info (status $code)")
        return connection.inputStream.bufferedReader().readText()
    } finally {
        connection.disconnect()
    }
}
