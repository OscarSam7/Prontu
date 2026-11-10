import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: "#FF4D7A",
          pinkDark: "#E03864",
          gold: "#D9A441",
          goldLight: "#F5E4BE",
          teal: "#1FA8A0",
          tealDark: "#17857E",
          bg: "#FFF8F5",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(255, 77, 122, 0.08)",
        card: "0 4px 20px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
