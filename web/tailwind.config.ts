import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#EDF0F3",
        surface: "#FFFFFF",
        ink: "#131B24",
        "ink-soft": "#1D2A37",
        border: "#DCE2E8",
        "border-strong": "#C4CDD6",
        "text-primary": "#131B24",
        "text-secondary": "#5E6C7A",
        "text-muted": "#8A97A3",
        "on-ink-muted": "#8CA0B3",
        accent: { DEFAULT: "#1868A0", dark: "#0E5484", soft: "#E4EFF7" },
        success: { DEFAULT: "#1D8A5C", soft: "#E2F4EA" },
        warning: { DEFAULT: "#C77D14", soft: "#FBEEDA" },
        danger: { DEFAULT: "#C13B2A", soft: "#FAE4E0" },
      },
      fontFamily: {
        display: ["Archivo", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      keyframes: {
        pulseRing: { "0%": { transform: "scale(1)", opacity: "0.55" }, "100%": { transform: "scale(2.6)", opacity: "0" } },
        scanline: {
          "0%": { top: "12%", opacity: "0.9" },
          "50%": { top: "85%", opacity: "0.9" },
          "51%": { opacity: "0" },
          "52%": { top: "12%", opacity: "0" },
          "60%": { opacity: "0.9" },
          "100%": { top: "85%", opacity: "0.9" },
        },
      },
      animation: {
        "pulse-ring": "pulseRing 1.8s ease-out infinite",
        scanline: "scanline 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
