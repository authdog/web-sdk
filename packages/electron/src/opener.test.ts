import { describe, expect, it } from "vitest";
import { createElectronOpener } from "./opener";

describe("createElectronOpener", () => {
  it("forwards the authorize URL to shell.openExternal", async () => {
    const opened: string[] = [];
    const open = createElectronOpener({
      openExternal: (url) => {
        opened.push(url);
      },
    });
    await open("https://identity.authdog.com/oidc/env/authorize");
    expect(opened).toEqual([
      "https://identity.authdog.com/oidc/env/authorize",
    ]);
  });
});
