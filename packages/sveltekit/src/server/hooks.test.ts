import { describe, it, expect } from "vitest";
import { createAuthdogHandle, type AuthdogLocals } from "./hooks";
import { DEFAULT_SESSION_COOKIE } from "./cookies";

/**
 * Builds a minimal plain fake of the SvelteKit `RequestEvent` exposing only the
 * surface the hook reads: `cookies.get` and `locals`. `resolve` is a stub that
 * returns a Response so we can assert the hook forwards the event.
 */
const makeEvent = (cookies: Record<string, string>) => {
  const locals: { authdog?: AuthdogLocals } = {};
  const event = {
    cookies: { get: (name: string) => cookies[name] },
    locals,
  };
  return { event, locals };
};

const resolved = new Response("ok");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resolve = (() => resolved) as any;

describe("createAuthdogHandle", () => {
  it("extracts the session token from the default cookie and marks authenticated", async () => {
    const handle = createAuthdogHandle({ publicKey: "pk_test" });
    const { event, locals } = makeEvent({ [DEFAULT_SESSION_COOKIE]: "tok-123" });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await handle({ event, resolve } as any);

    expect(locals.authdog).toEqual({
      session: "tok-123",
      isAuthenticated: true,
    });
  });

  it("sets session to null and isAuthenticated false when no cookie is present", async () => {
    const handle = createAuthdogHandle({ publicKey: "pk_test" });
    const { event, locals } = makeEvent({});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await handle({ event, resolve } as any);

    expect(locals.authdog).toEqual({
      session: null,
      isAuthenticated: false,
    });
  });

  it("reads a custom cookie name when configured", async () => {
    const handle = createAuthdogHandle({
      publicKey: "pk_test",
      cookieName: "my-session",
    });
    const { event, locals } = makeEvent({ "my-session": "tok-xyz" });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await handle({ event, resolve } as any);

    expect(locals.authdog?.session).toBe("tok-xyz");
  });

  it("forwards the event to resolve and returns its Response", async () => {
    const handle = createAuthdogHandle({ publicKey: "pk_test" });
    const { event } = makeEvent({});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await handle({ event, resolve } as any);

    expect(res).toBe(resolved);
  });
});
