package com.authdog;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.authdog.servlet.AuthdogFilter;
import com.authdog.servlet.LogoutServlet;
import com.authdog.servlet.RequireAuthFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class AuthdogTest {
    private static String makePk() {
        String json = "{\"environmentId\":\"env_1\",\"identityHost\":\"https://id.authdog.com\"}";
        return "pk_" + Base64.getEncoder().encodeToString(json.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void resolveTreatsFailuresAsAnonymous() {
        Authdog authdog = new Authdog(makePk(), true, (url, token) -> {
            throw new IllegalStateException("down");
        });
        AuthdogContext ctx = authdog.resolve("Bearer aaa.bbb.ccc", null);
        assertEquals("aaa.bbb.ccc", ctx.token());
        assertFalse(ctx.authenticated());
    }

    @Test
    void requireAuthRejectsAUserinfoMiss() {
        Authdog authdog = new Authdog(makePk(), true, (url, token) -> "{\"meta\":{\"code\":401}}");
        Authdog.Gate gate = authdog.requireAuth("Bearer aaa.bbb.ccc", null);
        assertFalse(gate.authenticated());
        assertEquals(401, gate.status());
        assertEquals("{\"error\":\"Unauthorized\"}", gate.body());
    }

    @Test
    void requireAuthAcceptsAnAuthenticatedEnvelope() {
        Authdog authdog = new Authdog(
                makePk(),
                true,
                (url, token) -> {
                    assertTrue(url.startsWith("https://id.authdog.com/oidc/env_1/userinfo"));
                    assertEquals("aaa.bbb.ccc", token);
                    return "{\"meta\":{\"code\":200},\"user\":{\"id\":\"u1\"}}";
                });
        Authdog.Gate gate = authdog.requireAuth(null, "authdog-session=aaa.bbb.ccc");
        assertTrue(gate.authenticated());
        assertEquals("u1", ((org.json.JSONObject) gate.context().user()).getString("id"));
    }

    @Test
    void logoutSanitizesTheRedirect() {
        Authdog authdog = new Authdog(makePk(), false, null);
        Authdog.Logout logout = authdog.logout("//evil.com");
        assertEquals("/", logout.location());
        assertTrue(logout.setCookie().startsWith("authdog-session=;"));
        assertTrue(logout.setCookie().contains("HttpOnly;"));
        assertTrue(logout.setCookie().contains("SameSite=Lax"));
    }

    @Test
    void attachFilterDoesNotBlockAnonymousRequests() throws Exception {
        Authdog authdog = new Authdog(makePk(), true, (url, token) -> "{}");
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        FilterChain chain = Mockito.mock(FilterChain.class);
        when(request.getHeader("Authorization")).thenReturn(null);
        when(request.getHeader("Cookie")).thenReturn(null);

        new AuthdogFilter(authdog).doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
        verify(request).setAttribute(Mockito.eq(Authdog.CONTEXT_ATTRIBUTE), Mockito.any(AuthdogContext.class));
    }

    @Test
    void requireAuthFilterWrites401() throws Exception {
        Authdog authdog = new Authdog(makePk(), true, (url, token) -> "{\"meta\":{\"code\":401}}");
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        FilterChain chain = Mockito.mock(FilterChain.class);
        StringWriter body = new StringWriter();
        when(request.getHeader("Authorization")).thenReturn("Bearer aaa.bbb.ccc");
        when(request.getAttribute(Authdog.CONTEXT_ATTRIBUTE)).thenReturn(null);
        when(response.getWriter()).thenReturn(new PrintWriter(body));

        new RequireAuthFilter(authdog).doFilter(request, response, chain);

        verify(response).setStatus(401);
        verify(chain, never()).doFilter(request, response);
        assertTrue(body.toString().contains("Unauthorized"));
    }

    @Test
    void logoutServletExpiresTheCookieAndRedirectsHome() throws Exception {
        Authdog authdog = new Authdog(makePk(), false, null);
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        when(request.getParameter("redirect_uri")).thenReturn("https://evil.com");

        new LogoutServlet(authdog).doGet(request, response);

        verify(response).setHeader(Mockito.eq("Set-Cookie"), Mockito.contains("authdog-session="));
        verify(response).sendRedirect("/");
        assertNull(response.getHeader("Location"));
    }
}
