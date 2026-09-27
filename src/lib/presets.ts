import type { PresetName, QRDesign } from "../types/qr";

export const DEFAULT_DESIGN: QRDesign = {
  size: 420,
  fgColor: "#0A0A0C",
  bgColor: "#FFFFFF",
  errorCorrection: "Q",
  quietZone: 4,
  dotStyle: "rounded",
  cornerStyle: "rounded",
  gradient: false,
  gradientTo: "#6C8CFF",
  logoDataUrl: null,
  logoSizePct: 18,
  logoPaddingPx: 10,
  preset: "professional",
};

type PresetDefinition = Omit<QRDesign, "size" | "quietZone" | "logoDataUrl" | "logoSizePct" | "logoPaddingPx" | "preset">;

export const PRESETS: Record<Exclude<PresetName, "custom">, PresetDefinition> = {
  minimal: {
    fgColor: "#0A0A0C",
    bgColor: "#FFFFFF",
    errorCorrection: "M",
    dotStyle: "square",
    cornerStyle: "square",
    gradient: false,
    gradientTo: "#6C8CFF",
  },
  midnight: {
    fgColor: "#F3F3F6",
    bgColor: "#08080A",
    errorCorrection: "Q",
    dotStyle: "rounded",
    cornerStyle: "rounded",
    gradient: false,
    gradientTo: "#6C8CFF",
  },
  professional: {
    fgColor: "#0A0A0C",
    bgColor: "#FFFFFF",
    errorCorrection: "Q",
    dotStyle: "rounded",
    cornerStyle: "rounded",
    gradient: false,
    gradientTo: "#6C8CFF",
  },
  soft: {
    fgColor: "#3D4A8C",
    bgColor: "#F4F5FB",
    errorCorrection: "Q",
    dotStyle: "dots",
    cornerStyle: "extra-rounded",
    gradient: false,
    gradientTo: "#6C8CFF",
  },
  glass: {
    fgColor: "#6C8CFF",
    bgColor: "#0F0F13",
    errorCorrection: "H",
    dotStyle: "dots",
    cornerStyle: "extra-rounded",
    gradient: true,
    gradientTo: "#8FA5FF",
  },
  bold: {
    fgColor: "#08080A",
    bgColor: "#FBBF24",
    errorCorrection: "H",
    dotStyle: "square",
    cornerStyle: "square",
    gradient: false,
    gradientTo: "#6C8CFF",
  },
};

export function applyPreset(design: QRDesign, preset: Exclude<PresetName, "custom">): QRDesign {
  return { ...design, ...PRESETS[preset], preset };
}
