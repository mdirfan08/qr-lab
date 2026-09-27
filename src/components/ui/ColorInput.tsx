interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div>
      <label className="text-xs text-ink-muted mb-2 block">{label}</label>
      <div className="flex items-center gap-2 rounded-lg border border-base-border bg-base-raised px-2.5 py-2">
        <span className="relative w-6 h-6 rounded-md overflow-hidden border border-base-border shrink-0">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -top-1 -left-1 w-9 h-9 cursor-pointer"
            aria-label={label}
          />
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="num text-xs bg-transparent outline-none text-ink w-full"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
