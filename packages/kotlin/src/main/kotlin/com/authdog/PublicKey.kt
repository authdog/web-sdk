package com.authdog

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.net.InetAddress
import java.net.URI
import java.util.Base64

/**
 * Public-key decoding and trusted identity-host validation.
 *
 * This mirrors `@authdog/node-commons` and the Rust/Python SDKs so every
 * framework binding shares the same base64/JSON decoding and the same SSRF /
 * token-exfiltration guard.
 */

/** Hosts the SDK is allowed to send the bearer token to. */
private val DEFAULT_ALLOWED_HOST_SUFFIXES = listOf("authdog.com", "authdog.xyz")

private val lenientJson = Json { ignoreUnknownKeys = true }

/** Raised for any malformed or untrusted public key / identity host. */
class PublicKeyException(message: String) : RuntimeException(message)

/** Decoded contents of an Authdog public key. */
@Serializable
data class PublicKeyPayload(
    @SerialName("environmentId") val environmentId: String = "",
    @SerialName("identityHost") val identityHost: String = "",
    @SerialName("version") val version: String? = null,
    @SerialName("region") val region: String? = null,
)

private fun allowedHostSuffixes(): List<String> {
    val suffixes = DEFAULT_ALLOWED_HOST_SUFFIXES.toMutableList()
    System.getenv("AUTHDOG_ALLOWED_IDENTITY_HOSTS")?.split(',')?.forEach { part ->
        val trimmed = part.trim().lowercase()
        if (trimmed.isNotEmpty()) suffixes.add(trimmed)
    }
    return suffixes
}

private fun looksLikeIpLiteral(host: String): Boolean =
    host.contains(':') || Regex("^\\d{1,3}(\\.\\d{1,3}){3}$").matches(host)

private fun isPrivateOrLoopbackHost(hostname: String): Boolean {
    val h = hostname.trim('[', ']').lowercase()
    if (h == "localhost" || h.endsWith(".localhost")) return true
    // Only resolve genuine IP literals — never trigger a DNS lookup on a name.
    if (!looksLikeIpLiteral(h)) return false
    return try {
        val addr = InetAddress.getByName(h)
        if (addr.isLoopbackAddress || addr.isAnyLocalAddress ||
            addr.isLinkLocalAddress || addr.isSiteLocalAddress
        ) {
            return true
        }
        val bytes = addr.address
        when (bytes.size) {
            // 255.255.255.255 broadcast
            4 -> bytes.all { it.toInt() == -1 }
            // unique-local fc00::/7
            16 -> (bytes[0].toInt() and 0xfe) == 0xfc
            else -> false
        }
    } catch (_: Exception) {
        false
    }
}

/**
 * Validate that [identityHost] is safe to send credentials to: a well-formed
 * `https:` URL whose hostname is on the allowlist and is not a private/loopback
 * address. Returns the host with trailing slashes stripped.
 */
fun assertTrustedIdentityHost(identityHost: String): String {
    val url = try {
        URI(identityHost)
    } catch (_: Exception) {
        throw PublicKeyException("invalid identity host")
    }

    if (url.scheme?.lowercase() != "https") {
        throw PublicKeyException("identity host must use https")
    }
    val hostname = url.host?.lowercase() ?: throw PublicKeyException("invalid identity host")

    if (isPrivateOrLoopbackHost(hostname)) {
        throw PublicKeyException("untrusted identity host")
    }

    val allowed = allowedHostSuffixes().any { hostname == it || hostname.endsWith(".$it") }
    if (!allowed) {
        throw PublicKeyException("untrusted identity host")
    }

    return identityHost.trimEnd('/')
}

/** Decode and fully validate an Authdog public key (`pk_…`). */
fun validateAndParsePublicKey(publicKey: String): PublicKeyPayload {
    if (publicKey.isEmpty()) throw PublicKeyException("public key is not defined")

    if (!publicKey.startsWith("pk_")) throw PublicKeyException("invalid public key")
    val raw = publicKey.removePrefix("pk_")

    val decoded = try {
        // Tolerate padded and unpadded standard base64.
        val padded = raw + "=".repeat((4 - raw.length % 4) % 4)
        Base64.getDecoder().decode(padded)
    } catch (_: Exception) {
        throw PublicKeyException("failed to parse public key")
    }

    val payload = try {
        lenientJson.decodeFromString<PublicKeyPayload>(String(decoded, Charsets.UTF_8))
    } catch (_: Exception) {
        throw PublicKeyException("failed to parse public key")
    }

    if (payload.environmentId.isEmpty()) {
        throw PublicKeyException("invalid public key: missing environmentId")
    }
    if (payload.identityHost.isEmpty()) {
        throw PublicKeyException("invalid public key: missing identityHost")
    }

    return payload.copy(identityHost = assertTrustedIdentityHost(payload.identityHost))
}
