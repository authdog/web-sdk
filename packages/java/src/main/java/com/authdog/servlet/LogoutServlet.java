package com.authdog.servlet;

import com.authdog.Authdog;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/** Expires {@code authdog-session} and redirects to a sanitized {@code redirect_uri}. */
public final class LogoutServlet extends HttpServlet {
    private final Authdog authdog;

    public LogoutServlet(Authdog authdog) {
        this.authdog = authdog;
    }

    @Override
    public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Authdog.Logout logout = authdog.logout(req.getParameter("redirect_uri"));
        resp.setHeader("Set-Cookie", logout.setCookie());
        resp.sendRedirect(logout.location());
    }
}
