// Download helpers — PNG (rasterized) and SVG (vector, matches the preview exactly).
import { renderSVG, svgToPngBlob, buildMatrix } from "./qrEngine";
import type { QRDesign } from "../types/qr";

export async function downloadPNG(payload: string, design: QRDesign, filename: string): Promise<void> {
  const matrix = await buildMatrix(payload, design.errorCorrection);
  const svg = renderSVG(matrix, { design });
  const blob = await svgToPngBlob(svg, Math.max(design.size, 512));
  triggerDownload(blob, `${filename}.png`);
}

export async function downloadSVG(payload: string, design: QRDesign, filename: string): Promise<void> {
  const matrix = await buildMatrix(payload, design.errorCorrection);
  const svg = renderSVG(matrix, { design });
  const blob = new Blob([svg], { type: "image/svg+xml" });
  triggerDownload(blob, `${filename}.svg`);
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
