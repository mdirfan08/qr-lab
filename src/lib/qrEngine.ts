// The rendering core of QR LAB.
//
// We use the `qrcode` package purely to compute the module matrix (the black/white
// grid dictated by the QR spec for a given payload + error-correction level). Everything
// visual — dot shapes, eye shapes, gradients, quiet zone, logo — is drawn ourselves onto
// SVG, which gives us full control over the "designer" experience while staying 100%
// spec-compliant underneath.
import QRCodeLib from "qrcode";
import type { QRDesign } from "../types/qr";

export interface QRMatrix {
  size: number; // modules per side (no quiet zone)
  data: Uint8Array; // size*size, 1 = dark module
}

export async function buildMatrix(payload: string, ec: QRDesign["errorCorrection"]): Promise<QRMatrix> {
  const qr = QRCodeLib.create(payload || " ", { errorCorrectionLevel: ec });
  return { size: qr.modules.size, data: qr.modules.data as unknown as Uint8Array };
}

function isDark(matrix: QRMatrix, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= matrix.size || y >= matrix.size) return false;
  return matrix.data[y * matrix.size + x] === 1;
}

// The three 7x7 finder ("eye") patterns sit at fixed corners for every QR version.
function finderZone(matrix: QRMatrix, x: number, y: number): "outer" | "inner" | null {
  const zones = [
    { x0: 0, y0: 0 },
    { x0: matrix.size - 7, y0: 0 },
    { x0: 0, y0: matrix.size - 7 },
  ];
  for (const z of zones) {
    const lx = x - z.x0;
    const ly = y - z.y0;
    if (lx >= 0 && lx < 7 && ly >= 0 && ly < 7) {
      const onOuterRing = lx === 0 || lx === 6 || ly === 0 || ly === 6;
      const onInnerBlock = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
      if (onOuterRing) return "outer";
      if (onInnerBlock) return "inner";
      return null; // the ring gap, left white
    }
  }
  return null;
}

function dotPath(cx: number, cy: number, s: number, style: QRDesign["dotStyle"]): string {
  const r = s / 2;
  if (style === "dots") {
    const rad = r * 0.82;
    return `M ${cx - rad} ${cy} a ${rad} ${rad} 0 1 0 ${rad * 2} 0 a ${rad} ${rad} 0 1 0 ${-rad * 2} 0 Z`;
  }
  if (style === "rounded") {
    const k = s * 0.32;
    const x0 = cx - r;
    const y0 = cy - r;
    return `M ${x0 + k} ${y0} h ${s - 2 * k} a ${k} ${k} 0 0 1 ${k} ${k} v ${s - 2 * k} a ${k} ${k} 0 0 1 ${-k} ${k} h ${-(s - 2 * k)} a ${k} ${k} 0 0 1 ${-k} ${-k} v ${-(s - 2 * k)} a ${k} ${k} 0 0 1 ${k} ${-k} Z`;
  }
  const x0 = cx - r;
  const y0 = cy - r;
  return `M ${x0} ${y0} h ${s} v ${s} h ${-s} Z`;
}

// A QR finder ("eye") pattern is three concentric, same-winding squares — a 7x7 outer
// ring, a 5x5 white gap, and a solid 3x3 center — combined into one evenodd path.
// (An earlier version of this function only drew the outer ring and omitted the 3x3
// center square. That silently broke every generated QR's finder pattern, since
// scanners locate a QR code by its 1:1:3:1:1 dark/light ratio, which requires that
// solid center. Fixed by adding the third nested square below.)
function eyeRingPath(x0: number, y0: number, s: number, style: QRDesign["cornerStyle"]): string {
  const outer = s * 7;
  const mid = s * 5;
  const inner = s * 3;
  const midOff = s * 1;
  const innerOff = s * 2;
  if (style === "square") {
    const rect = (x: number, y: number, size: number) => `M ${x} ${y} h ${size} v ${size} h ${-size} Z`;
    return `${rect(x0, y0, outer)} ${rect(x0 + midOff, y0 + midOff, mid)} ${rect(x0 + innerOff, y0 + innerOff, inner)}`;
  }
  const rOuter = style === "extra-rounded" ? outer * 0.32 : outer * 0.18;
  const rMid = style === "extra-rounded" ? mid * 0.32 : mid * 0.18;
  const rInner = style === "extra-rounded" ? inner * 0.32 : inner * 0.18;
  const roundedRect = (x: number, y: number, w: number, h: number, r: number) =>
    `M ${x + r} ${y} h ${w - 2 * r} a ${r} ${r} 0 0 1 ${r} ${r} v ${h - 2 * r} a ${r} ${r} 0 0 1 ${-r} ${r} h ${-(w - 2 * r)} a ${r} ${r} 0 0 1 ${-r} ${-r} v ${-(h - 2 * r)} a ${r} ${r} 0 0 1 ${r} ${-r} Z`;
  return `${roundedRect(x0, y0, outer, outer, rOuter)} ${roundedRect(x0 + midOff, y0 + midOff, mid, mid, rMid)} ${roundedRect(x0 + innerOff, y0 + innerOff, inner, inner, rInner)}`;
}

export interface RenderOptions {
  design: QRDesign;
}

// Renders the QR to a self-contained SVG string at `design.size` px.
export function renderSVG(matrix: QRMatrix, opts: RenderOptions): string {
  const { design } = opts;
  const modules = matrix.size + design.quietZone * 2;
  const s = design.size / modules;
  const q = design.quietZone;
  const gradId = "qrGrad";

  let fillDots = "";

  for (let y = 0; y < matrix.size; y++) {
    for (let x = 0; x < matrix.size; x++) {
      if (!isDark(matrix, x, y)) continue;
      const zone = finderZone(matrix, x, y);
      const px = (x + q) * s;
      const py = (y + q) * s;
      if (zone === "outer") continue; // eyes are drawn as whole rings below
      if (zone === "inner") continue;
      fillDots += dotPath(px + s / 2, py + s / 2, s, design.dotStyle);
    }
  }

  const eyeOrigins = [
    { x: 0, y: 0 },
    { x: matrix.size - 7, y: 0 },
    { x: 0, y: matrix.size - 7 },
  ];
  // Each eye is drawn as a single evenodd path: 7x7 ring + white 5x5 gap + solid 3x3 center.
  const eyeGroups = eyeOrigins
    .map((o) => {
      const px = (o.x + q) * s;
      const py = (o.y + q) * s;
      return `<path d="${eyeRingPath(px, py, s, design.cornerStyle)}" fill="${
        design.gradient ? `url(#${gradId})` : design.fgColor
      }" fill-rule="evenodd" />`;
    })
    .join("");

  const bgRect = `<rect width="${design.size}" height="${design.size}" fill="${design.bgColor}" rx="${
    design.dotStyle === "square" ? 0 : design.size * 0.02
  }" />`;

  const gradientDef = design.gradient
    ? `<defs><linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${design.fgColor}" /><stop offset="100%" stop-color="${design.gradientTo}" /></linearGradient></defs>`
    : "";

  const dotsGroup = `<path d="${fillDots}" fill="${design.gradient ? `url(#${gradId})` : design.fgColor}" />`;

  let logoMarkup = "";
  if (design.logoDataUrl) {
    const logoSize = design.size * (design.logoSizePct / 100);
    const cx = design.size / 2;
    const pad = design.logoPaddingPx;
    logoMarkup = `
      <rect x="${cx - logoSize / 2 - pad}" y="${cx - logoSize / 2 - pad}" width="${logoSize + pad * 2}" height="${logoSize + pad * 2}" rx="${(logoSize + pad * 2) * 0.18}" fill="${design.bgColor}" />
      <image href="${design.logoDataUrl}" x="${cx - logoSize / 2}" y="${cx - logoSize / 2}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round ${logoSize * 0.16}px)" />
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${design.size}" height="${design.size}" viewBox="0 0 ${design.size} ${design.size}">${gradientDef}${bgRect}${dotsGroup}${eyeGroups}${logoMarkup}</svg>`;
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export async function svgToPngBlob(svg: string, sizePx: number): Promise<Blob> {
  const img = new Image();
  const url = svgToDataUrl(svg);
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
  const canvas = document.createElement("canvas");
  canvas.width = sizePx;
  canvas.height = sizePx;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, sizePx, sizePx);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
}
