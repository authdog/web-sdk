import { describe, it, expect } from "vitest";
import { buildSessionKey } from "./session";

describe("buildSessionKey", () => {
  it("namespaces the session key by environment id", () => {
    expect(buildSessionKey("env-123")).toBe("user_session_env-123");
  });

  it("handles an empty environment id", () => {
    expect(buildSessionKey("")).toBe("user_session_");
  });

  it("does not mangle ids that contain special characters", () => {
    expect(buildSessionKey("env_with-mixed.chars")).toBe(
      "user_session_env_with-mixed.chars",
    );
  });
});
