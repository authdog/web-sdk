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
import java.io.IOException;

/**
 * Attaches the Authdog session to the request. Never blocks — pair it with {@link
 * RequireAuthFilter} on routes that must be signed in.
 */
public final class AuthdogFilter implements Filter {
    private Authdog authdog;

    public AuthdogFilter() {}

    public AuthdogFilter(Authdog authdog) {
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
            throw new ServletException("AuthdogFilter is not initialized");
        }
        HttpServletRequest req = (HttpServletRequest) request;
        AuthdogContext ctx = authdog.resolve(req.getHeader("Authorization"), req.getHeader("Cookie"));
        req.setAttribute(Authdog.CONTEXT_ATTRIBUTE, ctx);
        chain.doFilter(request, response);
    }
}
