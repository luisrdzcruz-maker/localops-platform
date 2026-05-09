import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // PharmaOps brand: a calmer professional palette than ObraRentable.
        // Primary is a desaturated teal/emerald used for trust + pharmacy feel.
        brand: {
          50: "#f1f8f6",
          100: "#dcefe8",
          200: "#bcdfd2",
          300: "#8dc7b3",
          400: "#5ba990",
          500: "#3a8a73",
          600: "#2a6f5d",
          700: "#22594b",
          800: "#1d473d",
          900: "#173830",
          950: "#0d211c"
        },
        ink: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617"
        },
        status: {
          ok: "#16a34a",
          okBg: "#dcfce7",
          warn: "#ca8a04",
          warnBg: "#fef9c3",
          danger: "#dc2626",
          dangerBg: "#fee2e2",
          info: "#0369a1",
          infoBg: "#e0f2fe",
          neutral: "#6b7280",
          neutralBg: "#f3f4f6"
        }
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif"
        ]
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)",
        cardHover: "0 4px 12px -2px rgb(15 23 42 / 0.08), 0 2px 6px -1px rgb(15 23 42 / 0.06)"
      },
      borderRadius: {
        xl: "0.875rem"
      }
    }
  },
  plugins: []
};

export default config;
