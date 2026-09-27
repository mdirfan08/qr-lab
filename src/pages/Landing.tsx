import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/Button";
import { QRPreview } from "../features/qr-generator/QRPreview";
import { buildMatrix, renderSVG } from "../lib/qrEngine";
import { DEFAULT_DESIGN, applyPreset } from "../lib/presets";
import type { Route } from "../components/ui/NavBar";

interface LandingProps {
  onNavigate: (route: Route) => void;
}

const DEMO_PAYLOAD = "https://gdscsrm.dev/qr-lab";

export function Landing({ onNavigate }: LandingProps) {
  const [svg, setSvg] = useState("");
  const design = useMemo(() => applyPreset(DEFAULT_DESIGN, "glass"), []);

  useEffect(() => {
    let cancelled = false;
    buildMatrix(DEMO_PAYLOAD, design.errorCorrection).then((matrix) => {
      if (!cancelled) setSvg(renderSVG(matrix, { design: { ...design, size: 320 } }));
    });
    return () => {
      cancelled = true;
    };
  }, [design]);

  return (
    <div className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-grid pointer-events-none opacity-60"
        style={{ backgroundSize: "42px 42px", maskImage: "radial-gradient(ellipse at 50% 20%, black, transparent 70%)" }}
      />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-accent/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative max-w-[1200px] mx-auto px-6 sm:px-8 pt-20 sm:pt-28 pb-24">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          <div style={{ animation: "fadeUp 0.5s ease-out" }}>
            <div className="inline-flex items-center gap-2 text-[11px] text-ink-faint border border-base-border rounded-full px-3 py-1 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-good" />
              Runs entirely in your browser
            </div>
            <h1 className="text-6xl sm:text-7xl font-semibold tracking-tight leading-[0.95]">
              QR LAB
            </h1>
            <p className="text-xl sm:text-2xl text-ink-muted mt-4 font-medium">
              Generate. Design. Stress-test.
            </p>
            <p className="text-base text-ink-faint mt-5 max-w-md leading-relaxed">
              Create beautiful QR codes engineered for real-world scanning — with a
              transparent reliability engine and a dedicated lab to stress-test every design
              before it ships.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-9">
              <Button variant="primary" size="lg" onClick={() => onNavigate("studio")}>
                Create QR
              </Button>
              <Button variant="secondary" size="lg" onClick={() => onNavigate("test-lab")}>
                Explore Demo
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-14 max-w-md">
              {[
                { k: "7", v: "QR types" },
                { k: "8", v: "stress tests" },
                { k: "0", v: "servers involved" },
              ].map((s) => (
                <div key={s.v}>
                  <div className="num text-2xl font-semibold text-ink">{s.k}</div>
                  <div className="text-[11px] text-ink-faint mt-1">{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end" style={{ animation: "fadeUp 0.6s ease-out 0.08s both" }}>
            <div className="p-8 rounded-[28px] border border-base-border bg-base-surface/60 backdrop-blur-sm shadow-glow">
              <QRPreview svg={svg} size={320} scanning />
              <div className="flex items-center justify-between mt-5 px-1">
                <span className="text-[11px] text-ink-faint num">gdscsrm.dev/qr-lab</span>
                <span className="text-[11px] text-good flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-good" /> 96 reliability
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
