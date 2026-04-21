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
        canvas: "#F4EADB",
        ink: "#2B2118",
        sand: "#D8C3A5",
        ember: "#A86840",
        moss: "#5B4F3A",
        blush: "#FFF7EC",
      },
      boxShadow: {
        card: "0 20px 60px rgba(43, 33, 24, 0.10)",
      },
      backgroundImage: {
        grid: "radial-gradient(circle at 1px 1px, rgba(23, 18, 13, 0.08) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};

export default config;
