import type { Metadata } from "next";

const siteUrl = "https://samosacv.in";

export const metadata: Metadata = {
  title: "Refund Policy | Samosa CV — India's AI Resume Builder",
  description: "Samosa CV refund policy. Refund conditions, how to request. India's AI resume builder. Contact: support@samosacv.in.",
  alternates: { canonical: `${siteUrl}/refund-policy` },
  robots: { index: true, follow: true },
};

export default function RefundPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
