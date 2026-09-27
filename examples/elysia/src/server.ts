import { Elysia } from "elysia";
import { createAuthdog } from "@authdog/elysia";

const publicKey = process.env.PK_AUTHDOG;
if (!publicKey) {
  throw new Error(
    "PK_AUTHDOG is not set. Copy .env.example to .env and add your Authdog public key.",
  );
}

const PORT = Number(process.env.PORT ?? 3014);
const authdog = createAuthdog({ publicKey });

const home = (authenticated: boolean): string => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Authdog × Elysia example</title>
  </head>
  <body>
    <h1>Authdog × Elysia</h1>
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

const app = new Elysia()
  .use(authdog.attachSession())
  .get("/", ({ authdog: session }) => {
    return new Response(home(session.isAuthenticated), {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  })
  .get("/api/public", ({ authdog: session }) => ({
    authenticated: session.isAuthenticated,
  }))
  .get("/me", ({ authdog: session }) => session.user, {
    beforeHandle: authdog.requireAuth,
  })
  .get(
    "/protected",
    () => ({ message: "You are authenticated — this content is protected." }),
    { beforeHandle: authdog.requireAuth },
  )
  .get("/logout", (ctx) => authdog.logout(ctx))
  .listen(PORT);

console.log(
  `Authdog Elysia example listening on http://localhost:${app.server?.port ?? PORT}`,
);
