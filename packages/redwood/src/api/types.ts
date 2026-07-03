import type { UserInfoResponse } from "@authdog/node-commons";

/**
 * Minimal structural shape of the AWS Lambda / API Gateway event a RedwoodJS
 * API function receives (`export const handler = async (event, context) => …`).
 * We model only the fields the SDK reads, so the package never takes a hard
 * dependency on `aws-lambda` / `@redwoodjs/api` types — the real `APIGatewayEvent`
 * is assignable to this.
 */
export interface LambdaEvent {
  /** Request headers. Keys may be any case; the SDK looks them up case-insensitively. */
  headers: Record<string, string | undefined>;
  /** Parsed query string (API Gateway v1). */
  queryStringParameters?: Record<string, string | undefined> | null;
  httpMethod?: string;
  path?: string;
  body?: string | null;
  /**
   * Authentication context populated by `AuthdogApi.requireAuth`. Present only
   * inside a `requireAuth`-wrapped handler.
   */
  authdog?: AuthdogRequestContext;
}

/** Minimal structural shape of a Lambda / API Gateway proxy result. */
export interface LambdaResult {
  statusCode: number;
  headers?: Record<string, string | number | boolean>;
  body?: string;
}

/** A RedwoodJS / Lambda API function handler. */
export type LambdaHandler = (
  event: LambdaEvent,
  context?: unknown,
) => LambdaResult | Promise<LambdaResult>;

/**
 * Per-request authentication context. `isAuthenticated` is the single source of
 * truth to branch on.
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
