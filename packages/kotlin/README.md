# authdog-ktor

Authdog SDK for [Ktor](https://ktor.io) — session resolution, an auth gate, and
a logout handler.

It mirrors the TypeScript (`@authdog/express` / `@authdog/fastify`), Python
(`authdog-fastapi`), and Rust (`authdog-axum`) SDKs on the wire — the same
`authdog-session` cookie, the same OIDC `userinfo` flow, and the same trusted
identity-host allowlist — so one Authdog environment serves Node, Python, Rust,
and Kotlin services interchangeably.

## Install

Published to Maven Central as `com.authdog:authdog-ktor`.

```kotlin
// build.gradle.kts
dependencies {
    implementation("com.authdog:authdog-ktor:0.1.0")
}
```

## Usage

```kotlin
import com.authdog.Authdog
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.module() {
    val authdog = Authdog(System.getenv("PK_AUTHDOG"))

    routing {
        // Read the (possibly anonymous) session.
        get("/session") {
            val ctx = authdog.resolve(call)
            call.respondText(if (ctx.isAuthenticated) "signed in" else "anonymous")
        }

        // Gate a protected route. requireAuth responds 401 and returns null
        // when there is no valid session, so `?: return@get` halts the handler.
        get("/me") {
            val ctx = authdog.requireAuth(call) ?: return@get
            call.respondText(ctx.user.toString())
        }

        // Clear the session cookie and redirect to a sanitized ?redirect_uri.
        get("/logout") { authdog.logout(call) }
    }
}
```

`Authdog(publicKey)` validates and parses the public key once at construction —
enforcing the trusted identity-host allowlist — so a malformed or untrusted key
fails fast at startup rather than per request.

### Configuration

| Setting | Default | Notes |
| --- | --- | --- |
| `fetchUser` | `true` | When `false`, `resolve` surfaces the token but leaves `isAuthenticated` false — you validate it yourself. |
| `client` | `HttpClient(CIO)` | Inject a Ktor `HttpClient` for the `userinfo` lookup (useful in tests with `MockEngine`). |
| `AUTHDOG_ALLOWED_IDENTITY_HOSTS` env | — | Comma-separated extra host suffixes added to the `authdog.com` / `authdog.xyz` allowlist. |

A failed or untrusted `userinfo` lookup is treated as "not authenticated" —
never an error response and never an authenticated session.

## Develop

```bash
gradle build   # compile + test
gradle test    # tests only
```
