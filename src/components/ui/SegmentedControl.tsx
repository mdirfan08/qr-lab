interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
}

export function SegmentedControl<T extends string>({ options, value, onChange, label }: SegmentedControlProps<T>) {
  return (
    <div>
      {label && <div className="text-xs text-ink-muted mb-2">{label}</div>}
      <div className="flex p-0.5 rounded-lg bg-base-raised border border-base-border gap-0.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={value === opt.value}
            className={`flex-1 text-xs px-2 py-1.5 rounded-md transition-colors ${
              value === opt.value ? "bg-accent text-white" : "text-ink-muted hover:text-ink"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
