import { useMemo, useState } from "react";
import { useLibrary } from "../hooks/useLibrary";
import { buildPayload } from "../lib/payload";
import { buildMatrix, renderSVG } from "../lib/qrEngine";
import { runTestLab } from "../lib/testLab";
import type { TestResult } from "../types/qr";
import { DEFAULT_DESIGN } from "../lib/presets";
import { QRPreview } from "../features/qr-generator/QRPreview";
import { TestReport } from "../features/test-lab/TestReport";
import { Button } from "../components/ui/Button";
import { TextField } from "../components/ui/Field";

export function TestLabPage() {
  const { records } = useLibrary();
  const [selectedId, setSelectedId] = useState<string | "quick">("quick");
  const [quickUrl, setQuickUrl] = useState("https://gdscsrm.dev");
  const [svg, setSvg] = useState("");
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [running, setRunning] = useState(false);

  const selected = useMemo(() => records.find((r) => r.id === selectedId), [records, selectedId]);

  async function handleRun() {
    setRunning(true);
    setResults(null);
    try {
      const payload = selected ? buildPayload(selected.fields) : quickUrl;
      const design = selected ? selected.design : { ...DEFAULT_DESIGN };
      const matrix = await buildMatrix(payload, design.errorCorrection);
      const generatedSvg = renderSVG(matrix, { design });
      setSvg(generatedSvg);
      const testResults = await runTestLab(generatedSvg);
      setResults(testResults);
    } finally {
      setRunning(false);
    }
  }

  const passCount = results?.filter((r) => r.status === "pass").length ?? 0;

  return (
    <div className="max-w-[1000px] mx-auto px-5 sm:px-8 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Test Lab</h1>
      <p className="text-ink-faint text-sm mt-2 max-w-lg">
        Stress-test a QR design against real-world degradation. Scenarios marked
        "Verified decode" run an actual scan attempt against a degraded raster; others are
        clearly labeled visual simulations.
      </p>

      <div className="panel p-6 mt-8">
        <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-end">
          <div>
            <label className="text-xs text-ink-muted mb-1.5 block">Source</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full rounded-lg bg-base-raised border border-base-border px-3 py-2.5 text-sm text-ink outline-none focus:border-accent/60"
            >
              <option value="quick">Quick test (URL)</option>
              {records.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            {selectedId === "quick" && (
              <div className="mt-3">
                <TextField value={quickUrl} onChange={(e) => setQuickUrl(e.target.value)} placeholder="https://..." />
              </div>
            )}
          </div>
          <Button variant="primary" size="lg" onClick={handleRun} disabled={running}>
            {running ? "Running…" : "Run Stress Test"}
          </Button>
        </div>
      </div>

      {results && (
        <div className="grid md:grid-cols-[220px_1fr] gap-6 mt-6">
          <div className="panel p-6 flex flex-col items-center gap-4">
            <QRPreview svg={svg} size={160} />
            <div className="text-center">
              <div className="num text-2xl font-semibold text-ink">{passCount}/{results.length}</div>
              <div className="text-[11px] text-ink-faint mt-1">scenarios passed</div>
            </div>
          </div>
          <div className="panel px-6">
            <TestReport results={results} />
          </div>
        </div>
      )}
    </div>
  );
}
