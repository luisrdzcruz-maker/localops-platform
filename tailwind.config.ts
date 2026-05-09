import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f7fb",
          100: "#e8eef8",
          500: "#315f9c",
          700: "#24446f",
          950: "#101927"
        },
        obra: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#172554",
          950: "#0c1739"
        },
        rentable: {
          healthy: "#16a34a",
          healthyBg: "#dcfce7",
          pending: "#ca8a04",
          pendingBg: "#fef9c3",
          risk: "#dc2626",
          riskBg: "#fee2e2",
          neutral: "#6b7280",
          neutralBg: "#f3f4f6"
        }
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"]
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)"
      }
    }
  },
  plugins: []
};
export default config;
