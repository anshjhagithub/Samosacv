import type { Metadata } from "next";

const siteUrl = "https://samosacv.in";

export const metadata: Metadata = {
  title: "Privacy Policy | Samosa CV — India's AI Resume Builder",
  description: "Samosa CV privacy policy. How we collect, use, and protect your data. India's #1 AI resume builder. Contact: support@samosacv.in.",
  alternates: { canonical: `${siteUrl}/privacy-policy` },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
