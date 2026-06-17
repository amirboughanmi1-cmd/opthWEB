import type { Config } from "tailwindcss";

/**
 * OphtaHealth design system — tokens derived from DESIGN.md (ophtahealth_precision).
 * Single source of truth for colors, typography, spacing and radii across all screens.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Core brand
        primary: "#206171",
        "primary-container": "#3d7a8a",
        "on-primary": "#ffffff",
        "on-primary-container": "#edfaff",
        secondary: "#006878",
        "on-secondary": "#ffffff",
        "secondary-container": "#5fe2fe",
        "on-secondary-container": "#006373",
        tertiary: "#7f4e26",
        // Surfaces
        background: "#f8f9ff",
        "on-background": "#0b1c30",
        surface: "#f8f9ff",
        "surface-bright": "#f8f9ff",
        "surface-dim": "#cbdbf5",
        "surface-gray": "#F8FAFC",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eff4ff",
        "surface-container": "#e5eeff",
        "surface-container-high": "#dce9ff",
        "surface-container-highest": "#d3e4fe",
        "surface-variant": "#d3e4fe",
        "clinical-white": "#FFFFFF",
        "inverse-surface": "#213145",
        "inverse-on-surface": "#eaf1ff",
        // Text & lines
        "on-surface": "#0b1c30",
        "on-surface-variant": "#40484b",
        outline: "#70787b",
        "outline-variant": "#bfc8cb",
        // Semantic
        "status-success": "#10B981",
        "diagnostic-blue": "#0EA5E9",
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        whatsapp: "#25D366",
        "whatsapp-dark": "#0a7d3f",
      },
      fontFamily: {
        sans: ["var(--font-hanken)", "system-ui", "sans-serif"],
        display: ["var(--font-hanken)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      fontSize: {
        "display-lg": ["64px", { lineHeight: "72px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-md": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-caps": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "500" }],
        "data-reading": ["14px", { lineHeight: "20px", fontWeight: "400" }],
      },
      spacing: {
        "margin-edge": "32px",
        gutter: "24px",
      },
      maxWidth: {
        "container-max": "1280px",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
      keyframes: {
        scroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        scroll: "scroll 30s linear infinite",
        fadeIn: "fadeIn 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
