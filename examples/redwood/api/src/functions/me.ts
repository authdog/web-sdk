import { createAuthdog } from "@authdog/redwood/api";
import type { LambdaEvent } from "@authdog/redwood/api";

const authdog = createAuthdog({ publicKey: process.env.PK_AUTHDOG! });

// `requireAuth` is the real server-side enforcement point: it returns a 401
// result for unauthenticated requests and attaches `event.authdog` otherwise.
export const handler = authdog.requireAuth(async (event: LambdaEvent) => ({
  statusCode: 200,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ user: event.authdog?.user ?? null }),
}));
