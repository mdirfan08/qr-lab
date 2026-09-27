import { describe, expect, it } from "vitest";
import { contrastRatio, analyzeReliability } from "../reliability";
import { DEFAULT_DESIGN } from "../presets";
import type { QRMatrix } from "../qrEngine";

function fakeMatrix(size = 25): QRMatrix {
  const data = new Uint8Array(size * size);
  for (let i = 0; i < data.length; i++) data[i] = i % 3 === 0 ? 1 : 0;
  return { size, data };
}

describe("contrastRatio", () => {
  it("returns 21:1 for pure black on white", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 0);
  });

  it("returns close to 1:1 for identical colors", () => {
    expect(contrastRatio("#6C8CFF", "#6C8CFF")).toBeCloseTo(1, 1);
  });
});

describe("analyzeReliability", () => {
  it("scores a well-configured design highly with no failing issues", () => {
    const result = analyzeReliability(fakeMatrix(), { ...DEFAULT_DESIGN, quietZone: 4, errorCorrection: "H" });
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.issues.some((i) => i.severity === "fail")).toBe(false);
  });

  it("penalizes low contrast, small quiet zone, and small size", () => {
    const result = analyzeReliability(fakeMatrix(), {
      ...DEFAULT_DESIGN,
      fgColor: "#CCCCCC",
      bgColor: "#FFFFFF",
      quietZone: 0,
      size: 80,
      errorCorrection: "L",
    });
    expect(result.score).toBeLessThan(70);
    expect(result.issues.find((i) => i.id === "contrast")?.severity).not.toBe("pass");
    expect(result.issues.find((i) => i.id === "quiet-zone")?.severity).toBe("fail");
  });

  it("flags logo coverage that exceeds the error-correction tolerance", () => {
    const result = analyzeReliability(fakeMatrix(), {
      ...DEFAULT_DESIGN,
      errorCorrection: "L",
      logoDataUrl: "data:image/png;base64,AAAA",
      logoSizePct: 25,
    });
    const logoIssue = result.issues.find((i) => i.id === "logo-coverage");
    expect(logoIssue?.severity).toBe("fail");
  });
});
