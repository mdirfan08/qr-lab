import { describe, expect, it } from "vitest";
import { buildPayload, defaultFieldsFor } from "../payload";

describe("buildPayload", () => {
  it("prefixes bare domains with https://", () => {
    expect(buildPayload({ type: "url", url: "example.com" })).toBe("https://example.com");
  });

  it("leaves already-schemed URLs untouched", () => {
    expect(buildPayload({ type: "url", url: "http://example.com" })).toBe("http://example.com");
  });

  it("builds a mailto link with subject and body", () => {
    const payload = buildPayload({ type: "email", to: "a@b.com", subject: "Hi", body: "Hello" });
    expect(payload).toBe("mailto:a@b.com?subject=Hi&body=Hello");
  });

  it("builds a bare mailto link with no params", () => {
    expect(buildPayload({ type: "email", to: "a@b.com", subject: "", body: "" })).toBe("mailto:a@b.com");
  });

  it("strips non-numeric characters from phone numbers except +", () => {
    expect(buildPayload({ type: "phone", phone: "+1 (555) 010-2020" })).toBe("tel:+15550102020");
  });

  it("builds a WIFI payload with escaping", () => {
    const payload = buildPayload({
      type: "wifi",
      ssid: "My;Net",
      password: "pa:ss",
      security: "WPA",
      hidden: false,
    });
    expect(payload).toContain("WIFI:T:WPA;");
    expect(payload).toContain("S:My\\;Net;");
    expect(payload).toContain("P:pa\\:ss;");
  });

  it("returns empty string for empty required fields", () => {
    expect(buildPayload({ type: "url", url: "" })).toBe("");
    expect(buildPayload({ type: "wifi", ssid: "", password: "", security: "WPA", hidden: false })).toBe("");
  });

  it("provides sensible defaults per type", () => {
    expect(defaultFieldsFor("url")).toEqual({ type: "url", url: "" });
    expect(defaultFieldsFor("wifi")).toEqual({
      type: "wifi",
      ssid: "",
      password: "",
      security: "WPA",
      hidden: false,
    });
  });
});
