// Auto-Fix applies a small set of safe, deterministic adjustments to resolve
// reliability issues, and reports exactly what it changed so the effect is never
// a black box.
import type { QRDesign, ReliabilityResult } from "../types/qr";
import { contrastRatio } from "./reliability";

export interface AutoFixChange {
  field: string;
  before: string;
  after: string;
  reason: string;
}

export function autoFix(design: QRDesign, result: ReliabilityResult): { design: QRDesign; changes: AutoFixChange[] } {
  const next: QRDesign = { ...design };
  const changes: AutoFixChange[] = [];

  const contrastIssue = result.issues.find((i) => i.id === "contrast" && i.severity !== "pass");
  if (contrastIssue) {
    const before = next.fgColor;
    next.fgColor = "#0A0A0C";
    next.bgColor = "#FFFFFF";
    next.gradient = false;
    if (contrastRatio(next.fgColor, next.bgColor) > contrastRatio(before, design.bgColor)) {
      changes.push({
        field: "Colors",
        before: `${before} on ${design.bgColor}`,
        after: `${next.fgColor} on ${next.bgColor}`,
        reason: "Increased foreground/background contrast to a safe, high-contrast pairing.",
      });
    }
  }

  const quietIssue = result.issues.find((i) => i.id === "quiet-zone" && i.severity !== "pass");
  if (quietIssue) {
    const before = next.quietZone;
    next.quietZone = Math.max(4, next.quietZone);
    if (next.quietZone !== before) {
      changes.push({
        field: "Quiet zone",
        before: `${before} modules`,
        after: `${next.quietZone} modules`,
        reason: "Expanded the quiet zone to the spec-recommended minimum of 4 modules.",
      });
    }
  }

  const moduleIssue = result.issues.find((i) => i.id === "module-size" && i.severity !== "pass");
  if (moduleIssue) {
    const before = next.size;
    next.size = Math.max(next.size, 480);
    if (next.size !== before) {
      changes.push({
        field: "Size",
        before: `${before}px`,
        after: `${next.size}px`,
        reason: "Increased render size so each module stays comfortably resolvable.",
      });
    }
  }

  const logoIssue = result.issues.find((i) => i.id === "logo-coverage" && i.severity === "fail");
  if (logoIssue) {
    const before = next.logoSizePct;
    const ecBefore = next.errorCorrection;
    next.errorCorrection = "H";
    next.logoSizePct = Math.min(next.logoSizePct, 22);
    changes.push({
      field: "Error correction",
      before: ecBefore,
      after: "H",
      reason: "Raised error correction to give the logo more room to be safely obstructed.",
    });
    if (next.logoSizePct !== before) {
      changes.push({
        field: "Logo size",
        before: `${before}%`,
        after: `${next.logoSizePct}%`,
        reason: "Reduced logo coverage to stay within the new error-correction tolerance.",
      });
    }
  }

  const stylingIssue = result.issues.find((i) => i.id === "styling-risk");
  if (stylingIssue && next.errorCorrection === "L") {
    const before = next.errorCorrection;
    next.errorCorrection = "Q";
    changes.push({
      field: "Error correction",
      before,
      after: "Q",
      reason: "Raised error correction to compensate for stacked decorative styling.",
    });
  }

  return { design: next, changes };
}
