import { describe, it, expect } from "vitest";
import { parseCookies } from "./cookies";

describe("parseCookies", () => {
  it("returns an empty array for null / empty headers", () => {
    expect(parseCookies(null)).toEqual([]);
    expect(parseCookies("")).toEqual([]);
  });

  it("parses a single name/value pair", () => {
    expect(parseCookies("foo=bar")).toEqual([{ name: "foo", value: "bar" }]);
  });

  it("parses multiple pairs and trims surrounding whitespace", () => {
    expect(parseCookies("foo=bar; baz=qux")).toEqual([
      { name: "foo", value: "bar" },
      { name: "baz", value: "qux" },
    ]);
  });

  it("splits on the first '=' only so values may contain '='", () => {
    // base64 padding / JWTs routinely contain '='
    const jwt = "header.payload.signature==";
    expect(parseCookies(`token=${jwt}`)).toEqual([
      { name: "token", value: jwt },
    ]);
  });

  it("URL-decodes values", () => {
    expect(parseCookies("redirect=%2Fdashboard%3Fa%3D1")).toEqual([
      { name: "redirect", value: "/dashboard?a=1" },
    ]);
  });

  it("leaves the raw value when it is not valid percent-encoding", () => {
    expect(parseCookies("bad=%E0%A4%A")).toEqual([
      { name: "bad", value: "%E0%A4%A" },
    ]);
  });

  it("skips empty segments and segments without a name", () => {
    expect(parseCookies("foo=bar;; =orphan; =;")).toEqual([
      { name: "foo", value: "bar" },
    ]);
  });

  it("skips segments without an '='", () => {
    expect(parseCookies("flag; foo=bar")).toEqual([
      { name: "foo", value: "bar" },
    ]);
  });

  it("supports an empty value", () => {
    expect(parseCookies("foo=")).toEqual([{ name: "foo", value: "" }]);
  });
});
