import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Obsidian Edge surface system
        base:     "var(--bg-base)",
        surface:  "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        overlay:  "var(--bg-overlay)",
        inset:    "var(--bg-inset)",

        // Borders
        border: {
          DEFAULT: "var(--border-default)",
          strong:  "var(--border-strong)",
          focus:   "var(--border-focus)",
        },

        // Accent
        accent: {
          DEFAULT: "var(--accent)",
          hover:   "var(--accent-hover)",
          dim:     "var(--accent-dim)",
        },

        // Text
        primary:   "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted:     "var(--text-muted)",

        // Status
        valid:   "var(--status-valid)",
        invalid: "var(--status-invalid)",
        warning: "var(--status-warning)",

        // shadcn compatibility aliases
        background:             "var(--bg-base)",
        foreground:             "var(--text-primary)",
        card:                   { DEFAULT: "var(--bg-surface)", foreground: "var(--text-primary)" },
        popover:                { DEFAULT: "var(--bg-overlay)", foreground: "var(--text-primary)" },
        "shadcn-primary":       { DEFAULT: "var(--accent)", foreground: "var(--bg-base)" },
        "shadcn-secondary":     { DEFAULT: "var(--bg-elevated)", foreground: "var(--text-primary)" },
        "shadcn-muted":         { DEFAULT: "var(--bg-elevated)", foreground: "var(--text-secondary)" },
        "shadcn-accent":        { DEFAULT: "var(--bg-elevated)", foreground: "var(--text-primary)" },
        destructive:            { DEFAULT: "var(--status-invalid)", foreground: "var(--text-primary)" },
        input:                  "var(--bg-inset)",
        ring:                   "var(--accent)",
      },

      fontFamily: {
        sans: ["Inter Variable", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono Variable", "JetBrains Mono", "ui-monospace", "monospace"],
      },

      fontSize: {
        "2xs": ["11px", { lineHeight: "1.4" }],
      },

      borderRadius: {
        none: "0",
        sm:   "2px",
        DEFAULT: "3px",
        md:   "4px",
        lg:   "6px",
      },

      spacing: {
        "4.5": "18px",
        "13":  "52px",
        "15":  "60px",
        "17":  "68px",
        "18":  "72px",
      },

      letterSpacing: {
        tightest: "-0.03em",
        tighter:  "-0.025em",
        tight:    "-0.02em",
        snug:     "-0.015em",
        normal:   "-0.01em",
        wide:     "0.08em",
        wider:    "0.10em",
      },

      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.4" },
        },
      },

      animation: {
        "fade-in": "fade-in 200ms ease-out",
        pulse:     "pulse 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
