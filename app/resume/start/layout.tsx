import type { Metadata } from "next";

const siteUrl = "https://samosacv.in";

export const metadata: Metadata = {
  title: "Create Resume — Name & Role, AI Does the Rest | Samosa CV",
  description:
    "Start your resume in 60 seconds. Enter name and target role. AI generates ATS-ready CV with 82 role presets. Free for India. Pay ₹15 to download PDF.",
  keywords: ["create resume online", "AI resume India", "start resume", "resume in 60 seconds", "fresher resume maker"],
  openGraph: {
    title: "Create Resume in 60 Sec | Samosa CV",
    description: "Name + role. AI builds your ATS-ready resume. ₹15 to download.",
    url: `${siteUrl}/resume/start`,
    locale: "en_IN",
  },
  alternates: { canonical: `${siteUrl}/resume/start` },
  robots: { index: true, follow: true },
};

export default function ResumeStartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
