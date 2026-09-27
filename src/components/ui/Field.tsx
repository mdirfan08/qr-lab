import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

interface FieldWrapProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export function FieldWrap({ label, error, children }: FieldWrapProps) {
  return (
    <div>
      <label className="text-xs text-ink-muted mb-1.5 block">{label}</label>
      {children}
      {error && <p className="text-[11px] text-bad mt-1.5">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg bg-base-raised border border-base-border focus:border-accent/60 px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none transition-colors";

export function TextField({ error, ...rest }: InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return <input {...rest} className={`${inputClass} ${error ? "border-bad/50" : ""}`} />;
}

export function TextAreaField({ error, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return <textarea {...rest} className={`${inputClass} resize-none ${error ? "border-bad/50" : ""}`} />;
}
