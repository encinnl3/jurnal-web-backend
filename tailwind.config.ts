import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0A0A0A",
          secondary: "#111111",
          tertiary: "#1A1A1A",
        },
        border: "#2A2A2A",
        text: {
          primary: "#F5F5F5",
          secondary: "#A0A0A0",
          muted: "#555555",
        },
        accent: {
          teal: "#00B4A6",
          "teal-dim": "#007A70",
          orange: "#F97316",
          "orange-dim": "#C05A0D",
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
