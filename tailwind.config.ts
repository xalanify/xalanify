// tailwind.config.ts
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
        background: "#0a0908", // Fundo quase preto
        primary: "#5e35b1",    // Roxo vibrante
        secondary: "#4e342e",  // Castanho profundo
        accent: "#ff0000",     // Vermelho BETA
        surface: "#1a1a1a",    // Cartões e inputs
      },
    },
  },
  plugins: [],
};
export default config;