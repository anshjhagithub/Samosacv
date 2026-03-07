import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://samosacv.com";

export const metadata: Metadata = {
  title: "Refund Policy | Samosa CV — India's AI Resume Builder",
  description: "Samosa CV refund policy. Refund conditions, how to request. India's AI resume builder. Contact: support@samosacv.com.",
  alternates: { canonical: `${siteUrl}/refund-policy` },
  robots: { index: true, follow: true },
};

export default function RefundPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
