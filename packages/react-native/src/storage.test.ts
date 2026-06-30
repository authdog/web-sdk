import { describe, it, expect, vi } from "vitest";
import { inMemoryStorage, createSecureStoreAdapter } from "./storage";

describe("inMemoryStorage", () => {
  it("returns null for a missing key", async () => {
    const storage = inMemoryStorage();
    expect(await storage.getItem("missing")).toBeNull();
  });

  it("round-trips set then get", async () => {
    const storage = inMemoryStorage();
    await storage.setItem("token", "abc");
    expect(await storage.getItem("token")).toBe("abc");
  });

  it("overwrites an existing value", async () => {
    const storage = inMemoryStorage();
    await storage.setItem("token", "abc");
    await storage.setItem("token", "xyz");
    expect(await storage.getItem("token")).toBe("xyz");
  });

  it("removes a stored value", async () => {
    const storage = inMemoryStorage();
    await storage.setItem("token", "abc");
    await storage.removeItem("token");
    expect(await storage.getItem("token")).toBeNull();
  });

  it("keeps separate instances isolated", async () => {
    const a = inMemoryStorage();
    const b = inMemoryStorage();
    await a.setItem("token", "from-a");
    expect(await b.getItem("token")).toBeNull();
  });
});

describe("createSecureStoreAdapter", () => {
  it("maps the AuthdogStorage interface onto the SecureStore async methods", async () => {
    const secureStore = {
      getItemAsync: vi.fn(async () => "stored"),
      setItemAsync: vi.fn(async () => {}),
      deleteItemAsync: vi.fn(async () => {}),
    };
    const storage = createSecureStoreAdapter(secureStore);

    expect(await storage.getItem("k")).toBe("stored");
    expect(secureStore.getItemAsync).toHaveBeenCalledWith("k");

    await storage.setItem("k", "v");
    expect(secureStore.setItemAsync).toHaveBeenCalledWith("k", "v");

    await storage.removeItem("k");
    expect(secureStore.deleteItemAsync).toHaveBeenCalledWith("k");
  });
});
