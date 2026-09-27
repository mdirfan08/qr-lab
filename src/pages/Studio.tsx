import { useEffect, useMemo, useState } from "react";
import type { QRFields, QRType } from "../types/qr";
import { defaultFieldsFor, buildPayload } from "../lib/payload";
import { validateFields, isValid } from "../lib/validation";
import { DEFAULT_DESIGN } from "../lib/presets";
import { useQRRender } from "../hooks/useQRRender";
import { useLibrary } from "../hooks/useLibrary";
import { genId } from "../lib/storage";
import { downloadPNG, downloadSVG } from "../lib/download";
import { useToast } from "../components/ui/Toast";
import { TypeSelector } from "../features/qr-generator/TypeSelector";
import { QRTypeForm } from "../features/qr-generator/QRTypeForm";
import { QRPreview } from "../features/qr-generator/QRPreview";
import { DesignPanel } from "../features/qr-generator/DesignPanel";
import { ReliabilityPanel } from "../features/reliability/ReliabilityPanel";
import { Button } from "../components/ui/Button";
import type { AutoFixChange } from "../lib/autofix";
import type { QRRecord } from "../types/qr";

interface StudioProps {
  seed?: QRRecord | null;
}

export function Studio({ seed }: StudioProps) {
  const [fields, setFields] = useState<QRFields>(seed?.fields ?? defaultFieldsFor("url"));
  const [design, setDesign] = useState(seed?.design ?? DEFAULT_DESIGN);
  const [name, setName] = useState(seed?.name ?? "Untitled QR");
  const [lastFix, setLastFix] = useState<AutoFixChange[] | null>(null);
  const [downloading, setDownloading] = useState<"png" | "svg" | null>(null);

  const { save } = useLibrary();
  const { show } = useToast();

  // If the user opens a different saved record while already in the Studio, resync.
  const seedId = seed?.id ?? null;
  useEffect(() => {
    if (seed) {
      setFields(seed.fields);
      setDesign(seed.design);
      setName(seed.name);
      setLastFix(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedId]);

  const errors = useMemo(() => validateFields(fields), [fields]);
  const payload = useMemo(() => buildPayload(fields), [fields]);
  const { svg, reliability } = useQRRender(payload, design);
  const valid = isValid(fields) && payload.length > 0;

  function handleTypeChange(type: QRType) {
    setFields(defaultFieldsFor(type));
    setLastFix(null);
  }

  function handleApplyFix(nextDesign: typeof design, changes: AutoFixChange[]) {
    setDesign(nextDesign);
    setLastFix(changes);
    show(`Reliability improved — ${changes.length} adjustment${changes.length === 1 ? "" : "s"} applied`, "success");
  }

  function handleSave() {
    if (!valid || !reliability) {
      show("Fill in the required fields before saving.", "error");
      return;
    }
    save({
      id: genId(),
      name: name.trim() || "Untitled QR",
      createdAt: Date.now(),
      fields,
      design,
      reliabilityScore: reliability.score,
    });
    show("Saved to your library", "success");
  }

  async function handleDownload(kind: "png" | "svg") {
    if (!valid) {
      show("Fill in the required fields before downloading.", "error");
      return;
    }
    setDownloading(kind);
    try {
      if (kind === "png") await downloadPNG(payload, design, name.trim() || "qr-lab");
      else await downloadSVG(payload, design, name.trim() || "qr-lab");
      show("Downloaded ✓", "success");
    } catch {
      show("Download failed — try again.", "error");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-8">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-transparent text-2xl font-semibold tracking-tight outline-none border-b border-transparent focus:border-base-border pb-1 min-w-0"
          aria-label="QR name"
        />
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleSave}>Save to Library</Button>
          <Button variant="secondary" disabled={downloading === "svg"} onClick={() => handleDownload("svg")}>
            {downloading === "svg" ? "Preparing…" : "Download SVG"}
          </Button>
          <Button variant="primary" disabled={downloading === "png"} onClick={() => handleDownload("png")}>
            {downloading === "png" ? "Preparing…" : "Download PNG"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr_320px] gap-5">
        <div className="panel p-5 space-y-5 order-1">
          <h2 className="text-xs uppercase tracking-wide text-ink-faint">Content</h2>
          <TypeSelector value={fields.type} onChange={handleTypeChange} />
          <div className="pt-1">
            <QRTypeForm fields={fields} errors={errors} onChange={setFields} />
          </div>
        </div>

        <div className="panel p-8 flex flex-col items-center justify-center order-3 lg:order-2 min-h-[420px]">
          <QRPreview svg={svg} size={320} />
          {!valid && (
            <p className="text-xs text-ink-faint mt-5 text-center max-w-xs">
              Fill in the fields on the left — the preview updates in real time.
            </p>
          )}
          {lastFix && lastFix.length > 0 && (
            <div className="mt-6 w-full max-w-xs rounded-lg border border-good/25 bg-good/5 p-3.5">
              <div className="text-[11px] text-good font-medium mb-2">Reliability improved</div>
              <ul className="space-y-1.5">
                {lastFix.map((c, i) => (
                  <li key={i} className="text-[11px] text-ink-faint leading-relaxed">
                    <span className="text-ink">{c.field}:</span> {c.before} → {c.after}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="panel p-5 space-y-6 order-2 lg:order-3">
          <div>
            <h2 className="text-xs uppercase tracking-wide text-ink-faint mb-4">Design</h2>
            <DesignPanel design={design} onChange={(d) => { setDesign(d); setLastFix(null); }} />
          </div>
          <div className="pt-5 border-t border-base-border">
            <h2 className="text-xs uppercase tracking-wide text-ink-faint mb-4">Reliability</h2>
            <ReliabilityPanel reliability={reliability} design={design} onApplyFix={handleApplyFix} />
          </div>
        </div>
      </div>
    </div>
  );
}
