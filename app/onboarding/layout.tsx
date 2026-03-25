import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://samosacv.in";

export const metadata: Metadata = {
  title: "Get Started — Build Your Resume in 4 Steps | Samosa CV",
  description:
    "Pick your role, experience level, and how to add content. AI builds your ATS-ready resume. India's #1 resume builder. Just ₹15 to download PDF.",
  alternates: { canonical: `${siteUrl}/onboarding` },
  robots: { index: true, follow: true },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
