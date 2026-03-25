import type { MetadataRoute } from "next";

const siteUrl = "https://samosacv.in";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Samosa CV — India's AI Resume Builder",
    short_name: "Samosa CV",
    description: "ATS-ready resume in 60 seconds for ₹15. Free ATS score, 82 role presets, 35+ templates. No subscription.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffbeb",
    theme_color: "#fafaf9",
    orientation: "portrait-primary",
    scope: "/",
    lang: "en-IN",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon", purpose: "any" },
      { src: "/og.png", sizes: "1200x630", type: "image/png", purpose: "any" },
    ],
    categories: ["business", "productivity"],
  };
}
