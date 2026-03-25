import type { Metadata } from "next";

const siteUrl = "https://samosacv.in";

export const metadata: Metadata = {
  title: "Contact Us | Samosa CV — India's AI Resume Builder",
  description: "Contact Samosa CV for support, partnerships, or feedback. India's #1 AI resume builder. We reply within 24 hours.",
  openGraph: {
    title: "Contact | Samosa CV",
    url: `${siteUrl}/contact`,
    locale: "en_IN",
  },
  alternates: { canonical: `${siteUrl}/contact` },
  robots: { index: true, follow: true },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
