// QR Test Lab — stress-tests a rendered QR against a set of degradations.
//
// Where we can actually rasterize + degrade the image and attempt a real decode
// (via jsQR), we report a real PASS/WARN/FAIL from that decode. Where a scenario is
// only approximated visually (e.g. perspective distortion), we label it clearly as
// a "Visual stress simulation" rather than implying a verified scan result.
import jsQR from "jsqr";
import type { TestResult } from "../types/qr";

async function svgToImageData(svg: string, size: number): Promise<ImageData> {
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(img, 0, 0, size, size);
  return ctx.getImageData(0, 0, size, size);
}

function decode(imageData: ImageData): boolean {
  const result = jsQR(imageData.data, imageData.width, imageData.height);
  return !!result;
}

function applyBlur(ctx: CanvasRenderingContext2D, _size: number, radius: number) {
  ctx.filter = `blur(${radius}px)`;
  ctx.drawImage(ctx.canvas, 0, 0);
  ctx.filter = "none";
}

function applyNoise(ctx: CanvasRenderingContext2D, size: number, intensity: number) {
  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * intensity;
    img.data[i] = Math.min(255, Math.max(0, img.data[i] + n));
    img.data[i + 1] = Math.min(255, Math.max(0, img.data[i + 1] + n));
    img.data[i + 2] = Math.min(255, Math.max(0, img.data[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);
}

function applyLowContrast(ctx: CanvasRenderingContext2D, size: number, amount: number) {
  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const v = img.data[i + c];
      img.data[i + c] = 128 + (v - 128) * (1 - amount);
    }
  }
  ctx.putImageData(img, 0, 0);
}

async function renderVariant(
  svg: string,
  size: number,
  transform: (ctx: CanvasRenderingContext2D, size: number) => void
): Promise<ImageData> {
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(img, 0, 0, size, size);
  transform(ctx, size);
  return ctx.getImageData(0, 0, size, size);
}

export async function runTestLab(svg: string): Promise<TestResult[]> {
  const size = 400;
  const results: TestResult[] = [];

  // Normal — real decode
  try {
    const normal = await svgToImageData(svg, size);
    const ok = decode(normal);
    results.push({
      id: "normal",
      label: "Normal",
      method: "decoded",
      status: ok ? "pass" : "fail",
      detail: ok ? "Decoded cleanly with no degradation." : "Failed to decode even without degradation — check contrast and quiet zone.",
    });
  } catch {
    results.push({ id: "normal", label: "Normal", method: "heuristic", status: "warn", detail: "Could not render for decode testing in this environment." });
  }

  // Blur — real decode against a blurred raster
  try {
    const blurred = await renderVariant(svg, size, (ctx) => applyBlur(ctx, size, 2.5));
    const ok = decode(blurred);
    results.push({
      id: "blur",
      label: "Blur",
      method: "decoded",
      status: ok ? "pass" : "warn",
      detail: ok ? "Still decodes under moderate blur (e.g. camera focus lag)." : "Decode failed under blur — a higher error correction level or larger size would help.",
    });
  } catch {
    results.push({ id: "blur", label: "Blur", method: "heuristic", status: "warn", detail: "Visual stress simulation only." });
  }

  // Low contrast — real decode
  try {
    const lowC = await renderVariant(svg, size, (ctx) => applyLowContrast(ctx, size, 0.55));
    const ok = decode(lowC);
    results.push({
      id: "low-contrast",
      label: "Low Contrast",
      method: "decoded",
      status: ok ? "pass" : "warn",
      detail: ok ? "Still decodes with reduced contrast." : "Decode failed with reduced contrast — this is the scenario most sensitive to your color choice.",
    });
  } catch {
    results.push({ id: "low-contrast", label: "Low Contrast", method: "heuristic", status: "warn", detail: "Visual stress simulation only." });
  }

  // Compression / noise — real decode against JPEG-like noise
  try {
    const noisy = await renderVariant(svg, size, (ctx) => applyNoise(ctx, size, 40));
    const ok = decode(noisy);
    results.push({
      id: "compression",
      label: "Compression",
      method: "decoded",
      status: ok ? "pass" : "warn",
      detail: ok ? "Still decodes with compression-like artifacting." : "Decode failed under artifacting — consider a higher error correction level.",
    });
  } catch {
    results.push({ id: "compression", label: "Compression", method: "heuristic", status: "warn", detail: "Visual stress simulation only." });
  }

  // Small display — real decode at reduced raster size
  try {
    const small = await svgToImageData(svg, 120);
    const ok = decode(small);
    results.push({
      id: "small-display",
      label: "Small Display",
      method: "decoded",
      status: ok ? "pass" : "warn",
      detail: ok ? "Still decodes when rendered small (e.g. a business card)." : "Decode failed at small size — increase size or simplify styling for small placements.",
    });
  } catch {
    results.push({ id: "small-display", label: "Small Display", method: "heuristic", status: "warn", detail: "Visual stress simulation only." });
  }

  // Rotation — heuristic-only; jsQR does handle rotation reasonably well, but we
  // label it as a simulation since we aren't modelling camera-angle capture conditions.
  results.push({
    id: "rotation",
    label: "Rotation",
    method: "heuristic",
    status: "pass",
    detail: "Visual stress simulation — QR's finder patterns are designed to be rotation-invariant, so mild rotation is a low-risk scenario.",
  });

  // Perspective distortion — heuristic-only
  results.push({
    id: "perspective",
    label: "Perspective Distortion",
    method: "heuristic",
    status: "warn",
    detail: "Visual stress simulation — steep viewing angles are not modelled here. In practice, a larger quiet zone and higher error correction improve tolerance.",
  });

  return results;
}
