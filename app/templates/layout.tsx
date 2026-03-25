import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://samosacv.in";

export const metadata: Metadata = {
  title: "35+ Resume Templates — ATS-Friendly Designs | Samosa CV",
  description:
    "Choose from 35+ professional resume templates in India. ATS-friendly, recruiter-approved. Classic, Modern, Minimal, Executive. Free preview. Download PDF for ₹15.",
  keywords: ["resume templates India", "CV templates free", "ATS resume templates", "professional resume design", "resume format India"],
  openGraph: {
    title: "35+ Resume Templates | Samosa CV India",
    description: "ATS-friendly templates. Free preview. Download for ₹15.",
    url: `${siteUrl}/templates`,
    locale: "en_IN",
  },
  alternates: { canonical: `${siteUrl}/templates` },
  robots: { index: true, follow: true },
};

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Templates", path: "/templates" }]} />
      {children}
    </>
  );
}
