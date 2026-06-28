// TanStack Start is built on the Web Fetch API (`Request` / `Response`), so the
// SDK speaks Web standards directly instead of importing framework-specific
// `json` / `redirect` helpers.

export const jsonResponse = (data: unknown, init?: ResponseInit): Response => {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return new Response(JSON.stringify(data), { ...init, headers });
};

export const redirectResponse = (
  location: string,
  init?: ResponseInit,
): Response => {
  const headers = new Headers(init?.headers);
  headers.set("Location", location);
  return new Response(null, { ...init, status: init?.status ?? 302, headers });
};
