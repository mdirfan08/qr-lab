import { describe, expect, it } from "vitest";
import { validateFields, isValid } from "../validation";

describe("validateFields", () => {
  it("flags an empty URL", () => {
    const errors = validateFields({ type: "url", url: "" });
    expect(errors.url).toBeDefined();
  });

  it("accepts a valid URL", () => {
    expect(isValid({ type: "url", url: "https://example.com" })).toBe(true);
  });

  it("flags an invalid email", () => {
    const errors = validateFields({ type: "email", to: "not-an-email", subject: "", body: "" });
    expect(errors.to).toBeDefined();
  });

  it("requires a Wi-Fi password unless security is open", () => {
    const withPass = validateFields({ type: "wifi", ssid: "Net", password: "", security: "WPA", hidden: false });
    expect(withPass.password).toBeDefined();

    const open = validateFields({ type: "wifi", ssid: "Net", password: "", security: "nopass", hidden: false });
    expect(open.password).toBeUndefined();
  });

  it("requires a vCard name but not an email", () => {
    const errors = validateFields({ type: "vcard", name: "", org: "", title: "", phone: "", email: "", url: "" });
    expect(errors.name).toBeDefined();
    expect(errors.email).toBeUndefined();
  });
});
