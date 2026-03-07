import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0c0a12",
          surface: "#16121f",
          border: "#2d2640",
        },
        accent: "#B8860B",
        "accent-soft": "#d4a84b",
        "accent-dark": "#8B6914",
        surface: "#f5f5f4",
        "surface-elevated": "#ffffff",
        border: "#e7e5e4",
        muted: "#78716c",
      },
      backgroundImage: {
        "premium-gradient": "linear-gradient(180deg, #fefce8 0%, #fafaf9 30%, #f5f5f4 100%)",
        "premium-radial": "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(184, 134, 11, 0.08), transparent 70%)",
      },
      boxShadow: {
        glow: "0 0 24px -4px rgba(184, 134, 11, 0.25)",
        "glow-lg": "0 0 32px -4px rgba(184, 134, 11, 0.35)",
        card: "0 4px 24px -4px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 12px 40px -8px rgba(0, 0, 0, 0.1)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
export default config;
