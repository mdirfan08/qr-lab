import { useState } from "react";
import JSZip from "jszip";
import { parseCSV } from "../../lib/csv";
import { buildMatrix, renderSVG, svgToPngBlob } from "../../lib/qrEngine";
import { DEFAULT_DESIGN } from "../../lib/presets";
import { buildPayload } from "../../lib/payload";
import { Button } from "../../components/ui/Button";
import { TextAreaField } from "../../components/ui/Field";
import { QRPreview } from "../qr-generator/QRPreview";
import { useToast } from "../../components/ui/Toast";

interface BatchItem {
  name: string;
  value: string;
  svg: string;
}

export function BatchGenerator() {
  const [raw, setRaw] = useState("Portfolio,https://yourname.dev\nGitHub,https://github.com/yourname\nProject,https://gdscsrm.dev/project");
  const [items, setItems] = useState<BatchItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const [zipping, setZipping] = useState(false);
  const { show } = useToast();

  async function handleGenerate() {
    const rows = parseCSV(raw);
    if (rows.length === 0) {
      show("Add at least one row.", "error");
      return;
    }
    setGenerating(true);
    try {
      const design = { ...DEFAULT_DESIGN, size: 320 };
      const results: BatchItem[] = [];
      for (const row of rows) {
        const payload = buildPayload({ type: "url", url: row.value }) || row.value;
        const matrix = await buildMatrix(payload, design.errorCorrection);
        const svg = renderSVG(matrix, { design });
        results.push({ name: row.name, value: row.value, svg });
      }
      setItems(results);
      show(`${results.length} QR codes generated`, "success");
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownloadOne(item: BatchItem) {
    const blob = await svgToPngBlob(item.svg, 512);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.name.replace(/[^\w-]+/g, "_")}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  async function handleDownloadZip() {
    if (items.length === 0) return;
    setZipping(true);
    try {
      const zip = new JSZip();
      for (const item of items) {
        const blob = await svgToPngBlob(item.svg, 512);
        zip.file(`${item.name.replace(/[^\w-]+/g, "_")}.png`, blob);
      }
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "qr-lab-batch.zip";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      show("ZIP downloaded ✓", "success");
    } finally {
      setZipping(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="panel p-6">
        <label className="text-xs text-ink-muted mb-2 block">
          CSV — one <span className="num">Name,URL</span> pair per line
        </label>
        <TextAreaField rows={6} value={raw} onChange={(e) => setRaw(e.target.value)} />
        <div className="flex items-center justify-between mt-4">
          <p className="text-[11px] text-ink-faint">Each row becomes an independent URL QR code, generated locally.</p>
          <Button variant="primary" onClick={handleGenerate} disabled={generating}>
            {generating ? "Generating…" : "Generate Batch"}
          </Button>
        </div>
      </div>

      {items.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div className="text-sm text-ink-muted">
              <span className="num text-ink font-semibold">{items.length}</span> QR codes generated
            </div>
            <Button variant="secondary" onClick={handleDownloadZip} disabled={zipping}>
              {zipping ? "Zipping…" : "Download All (ZIP)"}
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, i) => (
              <div key={i} className="panel p-4 flex flex-col items-center gap-3">
                <QRPreview svg={item.svg} size={140} />
                <div className="text-center w-full">
                  <div className="text-sm text-ink truncate">{item.name}</div>
                  <div className="text-[11px] text-ink-faint truncate">{item.value}</div>
                </div>
                <Button size="sm" variant="secondary" className="w-full" onClick={() => handleDownloadOne(item)}>
                  Download PNG
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
