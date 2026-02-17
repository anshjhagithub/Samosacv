import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://articulated.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AI Resume Builder | Paste LinkedIn, Upload PDF, Get a Tailored Resume",
    template: "%s | ARTICULATED",
  },
  description:
    "Paste your LinkedIn or resume, add a job description to tailor it. AI generates and improves your resume. Download PDF. ATS-friendly templates.",
  keywords: ["resume builder", "AI resume", "LinkedIn to resume", "PDF resume", "ATS resume", "job application"],
  authors: [{ name: "ARTICULATED" }],
  creator: "ARTICULATED",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "ARTICULATED",
    title: "AI Resume Builder | Paste LinkedIn, Upload PDF, Get a Tailored Resume",
    description: "Paste your LinkedIn or resume, add a job description to tailor it. AI generates and improves your resume. Download PDF.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "ARTICULATED Resume Builder" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Resume Builder | ARTICULATED",
    description: "Paste your LinkedIn or resume. AI generates and improves your resume. Download PDF.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0c0a12",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-w-0 antialiased">{children}</body>
    </html>
  );
}
