import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        raised: "var(--raised)",
        ink: "var(--text)",
        muted: "var(--muted)",
        brand: "var(--violet)",
        focus: "var(--focus)",
        positive: "var(--success)",
        negative: "var(--error)"
      },
      fontFamily: { sans: ["var(--font-jakarta)", "Arial", "sans-serif"] },
      borderRadius: { control: "12px", card: "16px", feature: "24px" },
      maxWidth: { content: "1320px", reading: "68ch" },
      screens: { sm: "640px", lg: "1100px" }
    }
  },
  plugins: []
};

export default config;
