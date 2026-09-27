import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { identityLoader, logoutLoader } from "@authdog/react-router";

const publicKey = process.env.PK_AUTHDOG;
if (!publicKey) {
  throw new Error(
    "PK_AUTHDOG is not set. Copy .env.example to .env and add your Authdog public key.",
  );
}

const PORT = Number(process.env.PORT ?? 3002);
const loadSession = identityLoader();

interface SessionData {
  user: { displayName?: string } | null;
  isAuthenticated: boolean;
  signinUri: string;
}

const home = (session: SessionData): string => {
  const profile = session.isAuthenticated
    ? `<pre>${JSON.stringify(session.user, null, 2)}</pre><p><a href="/logout">Sign out</a></p>`
    : `<p><a href="${session.signinUri}">Sign in</a></p>`;
  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /><title>Authdog × React Router example</title></head>
  <body>
    <h1>Authdog × React Router</h1>
    <p>Signed in: ${session.isAuthenticated ? "yes" : "no"}</p>
    ${profile}
    <ul>
      <li><a href="/api/public">/api/public</a></li>
      <li><a href="/me">/me</a></li>
      <li><a href="/protected">/protected</a></li>
    </ul>
  </body>
</html>`;
};

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

const json = (
  body: unknown,
  status: number,
  source?: Response,
): Response => {
  const headers = new Headers(source?.headers);
  headers.set("content-type", "application/json");
  return new Response(JSON.stringify(body), { status, headers });
};

const handle = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  if (url.pathname === "/logout") {
    return logoutLoader({ request });
  }

  const result = await loadSession({ request, context: {} });
  if (!(result instanceof Response)) {
    throw new Error("identityLoader did not return a Response");
  }
  const session = (await result.json()) as SessionData;

  if (url.pathname === "/api/public") {
    return json({ authenticated: session.isAuthenticated }, 200, result);
  }
  if (url.pathname === "/me" || url.pathname === "/protected") {
    if (!session.isAuthenticated) {
      return json({ error: "Unauthorized" }, 401, result);
    }
    return json(
      url.pathname === "/me"
        ? session.user
        : { message: "You are authenticated — this content is protected." },
      200,
      result,
    );
  }

  const headers = new Headers(result.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  return new Response(home(session), { status: 200, headers });
};

createServer((req, res) => {
  void handle(toRequest(req))
    .then((response) => send(res, response))
    .catch((error: unknown) => {
      res.writeHead(500, { "content-type": "text/plain" });
      res.end(error instanceof Error ? error.message : "Internal error");
    });
}).listen(PORT, () => {
  console.log(
    `Authdog React Router example listening on http://localhost:${PORT}`,
  );
});
