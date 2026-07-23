import type { UserInfoResponse } from "@authdog/node-commons";

/**
 * Per-request authentication context attached to `ctx.state.authdog` by the
 * `attachSession` middleware. `isAuthenticated` is the single source of truth
 * the rest of the app (and `requireAuth`) should branch on.
 */
export interface AuthdogRequestContext {
  /** The raw session token (JWT) extracted from the cookie or bearer header. */
  token: string | null;
  /** The userinfo `user` object, present only when `isAuthenticated` is true. */
  user: unknown | null;
  /** Whether the request carries a valid, authenticated Authdog session. */
  isAuthenticated: boolean;
  /** The full userinfo envelope, when a userinfo fetch was performed. */
  userInfo?: UserInfoResponse | null;
}

/**
 * Configuration for {@link createAuthdog}. The `publicKey` is validated and
 * parsed once at construction time (enforcing the trusted identity-host
 * allowlist), so an invalid or untrusted key fails fast rather than per-request.
 */
export interface AuthdogConfig {
  /** The Authdog public key (`pk_…`). Safe to expose to the browser. */
  publicKey: string;
  /**
   * The Authdog secret key. Reserved for future server-side session
   * revocation; currently optional and unused by the request lifecycle.
   */
  secretKey?: string;
}

/** Options for the {@link AuthdogServer.attachSession} middleware factory. */
export interface AttachSessionOptions {
  /**
   * Whether to call the identity provider's `userinfo` endpoint to resolve the
   * full user object for every authenticated request. Defaults to `true`.
   *
   * ⚠️ Network cost: when enabled this performs one outbound HTTPS request per
   * incoming request that carries a token. For high-throughput services that
   * only need to know *whether* a token is present (and validate it elsewhere),
   * set this to `false` and perform userinfo resolution lazily where needed.
   */
  fetchUser?: boolean;
}

declare module "koa" {
  interface DefaultState {
    /**
     * Authentication context populated by Authdog's `attachSession`
     * middleware. Always present once the middleware has run; check
     * `ctx.state.authdog?.isAuthenticated` to gate behaviour.
     */
    authdog?: AuthdogRequestContext;
  }
}
