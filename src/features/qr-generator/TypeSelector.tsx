import type { QRType } from "../../types/qr";

const TYPES: { value: QRType; label: string; hint: string }[] = [
  { value: "url", label: "URL", hint: "A link to any website" },
  { value: "text", label: "Text", hint: "Any plain text" },
  { value: "email", label: "Email", hint: "Opens a pre-filled email" },
  { value: "phone", label: "Phone", hint: "Starts a phone call" },
  { value: "wifi", label: "Wi-Fi", hint: "Joins a network instantly" },
  { value: "vcard", label: "Contact", hint: "Saves a contact card" },
  { value: "sms", label: "SMS", hint: "Opens a pre-filled text" },
];

interface TypeSelectorProps {
  value: QRType;
  onChange: (type: QRType) => void;
}

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {TYPES.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          aria-pressed={value === t.value}
          className={`text-left rounded-lg px-3 py-2.5 border transition-colors ${
            value === t.value
              ? "bg-accent/10 border-accent/40 text-ink"
              : "bg-base-raised border-base-border text-ink-muted hover:border-base-borderStrong hover:text-ink"
          }`}
        >
          <div className="text-sm font-medium">{t.label}</div>
          <div className="text-[11px] text-ink-faint mt-0.5 leading-tight">{t.hint}</div>
        </button>
      ))}
    </div>
  );
}
