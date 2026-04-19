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
        canvas: "#f5efe6",
        ink: "#17120d",
        sand: "#dac9b2",
        ember: "#c46a2f",
        moss: "#26413c",
        blush: "#f0e1cf",
      },
      boxShadow: {
        card: "0 20px 60px rgba(23, 18, 13, 0.08)",
      },
      backgroundImage: {
        grid: "radial-gradient(circle at 1px 1px, rgba(23, 18, 13, 0.08) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};

export default config;

