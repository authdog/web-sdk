import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect, vi, afterEach } from "vitest";
import { listBillingPlans } from "./billing";

const TRUSTED_HOST = "https://identity.authdog.com";
const PIN = JSON.parse(
  readFileSync(
    join(
      import.meta.dirname,
      "../../../specs/002-api-parity/contracts/pins/billing-plans-response.json",
    ),
    "utf8",
  ),
);

const mockResponse = (body: unknown, ok = true, status = 200) =>
  ({
    ok,
    status,
    json: async () => body,
  }) as unknown as Response;

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("listBillingPlans", () => {
  it("returns pinned billing plans fixture shape from identity host", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(PIN));
    vi.stubGlobal("fetch", fetchMock);

    const result = await listBillingPlans(TRUSTED_HOST, "env-1");

    expect(result.plans).toHaveLength(PIN.plans.length);
    expect(result.plans[0].slug).toBe("pro");
    expect(result.publishableKey).toBe(PIN.publishableKey);
    expect(fetchMock).toHaveBeenCalledWith(
      `${TRUSTED_HOST}/billing/env-1/plans?for=user`,
      {},
    );
  });

  it("rejects untrusted identity host before fetch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      listBillingPlans("https://evil.example", "env-1"),
    ).rejects.toThrow();

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
