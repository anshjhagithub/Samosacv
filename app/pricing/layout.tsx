import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://samosacv.com";

export const metadata: Metadata = {
  title: "Pricing — ₹15 Resume Builder Plans | Samosa CV India",
  description:
    "Samosa CV pricing: Resume PDF ₹15, add-ons from ₹2. ATS Optimizer, Cover Letter, Interview Pack, LinkedIn Optimizer. No subscription. Best resume builder pricing in India.",
  keywords: ["resume builder price India", "CV maker cost", "affordable resume builder", "₹15 resume", "resume subscription India"],
  openGraph: {
    title: "Pricing — ₹15 Resume | Samosa CV",
    description: "Resume PDF ₹15. Add-ons from ₹2. No subscription.",
    url: `${siteUrl}/pricing`,
    locale: "en_IN",
  },
  alternates: { canonical: `${siteUrl}/pricing` },
  robots: { index: true, follow: true },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Pricing", path: "/pricing" }]} />
      {children}
    </>
  );
}
