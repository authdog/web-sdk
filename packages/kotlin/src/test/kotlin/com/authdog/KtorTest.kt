package com.authdog

import io.ktor.client.HttpClient
import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.respond
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.statement.bodyAsText
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.headersOf
import io.ktor.server.application.call
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import io.ktor.server.testing.testApplication
import java.util.Base64
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

private fun makePk(): String {
    val json = """{"environmentId":"env_1","identityHost":"https://id.authdog.com"}"""
    return "pk_" + Base64.getEncoder().encodeToString(json.toByteArray(Charsets.UTF_8))
}

private fun userinfoClient(body: String) = HttpClient(MockEngine) {
    engine {
        addHandler {
            respond(
                content = body,
                status = HttpStatusCode.OK,
                headers = headersOf(HttpHeaders.ContentType, "application/json"),
            )
        }
    }
}

class KtorTest {
    @Test
    fun anonymousRequestIsUnauthorized() = testApplication {
        val authdog = Authdog(makePk(), client = userinfoClient("""{"meta":{"code":401}}"""))
        routing {
            get("/me") {
                val ctx = authdog.requireAuth(call) ?: return@get
                call.respondText(ctx.token ?: "")
            }
        }
        val res = client.get("/me")
        assertEquals(HttpStatusCode.Unauthorized, res.status)
        assertTrue(res.bodyAsText().contains("Unauthorized"))
    }

    @Test
    fun authenticatedRequestPassesGate() = testApplication {
        val authdog = Authdog(
            makePk(),
            client = userinfoClient("""{"meta":{"code":200},"user":{"id":"u1"}}"""),
        )
        routing {
            get("/me") {
                val ctx = authdog.requireAuth(call) ?: return@get
                call.respondText(ctx.user.toString())
            }
        }
        val res = client.get("/me") { header(HttpHeaders.Cookie, "authdog-session=tok") }
        assertEquals(HttpStatusCode.OK, res.status)
        assertTrue(res.bodyAsText().contains("u1"))
    }

    @Test
    fun logoutClearsCookieAndRedirects() = testApplication {
        val authdog = Authdog(makePk(), client = userinfoClient("{}"))
        routing {
            get("/logout") { authdog.logout(call) }
        }
        val noRedirect = createClient { followRedirects = false }
        val res = noRedirect.get("/logout?redirect_uri=/dashboard")
        assertEquals(HttpStatusCode.Found, res.status)
        assertEquals("/dashboard", res.headers[HttpHeaders.Location])
        val setCookie = res.headers[HttpHeaders.SetCookie]
        assertNotNull(setCookie)
        assertTrue(setCookie.contains("$SESSION_COOKIE_NAME="))
    }

    @Test
    fun logoutRejectsOpenRedirect() = testApplication {
        val authdog = Authdog(makePk(), client = userinfoClient("{}"))
        routing {
            get("/logout") { authdog.logout(call) }
        }
        val noRedirect = createClient { followRedirects = false }
        val res = noRedirect.get("/logout?redirect_uri=https://evil.com")
        assertEquals("/", res.headers[HttpHeaders.Location])
    }
}
