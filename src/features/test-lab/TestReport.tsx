import type { TestResult } from "../../types/qr";

const STATUS_COLOR: Record<TestResult["status"], string> = {
  pass: "text-good",
  warn: "text-warn",
  fail: "text-bad",
};

const STATUS_LABEL: Record<TestResult["status"], string> = {
  pass: "PASS",
  warn: "WARNING",
  fail: "FAIL",
};

export function TestReport({ results }: { results: TestResult[] }) {
  return (
    <div className="divide-y divide-base-border">
      {results.map((r) => (
        <div key={r.id} className="py-3.5 flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-ink font-medium">{r.label}</div>
            <div className="text-[11px] text-ink-faint mt-1 leading-relaxed max-w-md">{r.detail}</div>
            <div className="text-[10px] text-ink-faint/70 mt-1 uppercase tracking-wide">
              {r.method === "decoded" ? "Verified decode" : "Visual stress simulation"}
            </div>
          </div>
          <span className={`num text-xs font-semibold shrink-0 ${STATUS_COLOR[r.status]}`}>{STATUS_LABEL[r.status]}</span>
        </div>
      ))}
    </div>
  );
}
