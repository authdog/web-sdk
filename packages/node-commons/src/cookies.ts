export interface ParsedCookie {
  name: string;
  value: string;
}

/**
 * Parses a `Cookie` request header into name/value pairs.
 *
 * Splits each pair on the FIRST `=` only — cookie values routinely contain `=`
 * (base64 padding, JWTs), and a naive `split("=")` would silently truncate the
 * value and corrupt the session token. Values are URL-decoded to mirror the
 * `encodeURIComponent` used when the cookie is written.
 */
export const parseCookies = (cookieHeader: string | null): ParsedCookie[] => {
  if (!cookieHeader) {
    return [];
  }

  return cookieHeader
    .split(";")
    .map((cookie): ParsedCookie | null => {
      const trimmed = cookie.trim();
      if (!trimmed) return null;

      const idx = trimmed.indexOf("=");
      if (idx === -1) return null;

      const name = trimmed.slice(0, idx).trim();
      if (!name) return null;

      const rawValue = trimmed.slice(idx + 1).trim();
      let value = rawValue;
      try {
        value = decodeURIComponent(rawValue);
      } catch {
        // Leave the raw value if it isn't valid percent-encoding.
      }

      return { name, value };
    })
    .filter((c): c is ParsedCookie => c !== null);
};
