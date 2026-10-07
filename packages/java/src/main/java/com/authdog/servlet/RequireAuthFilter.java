package com.authdog.servlet;

import com.authdog.Authdog;
import com.authdog.AuthdogContext;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/** Returns {@code 401 {"error":"Unauthorized"}} unless the request is authenticated. */
public final class RequireAuthFilter implements Filter {
    private Authdog authdog;

    public RequireAuthFilter() {}

    public RequireAuthFilter(Authdog authdog) {
        this.authdog = authdog;
    }

    @Override
    public void init(FilterConfig filterConfig) {
        if (authdog != null) {
            return;
        }
        String key = filterConfig.getInitParameter("publicKey");
        if (key == null || key.isEmpty()) {
            key = System.getenv("PK_AUTHDOG");
        }
        authdog = new Authdog(key);
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        if (authdog == null) {
            throw new ServletException("RequireAuthFilter is not initialized");
        }
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;
        Object existing = req.getAttribute(Authdog.CONTEXT_ATTRIBUTE);
        AuthdogContext ctx = existing instanceof AuthdogContext
                ? (AuthdogContext) existing
                : authdog.resolve(req.getHeader("Authorization"), req.getHeader("Cookie"));
        req.setAttribute(Authdog.CONTEXT_ATTRIBUTE, ctx);
        if (!ctx.authenticated()) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            res.setContentType("application/json");
            res.getWriter().write("{\"error\":\"Unauthorized\"}");
            return;
        }
        chain.doFilter(request, response);
    }
}
