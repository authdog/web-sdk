/**
 * Returns a safe, same-origin redirect target, falling back to `fallback`
 * (default `/`) for anything that could be an open redirect.
 *
 * Only relative paths are allowed. A value is rejected if it:
 *  - is empty / not a string
 *  - starts with `//` or `/\` (protocol-relative → off-site)
 *  - contains a scheme (`http:`, `javascript:`, `data:`, …)
 *  - contains a backslash or control characters (used to bypass naive checks)
 */
export const sanitizeRedirectPath = (
  target: unknown,
  fallback = "/",
): string => {
  if (typeof target !== "string" || target.length === 0) {
    return fallback;
  }

  // Must be an absolute-path reference, not protocol-relative.
  if (!target.startsWith("/") || target.startsWith("//") || target.startsWith("/\\")) {
    return fallback;
  }

  // Reject backslashes and control chars that browsers may normalize to `/`.
  if (/[\\\x00-\x1f]/.test(target)) {
    return fallback;
  }

  // Reject anything that parses as having a scheme (e.g. "/\t/evil" tricks).
  if (/^[a-z][a-z0-9+.-]*:/i.test(target)) {
    return fallback;
  }

  return target;
};
