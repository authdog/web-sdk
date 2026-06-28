package com.authdog

import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.http.ContentType
import io.ktor.http.Cookie
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.respondRedirect
import io.ktor.server.response.respondText
import io.ktor.util.AttributeKey
import io.ktor.util.date.GMTDate
import kotlinx.serialization.json.JsonElement

/**
 * Ktor bindings for Authdog: session resolution, an auth gate, and a logout
 * handler.
 *
 * ```kotlin
 * val authdog = Authdog(System.getenv("PK_AUTHDOG"))
 *
 * routing {
 *     get("/me") {
 *         val ctx = authdog.requireAuth(call) ?: return@get
 *         call.respond(ctx.user!!)
 *     }
 *     get("/logout") { authdog.logout(call) }
 * }
 * ```
 *
 * It mirrors the TypeScript/Python/Rust SDKs on the wire — same
 * `authdog-session` cookie, same OIDC `userinfo` flow, and the same trusted
 * identity-host allowlist.
 */

/** Per-request authentication context resolved by [Authdog.resolve]. */
data class AuthdogContext(
    val token: String? = null,
    val user: JsonElement? = null,
    val isAuthenticated: Boolean = false,
    val userInfo: UserInfoResponse? = null,
)

/** Cached per-call so several gates resolve only one userinfo round-trip. */
private val AUTHDOG_CONTEXT_KEY = AttributeKey<AuthdogContext>("AuthdogContext")

/** The resolved context if [Authdog.resolve] already ran for this call. */
fun ApplicationCall.authdogContextOrNull(): AuthdogContext? =
    attributes.getOrNull(AUTHDOG_CONTEXT_KEY)

/**
 * A configured Authdog server instance for Ktor.
 *
 * The public key is validated and parsed once in the constructor — enforcing
 * the trusted identity-host allowlist — so a malformed or untrusted key fails
 * fast at startup rather than per request.
 *
 * @param fetchUser when `false`, [resolve] surfaces the token but leaves
 *   `isAuthenticated` false (you validate it yourself).
 * @param client optional [HttpClient] for the userinfo lookup (inject for tests).
 */
class Authdog(
    publicKey: String,
    private val fetchUser: Boolean = true,
    client: HttpClient? = null,
) {
    val payload: PublicKeyPayload = validateAndParsePublicKey(publicKey)

    private val httpClient: HttpClient by lazy { client ?: HttpClient(CIO) }

    /** Resolve (and cache) the request's [AuthdogContext]. Never throws. */
    suspend fun resolve(call: ApplicationCall): AuthdogContext {
        call.authdogContextOrNull()?.let { return it }

        val token = getSessionToken(
            call.request.headers[HttpHeaders.Authorization],
            call.request.headers[HttpHeaders.Cookie],
        )

        val ctx = when {
            token == null -> AuthdogContext()
            // Without a userinfo round-trip we cannot vouch for the token, so
            // we surface it but leave isAuthenticated false.
            !fetchUser -> AuthdogContext(token = token)
            else -> try {
                val info = fetchUserData(httpClient, payload.identityHost, payload.environmentId, token)
                if (isAuthenticatedUserInfo(info)) {
                    AuthdogContext(token = token, user = info.user, isAuthenticated = true, userInfo = info)
                } else {
                    AuthdogContext(token = token)
                }
            } catch (_: Exception) {
                // A failed or untrusted userinfo lookup is "not authenticated" —
                // never a 500 and never an authenticated session.
                AuthdogContext(token = token)
            }
        }

        call.attributes.put(AUTHDOG_CONTEXT_KEY, ctx)
        return ctx
    }

    /**
     * Gate. ⚠️ This is the real server-side enforcement point. Responds
     * `401 {"error":"Unauthorized"}` and returns `null` when not authenticated;
     * otherwise returns the resolved context. Use as `?: return@get`.
     */
    suspend fun requireAuth(call: ApplicationCall): AuthdogContext? {
        val ctx = resolve(call)
        if (!ctx.isAuthenticated) {
            call.respondText(
                """{"error":"Unauthorized"}""",
                ContentType.Application.Json,
                HttpStatusCode.Unauthorized,
            )
            return null
        }
        return ctx
    }

    /** Clear the session cookie and redirect to a safe, same-origin path. */
    suspend fun logout(call: ApplicationCall) {
        val target = sanitizeRedirectPath(call.request.queryParameters["redirect_uri"], "/")
        call.response.cookies.append(
            Cookie(
                name = SESSION_COOKIE_NAME,
                value = "",
                path = "/",
                httpOnly = true,
                maxAge = 0,
                expires = GMTDate(0L),
                extensions = mapOf("SameSite" to "Lax"),
            ),
        )
        call.respondRedirect(target, permanent = false)
    }
}
