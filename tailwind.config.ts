import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        'alien': ['Alien League', 'sans-serif'],
        'alien-3d': ['Alien League 3D', 'sans-serif'],
        'alien-gradient': ['Alien League Gradient', 'sans-serif'],
        'alien-outline': ['Alien League Outline', 'sans-serif'],
        'alien-condensed': ['Alien League Condensed', 'sans-serif'],
        'alien-expanded': ['Alien League Expanded', 'sans-serif'],
        'alien-ii': ['Alien League II', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
