// Field-level validation. Returns a map of field -> human-readable error, empty when valid.
import type { QRFields } from "../types/qr";

export type ValidationErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s().-]{6,20}$/;
const URL_RE = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+([/?#]\S*)?$/i;

export function validateFields(fields: QRFields): ValidationErrors {
  const errors: ValidationErrors = {};

  switch (fields.type) {
    case "url":
      if (!fields.url.trim()) errors.url = "Enter a destination URL.";
      else if (!URL_RE.test(fields.url.trim())) errors.url = "That doesn't look like a valid URL.";
      break;
    case "text":
      if (!fields.text.trim()) errors.text = "Enter the text to encode.";
      else if (fields.text.length > 2000) errors.text = "Keep text under 2000 characters for reliable scanning.";
      break;
    case "email":
      if (!fields.to.trim()) errors.to = "Enter a recipient email.";
      else if (!EMAIL_RE.test(fields.to.trim())) errors.to = "Enter a valid email address.";
      break;
    case "phone":
      if (!fields.phone.trim()) errors.phone = "Enter a phone number.";
      else if (!PHONE_RE.test(fields.phone.trim())) errors.phone = "Enter a valid phone number.";
      break;
    case "wifi":
      if (!fields.ssid.trim()) errors.ssid = "Enter the network name.";
      if (fields.security !== "nopass" && !fields.password.trim())
        errors.password = "Enter the network password, or set security to Open.";
      break;
    case "vcard":
      if (!fields.name.trim()) errors.name = "Enter a full name.";
      if (fields.email && !EMAIL_RE.test(fields.email)) errors.email = "Enter a valid email address.";
      break;
    case "sms":
      if (!fields.phone.trim()) errors.phone = "Enter a phone number.";
      else if (!PHONE_RE.test(fields.phone.trim())) errors.phone = "Enter a valid phone number.";
      break;
  }

  return errors;
}

export function isValid(fields: QRFields): boolean {
  return Object.keys(validateFields(fields)).length === 0;
}
