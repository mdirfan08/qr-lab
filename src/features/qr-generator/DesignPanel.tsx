import { useRef } from "react";
import type { QRDesign, PresetName } from "../../types/qr";
import { Slider } from "../../components/ui/Slider";
import { ColorInput } from "../../components/ui/ColorInput";
import { SegmentedControl } from "../../components/ui/SegmentedControl";
import { Toggle } from "../../components/ui/Toggle";
import { Button } from "../../components/ui/Button";
import { applyPreset, PRESETS } from "../../lib/presets";

interface DesignPanelProps {
  design: QRDesign;
  onChange: (design: QRDesign) => void;
}

const PRESET_LABELS: Record<Exclude<PresetName, "custom">, string> = {
  minimal: "Minimal",
  midnight: "Midnight",
  professional: "Professional",
  soft: "Soft",
  glass: "Glass",
  bold: "Bold",
};

export function DesignPanel({ design, onChange }: DesignPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleLogoFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => onChange({ ...design, logoDataUrl: reader.result as string, preset: "custom" });
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-ink-muted mb-2">Presets</div>
        <div className="grid grid-cols-3 gap-1.5">
          {(Object.keys(PRESETS) as Exclude<PresetName, "custom">[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChange(applyPreset(design, p))}
              aria-pressed={design.preset === p}
              className={`rounded-lg border px-2 py-2 text-[11px] transition-colors ${
                design.preset === p
                  ? "border-accent/50 bg-accent/10 text-ink"
                  : "border-base-border bg-base-raised text-ink-muted hover:text-ink hover:border-base-borderStrong"
              }`}
            >
              {PRESET_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ColorInput label="Foreground" value={design.fgColor} onChange={(fgColor) => onChange({ ...design, fgColor, preset: "custom" })} />
        <ColorInput label="Background" value={design.bgColor} onChange={(bgColor) => onChange({ ...design, bgColor, preset: "custom" })} />
      </div>

      <Toggle
        label="Gradient foreground"
        checked={design.gradient}
        onChange={(gradient) => onChange({ ...design, gradient, preset: "custom" })}
      />
      {design.gradient && (
        <ColorInput label="Gradient to" value={design.gradientTo} onChange={(gradientTo) => onChange({ ...design, gradientTo, preset: "custom" })} />
      )}

      <SegmentedControl
        label="Dot style"
        value={design.dotStyle}
        onChange={(dotStyle) => onChange({ ...design, dotStyle, preset: "custom" })}
        options={[
          { value: "square", label: "Square" },
          { value: "rounded", label: "Rounded" },
          { value: "dots", label: "Dots" },
        ]}
      />

      <SegmentedControl
        label="Eye style"
        value={design.cornerStyle}
        onChange={(cornerStyle) => onChange({ ...design, cornerStyle, preset: "custom" })}
        options={[
          { value: "square", label: "Square" },
          { value: "rounded", label: "Rounded" },
          { value: "extra-rounded", label: "Soft" },
        ]}
      />

      <Slider label="Size" value={design.size} min={200} max={800} step={20} unit="px" onChange={(size) => onChange({ ...design, size })} />
      <Slider label="Quiet zone" value={design.quietZone} min={0} max={10} unit=" mod" onChange={(quietZone) => onChange({ ...design, quietZone })} />

      <SegmentedControl
        label="Error correction"
        value={design.errorCorrection}
        onChange={(errorCorrection) => onChange({ ...design, errorCorrection })}
        options={[
          { value: "L", label: "L" },
          { value: "M", label: "M" },
          { value: "Q", label: "Q" },
          { value: "H", label: "H" },
        ]}
      />

      <div className="pt-2 border-t border-base-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-muted">Logo</span>
          <div className="flex gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLogoFile(file);
              }}
            />
            <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()}>
              {design.logoDataUrl ? "Replace" : "Upload"}
            </Button>
            {design.logoDataUrl && (
              <Button size="sm" variant="ghost" onClick={() => onChange({ ...design, logoDataUrl: null })}>
                Remove
              </Button>
            )}
          </div>
        </div>
        {design.logoDataUrl && (
          <>
            <Slider label="Logo size" value={design.logoSizePct} min={8} max={30} unit="%" onChange={(logoSizePct) => onChange({ ...design, logoSizePct })} />
            <Slider label="Logo padding" value={design.logoPaddingPx} min={0} max={24} unit="px" onChange={(logoPaddingPx) => onChange({ ...design, logoPaddingPx })} />
          </>
        )}
      </div>
    </div>
  );
}
