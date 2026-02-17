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
        accent: "#8B5CF6",
        surface: "#0f172a",
        border: "#334155",
        muted: "#94a3b8",
      },
      backgroundImage: {
        "dark-gradient": "linear-gradient(135deg, #0c0a12 0%, #1a1525 40%, #120f1f 100%)",
        "dark-gradient-radial": "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.15), transparent)",
      },
      boxShadow: {
        glow: "0 0 20px -5px rgba(139, 92, 246, 0.35)",
        "glow-lg": "0 0 30px -5px rgba(139, 92, 246, 0.45)",
        card: "0 4px 24px -4px rgba(0, 0, 0, 0.4)",
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
