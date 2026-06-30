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
        border: "#e6e7eb",
        background: "#ffffff",
        foreground: "#0a0a0b",
        muted: "#f4f5f7",
        "muted-foreground": "#6b7280",
        accent: "#eef2ff",
        "accent-foreground": "#4338ca",
        primary: "#4f46e5",
        "primary-hover": "#4338ca",
        "primary-foreground": "#ffffff",
        ring: "#6366f1",
        destructive: "#dc2626",
        success: "#16a34a",
        warning: "#d97706",
        // surface for the app background behind cards
        canvas: "#f7f8fa",
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
        xs: "0 1px 2px 0 rgb(16 24 40 / 0.04)",
        sm: "0 1px 3px 0 rgb(16 24 40 / 0.06), 0 1px 2px -1px rgb(16 24 40 / 0.06)",
        md: "0 4px 12px -2px rgb(16 24 40 / 0.08), 0 2px 6px -2px rgb(16 24 40 / 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
