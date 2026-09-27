interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

export function Slider({ label, value, min, max, step = 1, unit = "", onChange }: SliderProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs text-ink-muted">{label}</label>
        <span className="num text-xs text-ink">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-accent cursor-pointer"
        aria-label={label}
      />
    </div>
  );
}
