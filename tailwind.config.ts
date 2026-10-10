import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Editorial Palette for Rumo Works
        ivory: {
          50: "#FCFAF7",
          100: "#F9F6F0",
          200: "#F3EDE3",
          300: "#E9E1D3",
          400: "#DDD2BF",
          500: "#CEBFAB",
        },
        charcoal: {
          50: "#7A7670",
          100: "#635F59",
          200: "#4D4944",
          300: "#383531",
          400: "#262320",
          500: "#1A1816", // Primary Charcoal
          600: "#141311",
          700: "#0F0E0D",
        },
        sage: {
          50: "#F4F7F5",
          100: "#E8EFEA",
          200: "#D3DFD6",
          300: "#B4C8BB",
          400: "#8FAEA8",
          500: "#608974",
          600: "#4A705D",
          700: "#3B5A4B", // Primary Muted Sage Accent
          800: "#2E473B",
          900: "#22352C",
        },
        terracotta: {
          50: "#FCF6F3",
          100: "#F7ECE6",
          200: "#EED7CD",
          300: "#DFB7A7",
          400: "#CE927C",
          500: "#BC6C52",
          600: "#A95840", // Muted terracotta accent
          700: "#8E4631",
        },
        // Mapa Rumo Editorial Palette
        cobalt: {
          50: "#EEF2FF",
          100: "#E0E7FE",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#244CE8", // Primary Cobalt
          600: "#1D3EC4",
          700: "#1731A1",
          800: "#13257E",
          900: "#0F1C5C",
        },
        rumoOrange: {
          50: "#FFF6F2",
          100: "#FFEBE3",
          200: "#FFD4C4",
          300: "#FFB59E",
          400: "#FF8E68",
          500: "#FF6A32", // Primary Vibrant Orange
          600: "#E6531B",
          700: "#BF3F0E",
          800: "#983009",
        },
        shockingPink: {
          50: "#FDF2F8",
          100: "#FCE7F3",
          200: "#FBCFE8",
          300: "#F9A8D4",
          400: "#F472B6",
          500: "#F52D91", // Primary Shocking Pink
          600: "#DB1B7B",
          700: "#B81063",
        },
        warmCream: "#FFF4E7",
        borderWarm: "#E7E2D9",
        borderWarmLight: "#F0EBE2",
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Inter",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        serif: [
          "Newsreader",
          "Playfair Display",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
