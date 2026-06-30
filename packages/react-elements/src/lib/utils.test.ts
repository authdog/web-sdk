import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges multiple class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("dedupes/overrides conflicting tailwind classes (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm text-lg")).toBe("text-lg");
    expect(cn("px-2 py-1", "p-4")).toBe("p-4");
  });

  it("keeps non-conflicting tailwind classes", () => {
    expect(cn("p-4", "text-red-500")).toBe("p-4 text-red-500");
  });

  it("ignores falsy values (false, null, undefined)", () => {
    expect(cn("foo", false, null, undefined, "bar")).toBe("foo bar");
    expect(cn(false, null, undefined)).toBe("");
  });

  it("supports conditional expressions", () => {
    const active = true;
    const disabled = false;
    expect(cn("base", active && "active", disabled && "disabled")).toBe(
      "base active",
    );
  });

  it("flattens arrays of classes", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
    expect(cn(["p-2", "p-4"])).toBe("p-4");
  });

  it("supports object syntax", () => {
    expect(cn({ foo: true, bar: false })).toBe("foo");
    expect(cn({ "text-sm": true, "text-lg": true })).toBe("text-lg");
  });

  it("handles a mix of all input types", () => {
    expect(
      cn("p-2", ["m-1", { hidden: false, block: true }], false, "p-4"),
    ).toBe("m-1 block p-4");
  });

  it("returns an empty string with no arguments", () => {
    expect(cn()).toBe("");
  });
});
