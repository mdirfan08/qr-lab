// A transparent, explainable heuristic reliability scorer.
//
// This is NOT a scan guarantee. It approximates known real-world risk factors for
// QR scanning (contrast, quiet zone, module density, error-correction headroom, logo
// coverage) using published guidance about the QR spec, and reports them as an
// "estimated reliability" with plain-language, actionable explanations.
import type { QRDesign, ReliabilityIssue, ReliabilityResult } from "../types/qr";
import type { QRMatrix } from "./qrEngine";

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean.padEnd(6, "0");
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function contrastRatio(fg: string, bg: string): number {
  const l1 = relLuminance(hexToRgb(fg));
  const l2 = relLuminance(hexToRgb(bg));
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

// Approximate error-tolerance budget QR error correction levels can absorb, expressed
// as % of the code's data area that can be obstructed before scans reliably break.
const EC_TOLERANCE: Record<QRDesign["errorCorrection"], number> = {
  L: 7,
  M: 15,
  Q: 25,
  H: 30,
};

export function analyzeReliability(matrix: QRMatrix, design: QRDesign): ReliabilityResult {
  const issues: ReliabilityIssue[] = [];
  let score = 100;

  // 1. Contrast
  const ratio = contrastRatio(design.fgColor, design.bgColor);
  if (ratio < 3) {
    score -= 30;
    issues.push({
      id: "contrast",
      label: "Contrast",
      severity: "fail",
      detail: `Foreground/background contrast is ${ratio.toFixed(1)}:1 — scanners need clear separation. Aim for at least 4.5:1.`,
      fixable: true,
    });
  } else if (ratio < 4.5) {
    score -= 12;
    issues.push({
      id: "contrast",
      label: "Contrast",
      severity: "warn",
      detail: `Contrast is ${ratio.toFixed(1)}:1. This scans in good conditions, but low light or glare could cause misreads.`,
      fixable: true,
    });
  } else {
    issues.push({ id: "contrast", label: "Contrast", severity: "pass", detail: `Contrast is ${ratio.toFixed(1)}:1 — excellent separation.`, fixable: false });
  }

  // 2. Quiet zone
  if (design.quietZone < 2) {
    score -= 20;
    issues.push({
      id: "quiet-zone",
      label: "Quiet Zone",
      severity: "fail",
      detail: `Quiet zone is only ${design.quietZone} modules. Most scanners need ≥4 modules of blank margin to lock on.`,
      fixable: true,
    });
  } else if (design.quietZone < 4) {
    score -= 6;
    issues.push({
      id: "quiet-zone",
      label: "Quiet Zone",
      severity: "warn",
      detail: `Quiet zone is ${design.quietZone} modules. 4 modules is the safer spec-recommended minimum.`,
      fixable: true,
    });
  } else {
    issues.push({ id: "quiet-zone", label: "Quiet Zone", severity: "pass", detail: `Quiet zone is ${design.quietZone} modules — comfortably above the recommended minimum.`, fixable: false });
  }

  // 3. Error correction
  if (design.errorCorrection === "L") {
    score -= 10;
    issues.push({
      id: "error-correction",
      label: "Error Correction",
      severity: "warn",
      detail: "Error correction is Low. Any print damage, dirt, or a logo overlay has little room for recovery.",
      fixable: true,
    });
  } else {
    issues.push({
      id: "error-correction",
      label: "Error Correction",
      severity: "pass",
      detail: `Error correction is ${design.errorCorrection} — ${EC_TOLERANCE[design.errorCorrection]}% of the code can be obstructed and still recover.`,
      fixable: false,
    });
  }

  // 4. Module size (effective px per module at render size)
  const modulesWithQuiet = matrix.size + design.quietZone * 2;
  const modulePx = design.size / modulesWithQuiet;
  if (modulePx < 4) {
    score -= 15;
    issues.push({
      id: "module-size",
      label: "Module Size",
      severity: "fail",
      detail: `Each module renders at ~${modulePx.toFixed(1)}px. Under 4px, cameras struggle to resolve individual modules — increase the size.`,
      fixable: true,
    });
  } else if (modulePx < 8) {
    score -= 5;
    issues.push({
      id: "module-size",
      label: "Module Size",
      severity: "warn",
      detail: `Each module renders at ~${modulePx.toFixed(1)}px. Fine for screens; for print, aim higher to survive scaling.`,
      fixable: true,
    });
  } else {
    issues.push({ id: "module-size", label: "Module Size", severity: "pass", detail: `Each module renders at ~${modulePx.toFixed(1)}px — comfortably scannable.`, fixable: false });
  }

  // 5. Logo coverage vs EC tolerance
  if (design.logoDataUrl) {
    const coveragePct = design.logoSizePct;
    const tolerance = EC_TOLERANCE[design.errorCorrection];
    if (coveragePct > tolerance) {
      score -= 18;
      issues.push({
        id: "logo-coverage",
        label: "Logo Coverage",
        severity: "fail",
        detail: `Logo covers ~${coveragePct}% of the code, above the ~${tolerance}% this error-correction level can absorb. Shrink the logo or raise error correction.`,
        fixable: true,
      });
    } else if (coveragePct > tolerance * 0.7) {
      score -= 6;
      issues.push({
        id: "logo-coverage",
        label: "Logo Coverage",
        severity: "warn",
        detail: `Logo covers ~${coveragePct}% of the code — within tolerance, but close to the limit for ${design.errorCorrection} correction.`,
        fixable: true,
      });
    } else {
      issues.push({ id: "logo-coverage", label: "Logo Coverage", severity: "pass", detail: `Logo covers ~${coveragePct}% of the code, well within the ${design.errorCorrection}-level tolerance.`, fixable: false });
    }
  }

  // 6. Excessive customization compounding risk
  const stylingRisk = (design.dotStyle === "dots" ? 1 : 0) + (design.gradient ? 1 : 0) + (design.logoDataUrl ? 1 : 0) + (design.cornerStyle !== "square" ? 1 : 0);
  if (stylingRisk >= 3 && design.errorCorrection === "L") {
    score -= 8;
    issues.push({
      id: "styling-risk",
      label: "Combined Styling Load",
      severity: "warn",
      detail: "Multiple decorative choices (dot style, gradient, logo, custom eyes) are stacked on Low error correction. Consider raising error correction to compensate.",
      fixable: true,
    });
  }

  return { score: Math.max(0, Math.min(100, Math.round(score))), issues };
}
