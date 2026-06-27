import type {
  FastifyReply,
  FastifyRequest,
  preHandlerHookHandler,
} from "fastify";

/** Options accepted by {@link authdogPlugin} when registered. */
export interface AuthdogPluginOptions {
  /** Authdog public key (`pk_…`). Validated once at registration. */
  publicKey: string;
  /**
   * Secret key. Reserved for future server-side session revocation; not yet
   * used by the plugin.
   */
  secretKey?: string;
  /**
   * When `false`, the plugin will not call the identity host's `userinfo`
   * endpoint on every request. The token is still exposed on
   * `request.authdog.token`, but `isAuthenticated` stays `false` because the
   * token has not been verified. Defaults to `true`.
   */
  fetchUserInfo?: boolean;
}

/**
 * Per-request authentication context attached to `request.authdog` by the
 * `onRequest` hook. `isAuthenticated` is only ever `true` when a token was
 * present AND the identity host confirmed it (`meta.code === 200`).
 */
export interface AuthdogRequestContext {
  token: string | null;
  user: unknown | null;
  isAuthenticated: boolean;
}

/** API decorated onto the Fastify instance as `fastify.authdog`. */
export interface AuthdogInstanceApi {
  /**
   * Route-level `preHandler` that replies `401` unless the request is
   * authenticated. This is the real enforcement point — `request.authdog`
   * alone is informational.
   */
  requireAuth: preHandlerHookHandler;
  /** Returns the validated public-key payload as a JSON string. */
  getPublicKey: () => string;
  /**
   * Clears the session cookie and redirects to a sanitized `redirect_uri`
   * query parameter (open-redirect safe), defaulting to `/`.
   */
  logout: (request: FastifyRequest, reply: FastifyReply) => void;
}

declare module "fastify" {
  interface FastifyRequest {
    authdog?: AuthdogRequestContext;
  }
  interface FastifyInstance {
    authdog: AuthdogInstanceApi;
  }
}
