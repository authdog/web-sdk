import Fastify from "fastify";
import authdogPlugin from "@authdog/fastify";

// The public key (`pk_…`) is safe to expose to the browser. It is validated
// once at plugin registration, which enforces the trusted identity-host
// allowlist (SSRF / token-exfiltration protection) and fails fast here rather
// than per-request.
const publicKey = process.env.PK_AUTHDOG;
if (!publicKey) {
  throw new Error(
    "PK_AUTHDOG is not set. Copy .env.example to .env and add your Authdog public key.",
  );
}

const port = Number(process.env.PORT ?? 3011);

const app = Fastify({ logger: true });

// Registering the plugin adds an `onRequest` hook that resolves the session
// (cookie `authdog-session` or `Authorization: Bearer …`) and attaches the
// per-request context to `request.authdog` ({ token, user, isAuthenticated }).
await app.register(authdogPlugin, { publicKey });

/**
 * Home page. We inline the validated public key as `window.__AUTHDOG_PK__` so a
 * front-end could build the hosted sign-in URL from it. `getPublicKey()`
 * returns the parsed payload as JSON — never the raw secret key.
 */
app.get("/", async (_request, reply) => {
  const pk = app.authdog.getPublicKey();

  reply.type("text/html").send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Authdog × Fastify</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 42rem; margin: 4rem auto; padding: 0 1rem; line-height: 1.6; color: #1a1a1a; }
      h1 { font-size: 1.5rem; }
      code { background: #f4f4f5; padding: 0.15rem 0.4rem; border-radius: 4px; }
      ul { padding-left: 1.2rem; }
      a { color: #2563eb; }
    </style>
  </head>
  <body>
    <h1>Authdog × Fastify example</h1>
    <p>
      This server demonstrates the <code>@authdog/fastify</code> plugin. Each
      request is enriched with <code>request.authdog</code>; the
      <code>requireAuth</code> preHandler is the real enforcement point.
    </p>
    <ul>
      <li><a href="/api/public">/api/public</a> — open route, reports auth status</li>
      <li><a href="/me">/me</a> — protected, returns your user object</li>
      <li><a href="/protected">/protected</a> — protected, returns a message</li>
      <li><a href="/logout">/logout</a> — clears the session cookie</li>
    </ul>
    <p>
      Without a valid <code>authdog-session</code> cookie (or bearer token),
      the protected routes respond with <code>401 Unauthorized</code>.
    </p>
    <script>
      window.__AUTHDOG_PK__ = ${pk};
    </script>
  </body>
</html>`);
});

// Open route: `request.authdog` is informational and safe to read without
// enforcement. Never branch security decisions on it without `requireAuth`.
app.get("/api/public", async (request) => {
  return { authenticated: request.authdog?.isAuthenticated ?? false };
});

// Protected route. `requireAuth` replies 401 unless the identity host
// confirmed the token — this is the real security boundary, not the presence
// of `request.authdog`.
app.get("/me", { preHandler: app.authdog.requireAuth }, async (request) => {
  return request.authdog?.user ?? null;
});

app.get(
  "/protected",
  { preHandler: app.authdog.requireAuth },
  async () => {
    return { message: "You are authenticated — this content is protected." };
  },
);

// Clears the `authdog-session` cookie and redirects to a sanitized
// `redirect_uri` (open-redirect safe), defaulting to `/`.
app.get("/logout", (request, reply) => {
  app.authdog.logout(request, reply);
});

try {
  await app.listen({ port });
  app.log.info(`Authdog Fastify example listening on http://localhost:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
