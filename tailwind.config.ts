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
        border: "#262832",
        // chrome surfaces (sidebar drawer, mobile header)
        background: "#0f1015",
        foreground: "#e8e9ee",
        muted: "#1e2029",
        "muted-foreground": "#9599a6",
        accent: "#211d3d",
        "accent-foreground": "#c4b8ff",
        primary: "#7c5cff",
        "primary-hover": "#6b49f0",
        "primary-foreground": "#ffffff",
        ring: "#7c5cff",
        destructive: "#f05252",
        success: "#22c55e",
        warning: "#f59e0b",
        // app background behind cards (darkest layer)
        canvas: "#0b0c10",
        // elevated card/panel surface (replaces the old bg-white)
        surface: "#161821",
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
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.35)",
        sm: "0 1px 3px 0 rgb(0 0 0 / 0.45), 0 1px 2px -1px rgb(0 0 0 / 0.45)",
        md: "0 6px 18px -4px rgb(0 0 0 / 0.55), 0 2px 6px -2px rgb(0 0 0 / 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
