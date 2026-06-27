import fp from "fastify-plugin";
import type {
  FastifyPluginCallback,
  FastifyReply,
  FastifyRequest,
  preHandlerHookHandler,
} from "fastify";
import {
  fetchUserData,
  isAuthenticatedUserInfo,
  parseCookies,
  sanitizeRedirectPath,
  validateAndParsePublicKey,
} from "@authdog/node-commons";
import type {
  AuthdogInstanceApi,
  AuthdogPluginOptions,
  AuthdogRequestContext,
} from "./types";

/** Name of the cookie carrying the session token (shared across SDKs). */
const SESSION_COOKIE_NAME = "authdog-session";

/**
 * Extracts the session token, preferring the `authdog-session` cookie and
 * falling back to a `Bearer` authorization header.
 *
 * The cookie header is parsed with the shared {@link parseCookies} (splits on
 * the first `=`, URL-decodes) so JWT values containing `=` are not truncated.
 * We deliberately do NOT depend on `@fastify/cookie` being registered.
 */
const extractToken = (request: FastifyRequest): string | null => {
  const fromCookie = parseCookies(request.headers.cookie ?? null).find(
    (c) => c.name === SESSION_COOKIE_NAME,
  )?.value;
  if (fromCookie) {
    return fromCookie;
  }

  const authz = request.headers.authorization;
  if (authz && authz.startsWith("Bearer ")) {
    const token = authz.slice("Bearer ".length).trim();
    return token.length > 0 ? token : null;
  }

  return null;
};

const authdogPluginCallback: FastifyPluginCallback<AuthdogPluginOptions> = (
  fastify,
  options,
  done,
) => {
  const { publicKey, fetchUserInfo } = options;

  // Validate and parse the public key once at registration. This enforces the
  // trusted identity-host allowlist (SSRF / token-exfiltration protection) and
  // fails fast if the key is malformed, rather than per-request.
  const payload = validateAndParsePublicKey(publicKey);
  const { identityHost, environmentId } = payload;

  // Stable per-request default. Reassigned to a fresh object in the hook below,
  // so the (deprecated in v5) shared-reference pitfall does not apply.
  fastify.decorateRequest("authdog", undefined);

  fastify.addHook("onRequest", async (request) => {
    const token = extractToken(request);

    const context: AuthdogRequestContext = {
      token,
      user: null,
      isAuthenticated: false,
    };

    if (token && fetchUserInfo !== false) {
      try {
        const data = await fetchUserData(identityHost, environmentId, token);
        // Only trust a genuine success envelope (`meta.code === 200` + a user);
        // a 200 HTTP status alone is not sufficient.
        if (isAuthenticatedUserInfo(data)) {
          context.user = data.user ?? null;
          context.isAuthenticated = true;
        }
      } catch {
        // Never throw from the hook: an invalid/expired token simply yields an
        // unauthenticated context. Enforcement happens in `requireAuth`.
      }
    }

    request.authdog = context;
  });

  const requireAuth: preHandlerHookHandler = (request, reply, next) => {
    if (!request.authdog?.isAuthenticated) {
      reply.code(401).send({ error: "Unauthorized" });
      return;
    }
    next();
  };

  const logout = (request: FastifyRequest, reply: FastifyReply): void => {
    // Expire the session cookie. `Secure` is gated on production so local HTTP
    // development still clears the cookie; HttpOnly + SameSite=Lax retained.
    const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";
    reply.header(
      "Set-Cookie",
      `${SESSION_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly;${secure} SameSite=Lax`,
    );

    // Sanitize the redirect target to prevent an open redirect via an
    // attacker-controlled `redirect_uri` query parameter.
    const query = (request.query ?? {}) as Record<string, unknown>;
    const target = sanitizeRedirectPath(query.redirect_uri, "/");
    reply.redirect(target);
  };

  const api: AuthdogInstanceApi = {
    requireAuth,
    getPublicKey: () => JSON.stringify(payload),
    logout,
  };

  fastify.decorate("authdog", api);

  done();
};

/**
 * Authdog Fastify plugin. Register it once on your instance:
 *
 * ```ts
 * await app.register(authdogPlugin, { publicKey: process.env.AUTHDOG_PK! });
 * app.get("/me", { preHandler: app.authdog.requireAuth }, async (req) => req.authdog!.user);
 * ```
 *
 * Wrapped with `fastify-plugin` so the request/instance decorations are not
 * encapsulated and are visible to sibling plugins and routes.
 */
export const authdogPlugin = fp(authdogPluginCallback, {
  name: "@authdog/fastify",
  fastify: "4.x || 5.x",
});

export default authdogPlugin;
