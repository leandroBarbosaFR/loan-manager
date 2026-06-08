import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        border: "#e5e5e5",
        background: "#ffffff",
        foreground: "#000000",
        muted: "#f5f5f5",
        "muted-foreground": "#666666",
        accent: "#f0f0f0",
        destructive: "#b00020",
        success: "#0a7d2c",
        warning: "#9a6700",
      },
      borderRadius: {
        none: "0",
      },
    },
  },
  plugins: [],
};

export default config;
