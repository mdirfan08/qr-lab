import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]";

const variants: Record<string, string> = {
  primary: "bg-accent text-white hover:bg-accent-soft shadow-[0_0_0_1px_rgba(108,140,255,0.4)]",
  secondary: "bg-base-surface border border-base-border text-ink hover:border-base-borderStrong hover:bg-base-raised",
  ghost: "text-ink-muted hover:text-ink hover:bg-white/5",
  danger: "bg-bad/10 text-bad border border-bad/30 hover:bg-bad/20",
};

const sizes: Record<string, string> = {
  sm: "text-xs px-2.5 py-1.5",
  md: "text-sm px-4 py-2.5",
  lg: "text-base px-6 py-3.5",
};

export function Button({ variant = "secondary", size = "md", icon, className = "", children, ...rest }: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {icon}
      {children}
    </button>
  );
}
