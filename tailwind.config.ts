import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "#08080A",
          raised: "#0F0F13",
          surface: "#141419",
          border: "rgba(255,255,255,0.08)",
          borderStrong: "rgba(255,255,255,0.14)",
        },
        ink: {
          DEFAULT: "#F3F3F6",
          muted: "#9A9AA4",
          faint: "#5E5E68",
        },
        accent: {
          DEFAULT: "#6C8CFF",
          soft: "#8FA5FF",
          dim: "#3D4A8C",
        },
        good: "#4ADE80",
        warn: "#FBBF24",
        bad: "#FB7185",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 120px 40px rgba(108,140,255,0.10)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
} satisfies Config;
