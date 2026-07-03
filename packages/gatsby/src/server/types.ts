import type { UserInfoResponse } from "@authdog/node-commons";

/**
 * Minimal structural shape of a Gatsby Functions request. Gatsby builds its
 * function request on top of Express, so the real `GatsbyFunctionRequest`
 * (from `gatsby`) is assignable to this — we model only the fields the SDK
 * reads, so the package never has to take a hard dependency on Gatsby's types.
 */
export interface GatsbyFunctionRequest {
  /** Incoming request headers (lower-cased keys, as Node provides them). */
  headers: Record<string, string | string[] | undefined>;
  /** Cookies pre-parsed by Gatsby, when available. */
  cookies?: Record<string, string>;
  /** Parsed query string. */
  query?: Record<string, string | string[] | undefined>;
  method?: string;
  url?: string;
  /**
   * Authentication context populated by `AuthdogServer.requireAuth`. Present
   * only inside a `requireAuth`-wrapped handler.
   */
  authdog?: AuthdogRequestContext;
}

/**
 * Minimal structural shape of a Gatsby Functions response. The real
 * `GatsbyFunctionResponse` (from `gatsby`) is assignable to this.
 */
export interface GatsbyFunctionResponse {
  setHeader(name: string, value: string | string[]): unknown;
  status(statusCode: number): GatsbyFunctionResponse;
  json(body: unknown): unknown;
  send(body?: unknown): unknown;
  redirect(url: string): unknown;
  redirect(statusCode: number, url: string): unknown;
}

/**
 * Per-request authentication context. `isAuthenticated` is the single source of
 * truth the rest of your function (and {@link AuthdogServer.requireAuth}) should
 * branch on.
 */
export interface AuthdogRequestContext {
  /** The raw session token extracted from the cookie or bearer header. */
  token: string | null;
  /** The userinfo `user` object, present only when `isAuthenticated` is true. */
  user: unknown | null;
  /** Whether the request carries a valid, authenticated Authdog session. */
  isAuthenticated: boolean;
  /** The full userinfo envelope, when a userinfo fetch was performed. */
  userInfo?: UserInfoResponse | null;
}

/** Configuration for {@link createAuthdog}. */
export interface AuthdogConfig {
  /** The Authdog public key (`pk_…`). Safe to expose to the browser. */
  publicKey: string;
  /** Cookie name holding the session token. Defaults to `authdog-session`. */
  cookieName?: string;
}
