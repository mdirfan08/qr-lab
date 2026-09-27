// Converts typed form fields into the raw string payload encoded in the QR.
import type { QRFields } from "../types/qr";

function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

export function buildPayload(fields: QRFields): string {
  switch (fields.type) {
    case "url": {
      const url = fields.url.trim();
      if (!url) return "";
      return /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(url) ? url : `https://${url}`;
    }
    case "text":
      return fields.text;
    case "email": {
      const params = new URLSearchParams();
      if (fields.subject) params.set("subject", fields.subject);
      if (fields.body) params.set("body", fields.body);
      const query = params.toString();
      return `mailto:${fields.to}${query ? `?${query}` : ""}`;
    }
    case "phone":
      return fields.phone ? `tel:${fields.phone.replace(/[^\d+]/g, "")}` : "";
    case "wifi": {
      if (!fields.ssid) return "";
      const sec = fields.security === "nopass" ? "nopass" : fields.security;
      return `WIFI:T:${sec};S:${escapeWifi(fields.ssid)};${
        fields.security === "nopass" ? "" : `P:${escapeWifi(fields.password)};`
      }${fields.hidden ? "H:true;" : ""};`;
    }
    case "vcard":
      if (!fields.name) return "";
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${fields.name}`,
        `FN:${fields.name}`,
        fields.org ? `ORG:${fields.org}` : "",
        fields.title ? `TITLE:${fields.title}` : "",
        fields.phone ? `TEL:${fields.phone}` : "",
        fields.email ? `EMAIL:${fields.email}` : "",
        fields.url ? `URL:${fields.url}` : "",
        "END:VCARD",
      ]
        .filter(Boolean)
        .join("\n");
    case "sms":
      return fields.phone ? `SMSTO:${fields.phone}:${fields.message ?? ""}` : "";
    default:
      return "";
  }
}

export function defaultFieldsFor(type: QRFields["type"]): QRFields {
  switch (type) {
    case "url":
      return { type: "url", url: "" };
    case "text":
      return { type: "text", text: "" };
    case "email":
      return { type: "email", to: "", subject: "", body: "" };
    case "phone":
      return { type: "phone", phone: "" };
    case "wifi":
      return { type: "wifi", ssid: "", password: "", security: "WPA", hidden: false };
    case "vcard":
      return { type: "vcard", name: "", org: "", title: "", phone: "", email: "", url: "" };
    case "sms":
      return { type: "sms", phone: "", message: "" };
  }
}
