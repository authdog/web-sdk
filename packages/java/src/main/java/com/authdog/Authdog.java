package com.authdog;

import org.json.JSONObject;

/**
 * Authdog session resolver for Java servers.
 *
 * <p>The public key is validated once at construction. {@link #resolve} never throws: a missing
 * token or a failed userinfo lookup is an anonymous context. {@link #requireAuth} is the gate.
 */
public final class Authdog {
    public static final String CONTEXT_ATTRIBUTE = "authdog.context";

    private final PublicKeyPayload payload;
    private final boolean fetchUser;
    private final UserInfoFetcher fetcher;

    public Authdog(String publicKey) {
        this(publicKey, true, null);
    }

    public Authdog(String publicKey, boolean fetchUser, UserInfoFetcher fetcher) {
        if (publicKey == null || publicKey.isEmpty()) {
            throw new PublicKeyException("Public key is not defined");
        }
        this.payload = PublicKeys.validateAndParsePublicKey(publicKey);
        this.fetchUser = fetchUser;
        this.fetcher = fetcher == null ? Identity::fetch : fetcher;
    }

    public PublicKeyPayload payload() {
        return payload;
    }

    /** Resolve the request. Never throws. */
    public AuthdogContext resolve(String authorization, String cookieHeader) {
        String token = Cookies.getSessionToken(authorization, cookieHeader);
        if (token == null) {
            return AuthdogContext.anonymous();
        }
        if (!fetchUser) {
            return new AuthdogContext(token, null, false, null);
        }
        try {
            String url = Identity.userInfoUrl(payload.identityHost(), payload.environmentId());
            String body = fetcher.fetch(url, token);
            JSONObject info = new JSONObject(body);
            if (Identity.isAuthenticated(info)) {
                return new AuthdogContext(token, info.get("user"), true, info);
            }
            return new AuthdogContext(token, null, false, info);
        } catch (Exception ex) {
            return new AuthdogContext(token, null, false, null);
        }
    }

    /**
     * Gate. Unauthenticated requests produce status {@code 401} and {@code {"error":"Unauthorized"}}.
     */
    public Gate requireAuth(String authorization, String cookieHeader) {
        AuthdogContext context = resolve(authorization, cookieHeader);
        if (!context.authenticated()) {
            return new Gate(false, context, 401, "{\"error\":\"Unauthorized\"}");
        }
        return new Gate(true, context, 200, null);
    }

    /** Clear the session cookie and redirect to a safe, same-origin path. */
    public Logout logout(String redirectUri) {
        return new Logout(
                Redirects.sanitizeRedirectPath(redirectUri, "/"),
                Redirects.expiredSessionCookie(Redirects.isProduction()));
    }

    public record Gate(boolean authenticated, AuthdogContext context, int status, String body) {}

    public record Logout(String location, String setCookie) {}
}
