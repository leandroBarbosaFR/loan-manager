import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        brand: ["var(--font-brand)", "cursive"],
      },
      colors: {
        // Driven by CSS variables in globals.css (light + dark). The channel
        // triples let Tailwind's /opacity modifiers keep working.
        border: "rgb(var(--color-border) / <alpha-value>)",
        // chrome surfaces (sidebar drawer, mobile header)
        background: "rgb(var(--color-background) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        "muted-foreground": "rgb(var(--color-muted-foreground) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        "accent-foreground": "rgb(var(--color-accent-foreground) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "primary-hover": "rgb(var(--color-primary-hover) / <alpha-value>)",
        "primary-foreground": "rgb(var(--color-primary-foreground) / <alpha-value>)",
        ring: "rgb(var(--color-ring) / <alpha-value>)",
        destructive: "rgb(var(--color-destructive) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        // app background behind cards
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        // elevated card/panel surface
        surface: "rgb(var(--color-surface) / <alpha-value>)",
      },
      borderRadius: {
        none: "0",
        DEFAULT: "0.5rem",
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        full: "9999px",
      },
      boxShadow: {
        // Cards and tables are flat (border-only). xs/sm are intentionally no-ops
        // so existing shadow-xs/shadow-sm usages render without elevation.
        xs: "none",
        sm: "none",
        // Kept for overlays that genuinely float: modals, dropdowns, toasts, auth.
        md: "0 6px 18px -4px rgb(0 0 0 / 0.55), 0 2px 6px -2px rgb(0 0 0 / 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
