import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://samosacv.in";

export const metadata: Metadata = {
  title: "Terms and Conditions | Samosa CV — India's AI Resume Builder",
  description: "Terms of use for Samosa CV. Payment, eligibility, acceptable use. India's AI resume builder. Contact: support@samosacv.in.",
  alternates: { canonical: `${siteUrl}/terms-and-conditions` },
  robots: { index: true, follow: true },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
