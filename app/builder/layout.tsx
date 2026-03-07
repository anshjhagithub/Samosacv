import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://samosacv.com";

export const metadata: Metadata = {
  title: "Resume Builder — Create ATS-Ready CV Online | Samosa CV",
  description:
    "Build your ATS-ready resume in India. Free ATS score, skill gap analysis, 35+ templates, 82 role presets. Pay ₹15 once, no subscription. Used by 50K+ job seekers.",
  keywords: ["resume builder", "CV maker online India", "ATS resume builder", "create resume free", "professional resume builder India"],
  openGraph: {
    title: "Resume Builder — ATS-Ready CV in 60 Sec | Samosa CV",
    description: "Free ATS score, 35+ templates, 82 roles. ₹15 once. No subscription.",
    url: `${siteUrl}/builder`,
    locale: "en_IN",
  },
  alternates: { canonical: `${siteUrl}/builder` },
  robots: { index: true, follow: true },
};

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Resume Builder", path: "/builder" }]} />
      {children}
    </>
  );
}
