import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0b0d14",
        panel: "#101526",
        panel2: "#151b31",
        accent: {
          DEFAULT: "#e0332f",
          dark: "#b3241f",
          light: "#ff5b52",
        },
        line: "#232a42",
        muted: "#8b93ad",
        rank: {
          gold: "#f5c542",
          silver: "#c7cbd1",
          bronze: "#cd8a4f",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
