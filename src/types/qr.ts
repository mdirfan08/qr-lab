// Core domain types for QR LAB.

export type QRType =
  | "url"
  | "text"
  | "email"
  | "phone"
  | "wifi"
  | "vcard"
  | "sms";

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export type DotStyle = "square" | "rounded" | "dots";
export type CornerStyle = "square" | "rounded" | "extra-rounded";
export type PresetName =
  | "minimal"
  | "midnight"
  | "professional"
  | "soft"
  | "glass"
  | "bold"
  | "custom";

// ---- Per-type field shapes ----

export interface URLFields {
  url: string;
}
export interface TextFields {
  text: string;
}
export interface EmailFields {
  to: string;
  subject: string;
  body: string;
}
export interface PhoneFields {
  phone: string;
}
export interface WifiFields {
  ssid: string;
  password: string;
  security: "WPA" | "WEP" | "nopass";
  hidden: boolean;
}
export interface VCardFields {
  name: string;
  org: string;
  title: string;
  phone: string;
  email: string;
  url: string;
}
export interface SMSFields {
  phone: string;
  message: string;
}

export type QRFields =
  | ({ type: "url" } & URLFields)
  | ({ type: "text" } & TextFields)
  | ({ type: "email" } & EmailFields)
  | ({ type: "phone" } & PhoneFields)
  | ({ type: "wifi" } & WifiFields)
  | ({ type: "vcard" } & VCardFields)
  | ({ type: "sms" } & SMSFields);

export interface QRDesign {
  size: number; // px, final render size
  fgColor: string;
  bgColor: string;
  errorCorrection: ErrorCorrectionLevel;
  quietZone: number; // modules
  dotStyle: DotStyle;
  cornerStyle: CornerStyle;
  gradient: boolean;
  gradientTo: string;
  logoDataUrl: string | null;
  logoSizePct: number; // % of QR width, 0-30
  logoPaddingPx: number;
  preset: PresetName;
}

export interface QRRecord {
  id: string;
  name: string;
  createdAt: number;
  fields: QRFields;
  design: QRDesign;
  reliabilityScore: number;
}

export interface ReliabilityIssue {
  id: string;
  label: string;
  severity: "pass" | "warn" | "fail";
  detail: string;
  fixable: boolean;
}

export interface ReliabilityResult {
  score: number;
  issues: ReliabilityIssue[];
}

export interface TestResult {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  method: "decoded" | "heuristic";
  detail: string;
}
