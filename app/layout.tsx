import type { Metadata, Viewport } from "next";
import "./globals.css";
import { JsonLdScript } from "@/components/seo/JsonLdScript";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://samosacv.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Samosa CV — India's #1 AI Resume Builder | ATS-Ready in 60 Sec for ₹15",
    template: "%s | Samosa CV",
  },
  description:
    "India's best AI resume builder. ATS-ready CV in 60 seconds for just ₹15. Free ATS score, skill gap analysis, 82 role presets, 35+ templates. Used by 50K+ job seekers. No subscription.",
  keywords: [
    "resume builder India",
    "AI resume builder India",
    "ATS resume",
    "CV maker India",
    "resume maker online free India",
    "free resume builder India",
    "professional resume India",
    "PDF resume download",
    "samosa cv",
    "resume for job India",
    "fresher resume",
    "experienced resume India",
    "best resume builder India",
    "CV format India",
    "resume writing service India",
    "Naukri resume",
    "LinkedIn resume India",
  ],
  authors: [{ name: "Samosa CV", url: siteUrl }],
  creator: "Samosa CV",
  publisher: "Samosa CV",
  alternates: {
    canonical: siteUrl,
    languages: { "en-IN": siteUrl },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: "en_IN",
    url: siteUrl,
    siteName: "Samosa CV",
    title: "Samosa CV — India's #1 AI Resume Builder | ₹15 ATS-Ready CV",
    description: "India's best AI resume builder. ATS-ready in 60 seconds for ₹15. Free ATS score, 82 role presets, 35+ templates. No subscription.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Samosa CV — India's #1 AI Resume Builder for Indian job seekers" }],
    countryName: "India",
  },
  twitter: {
    card: "summary_large_image",
    title: "Samosa CV — India's #1 AI Resume Builder | ₹15",
    description: "ATS-ready resume in 60 seconds. Free ATS score, 82 roles, 35+ templates. No subscription.",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  verification: {
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }),
    ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION && { yandex: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }),
  },
  category: "technology",
  other: {
    "geo.region": "IN",
    "geo.placename": "India",
    "geo.country": "India",
    "ICBM": "20.5937, 78.9629",
    "audience": "job seekers, students, professionals in India",
    "revisit-after": "7 days",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#fafaf9",
};

function SupressAbortError() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: [
          `window.addEventListener("unhandledrejection",function(e){`,
          `if(e&&e.reason&&(e.reason.name==="AbortError"||`,
          `(e.reason.message&&e.reason.message.indexOf("aborted")!==-1)))`,
          `{e.preventDefault();e.stopImmediatePropagation()}`,
          `},true);`,
          `window.addEventListener("error",function(e){`,
          `if(e&&e.message&&e.message.indexOf("AbortError")!==-1)`,
          `{e.preventDefault();e.stopImmediatePropagation()}`,
          `},true);`,
        ].join(""),
      }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <head>
        <SupressAbortError />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <JsonLdScript />
      </head>
      <body className="min-w-0 antialiased theme-light">{children}</body>
    </html>
  );
}
