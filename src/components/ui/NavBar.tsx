export type Route = "landing" | "studio" | "test-lab" | "batch" | "history" | "settings";

interface NavBarProps {
  route: Route;
  onNavigate: (route: Route) => void;
}

const ITEMS: { value: Route; label: string }[] = [
  { value: "studio", label: "Studio" },
  { value: "test-lab", label: "Test Lab" },
  { value: "batch", label: "Batch" },
  { value: "history", label: "History" },
  { value: "settings", label: "Settings" },
];

export function NavBar({ route, onNavigate }: NavBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-base-border bg-base/85 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-2 shrink-0"
          aria-label="QR LAB home"
        >
          <span className="w-5 h-5 grid grid-cols-2 grid-rows-2 gap-[2px]">
            <span className="bg-accent rounded-[1px]" />
            <span className="bg-accent/40 rounded-[1px]" />
            <span className="bg-accent/40 rounded-[1px]" />
            <span className="bg-accent rounded-[1px]" />
          </span>
          <span className="text-sm font-semibold tracking-tight">QR LAB</span>
        </button>

        <nav className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-thin">
          {ITEMS.map((item) => (
            <button
              key={item.value}
              onClick={() => onNavigate(item.value)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap ${
                route === item.value ? "text-ink bg-white/5" : "text-ink-muted hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 text-[11px] text-ink-faint shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-good" />
          Local Mode
        </div>
      </div>
      <nav className="md:hidden flex items-center gap-1 px-5 pb-2 overflow-x-auto scrollbar-thin">
        {ITEMS.map((item) => (
          <button
            key={item.value}
            onClick={() => onNavigate(item.value)}
            className={`px-3 py-1.5 rounded-md text-xs transition-colors whitespace-nowrap shrink-0 ${
              route === item.value ? "text-ink bg-white/5" : "text-ink-muted hover:text-ink"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
