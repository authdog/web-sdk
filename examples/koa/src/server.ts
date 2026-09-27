import Koa from "koa";
import type { Context, Next } from "koa";
import { createAuthdog, type AuthdogRequestContext } from "@authdog/koa";

const publicKey = process.env.PK_AUTHDOG;
if (!publicKey) {
  throw new Error(
    "PK_AUTHDOG is not set. Copy .env.example to .env and add your Authdog public key.",
  );
}

const PORT = Number(process.env.PORT ?? 3013);
const authdog = createAuthdog({ publicKey });

const sessionOf = (ctx: Context): AuthdogRequestContext | undefined =>
  (ctx.state as { authdog?: AuthdogRequestContext }).authdog;

const home = (authenticated: boolean): string => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Authdog × Koa example</title>
  </head>
  <body>
    <h1>Authdog × Koa</h1>
    <p>Signed in: ${authenticated ? "yes" : "no"}</p>
    <ul>
      <li><a href="/api/public">/api/public</a></li>
      <li><a href="/me">/me</a></li>
      <li><a href="/protected">/protected</a></li>
      <li><a href="/logout">/logout</a></li>
    </ul>
    <script>window.__AUTHDOG_PK__ = ${authdog.getPublicKey()};</script>
  </body>
</html>`;

const app = new Koa();
app.use(authdog.attachSession());
app.use(async (ctx: Context, next: Next) => {
  if (ctx.method !== "GET") {
    ctx.status = 405;
    return;
  }

  if (ctx.path === "/logout") {
    authdog.logout(ctx);
    return;
  }

  if (ctx.path === "/me" || ctx.path === "/protected") {
    await authdog.requireAuth(ctx, async () => {
      ctx.body =
        ctx.path === "/me"
          ? (sessionOf(ctx)?.user ?? null)
          : { message: "You are authenticated — this content is protected." };
    });
    return;
  }

  if (ctx.path === "/api/public") {
    ctx.body = { authenticated: sessionOf(ctx)?.isAuthenticated ?? false };
    return;
  }

  if (ctx.path === "/") {
    ctx.type = "html";
    ctx.body = home(sessionOf(ctx)?.isAuthenticated ?? false);
    return;
  }

  await next();
});

app.listen(PORT, () => {
  console.log(`Authdog Koa example listening on http://localhost:${PORT}`);
});
