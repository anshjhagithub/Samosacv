import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://samosacv.in";

export const metadata: Metadata = {
  title: "Create Resume from PDF or Text | Samosa CV India",
  description:
    "Create your resume from existing PDF or paste. AI extracts and tailors content. ATS-ready in minutes. India's AI resume builder. ₹15 to download.",
  alternates: { canonical: `${siteUrl}/create` },
  robots: { index: true, follow: true },
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
