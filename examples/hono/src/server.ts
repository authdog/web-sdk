import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { Hono } from "hono";
import { createAuthdog, type AuthdogRequestContext } from "@authdog/hono";

const publicKey = process.env.PK_AUTHDOG;
if (!publicKey) {
  throw new Error(
    "PK_AUTHDOG is not set. Copy .env.example to .env and add your Authdog public key.",
  );
}

const PORT = Number(process.env.PORT ?? 3012);
const authdog = createAuthdog({ publicKey });

type Env = { Variables: { authdog: AuthdogRequestContext } };
const app = new Hono<Env>();

app.use(authdog.attachSession());

const home = (authenticated: boolean): string => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Authdog × Hono example</title>
  </head>
  <body>
    <h1>Authdog × Hono</h1>
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

app.get("/", (c) =>
  c.html(home(c.get("authdog")?.isAuthenticated ?? false)),
);

app.get("/api/public", (c) =>
  c.json({ authenticated: c.get("authdog")?.isAuthenticated ?? false }),
);

app.get("/me", authdog.requireAuth, (c) => c.json(c.get("authdog")?.user ?? null));

app.get("/protected", authdog.requireAuth, (c) =>
  c.json({ message: "You are authenticated — this content is protected." }),
);

app.get("/logout", authdog.logout);

const toRequest = (req: IncomingMessage): Request => {
  const host = req.headers.host ?? `localhost:${PORT}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else {
      headers.set(key, value);
    }
  }
  return new Request(`http://${host}${req.url ?? "/"}`, {
    method: req.method,
    headers,
  });
};

const send = async (res: ServerResponse, response: Response): Promise<void> => {
  const headers: Record<string, string | string[]> = {};
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") return;
    headers[key] = value;
  });
  const cookies = response.headers.getSetCookie();
  if (cookies.length > 0) headers["set-cookie"] = cookies;
  res.writeHead(response.status, headers);
  res.end(Buffer.from(await response.arrayBuffer()));
};

createServer((req, res) => {
  void Promise.resolve(app.fetch(toRequest(req)))
    .then((response) => send(res, response))
    .catch((error: unknown) => {
      res.writeHead(500, { "content-type": "text/plain" });
      res.end(error instanceof Error ? error.message : "Internal error");
    });
}).listen(PORT, () => {
  console.log(`Authdog Hono example listening on http://localhost:${PORT}`);
});
