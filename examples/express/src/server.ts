import express from "express";
import { createAuthdog } from "@authdog/express";

// The public key (`pk_…`) is safe to expose to the browser. It is validated and
// parsed once at startup by `createAuthdog`, which enforces the trusted
// identity-host allowlist (SSRF / token-exfiltration protection) — a malformed
// or untrusted key fails fast here rather than on the first request.
const publicKey = process.env.PK_AUTHDOG;
if (!publicKey) {
  throw new Error(
    "PK_AUTHDOG is not set. Copy .env.example to .env and add your Authdog public key.",
  );
}

const PORT = Number(process.env.PORT ?? 3010);

const authdog = createAuthdog({ publicKey });

const app = express();

// Resolve the session (if any) and attach `req.authdog` for every request.
// This never throws and never blocks the request — it only populates context.
app.use(authdog.attachSession());

// Home page. We inject the validated public-key payload into the page so a
// real frontend could bootstrap its sign-in UI from it. This is informational:
// possession of the public key grants no access on its own.
app.get("/", (_req, res) => {
  const publicKeyJson = authdog.getPublicKey();

  res.type("html").send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Authdog × Express example</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 42rem; margin: 4rem auto; padding: 0 1rem; line-height: 1.6; color: #1a1a1a; }
      code { background: #f4f4f5; padding: 0.1rem 0.35rem; border-radius: 4px; }
      ul { padding-left: 1.2rem; }
      a { color: #2563eb; }
    </style>
  </head>
  <body>
    <h1>Authdog × Express</h1>
    <p>
      This server demonstrates the <code>@authdog/express</code> SDK. The
      <code>attachSession</code> middleware resolves <code>req.authdog</code> for
      every request, and <code>requireAuth</code> is the real server-side
      enforcement point that gates protected routes.
    </p>
    <ul>
      <li><a href="/api/public">/api/public</a> — open endpoint, reports whether you are authenticated</li>
      <li><a href="/me">/me</a> — protected, returns your user object (401 when signed out)</li>
      <li><a href="/protected">/protected</a> — protected, returns a message</li>
      <li><a href="/logout">/logout</a> — clears the session cookie and redirects home</li>
    </ul>
    <script>
      // The validated public-key payload, available to client code.
      window.__AUTHDOG_PK__ = ${publicKeyJson};
    </script>
  </body>
</html>`);
});

// Open endpoint: readable by anyone. `req.authdog` is always present once
// `attachSession` has run; branch on `isAuthenticated`.
app.get("/api/public", (req, res) => {
  res.json({ authenticated: req.authdog?.isAuthenticated ?? false });
});

// Protected: `requireAuth` replies 401 unless the request carries a valid,
// authenticated Authdog session. This is the actual access-control boundary —
// any client-side check is presentational only.
app.get("/me", authdog.requireAuth, (req, res) => {
  res.json(req.authdog?.user ?? null);
});

app.get("/protected", authdog.requireAuth, (_req, res) => {
  res.json({ message: "You are authenticated — this content is protected." });
});

// Clears the `authdog-session` cookie and performs a safe, same-origin redirect
// (open-redirect protected via `sanitizeRedirectPath`).
app.get("/logout", authdog.logout);

app.listen(PORT, () => {
  console.log(`Authdog Express example listening on http://localhost:${PORT}`);
});
