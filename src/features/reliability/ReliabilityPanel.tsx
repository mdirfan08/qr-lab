import type { QRDesign, ReliabilityResult } from "../../types/qr";
import { Button } from "../../components/ui/Button";
import { autoFix, type AutoFixChange } from "../../lib/autofix";

interface ReliabilityPanelProps {
  reliability: ReliabilityResult | null;
  design: QRDesign;
  onApplyFix: (design: QRDesign, changes: AutoFixChange[]) => void;
}

function scoreTone(score: number): string {
  if (score >= 85) return "text-good";
  if (score >= 60) return "text-warn";
  return "text-bad";
}

const SEVERITY_ICON: Record<string, string> = {
  pass: "✓",
  warn: "⚠",
  fail: "✕",
};

const SEVERITY_COLOR: Record<string, string> = {
  pass: "text-good",
  warn: "text-warn",
  fail: "text-bad",
};

export function ReliabilityPanel({ reliability, design, onApplyFix }: ReliabilityPanelProps) {
  if (!reliability) {
    return <div className="text-xs text-ink-faint">Generating analysis…</div>;
  }

  const hasFixable = reliability.issues.some((i) => i.severity !== "pass" && i.fixable);

  function handleAutoFix() {
    if (!reliability) return;
    const result = autoFix(design, reliability);
    onApplyFix(result.design, result.changes);
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="text-[11px] uppercase tracking-wide text-ink-faint mb-1">Estimated Reliability</div>
        <div className="flex items-baseline gap-1.5">
          <span className={`num text-4xl font-semibold ${scoreTone(reliability.score)}`}>{reliability.score}</span>
          <span className="text-ink-faint text-sm">/ 100</span>
        </div>
        <p className="text-[11px] text-ink-faint mt-1.5 leading-relaxed">
          An engineering estimate based on contrast, quiet zone, error correction, module size, and logo coverage — not a scan guarantee.
        </p>
      </div>

      <div className="space-y-2.5">
        {reliability.issues.map((issue) => (
          <div key={issue.id} className="flex gap-2.5 text-xs">
            <span className={`${SEVERITY_COLOR[issue.severity]} mt-0.5 shrink-0`} aria-hidden>
              {SEVERITY_ICON[issue.severity]}
            </span>
            <div>
              <div className="text-ink font-medium">{issue.label}</div>
              <div className="text-ink-faint mt-0.5 leading-relaxed">{issue.detail}</div>
            </div>
          </div>
        ))}
      </div>

      {hasFixable && (
        <Button variant="primary" size="md" className="w-full" onClick={handleAutoFix}>
          ✨ Auto-Fix
        </Button>
      )}
    </div>
  );
}
