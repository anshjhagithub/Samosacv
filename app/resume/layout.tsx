"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ResumeFlowProgress } from "@/components/resume-flow/ResumeFlowProgress";
import { SamosaLogoFull } from "@/components/brand/SamosaLogo";

function getStep(pathname: string): 1 | 2 | 3 | 4 {
  if (pathname.endsWith("/review")) return 4;
  if (pathname.endsWith("/projects")) return 3;
  if (pathname.endsWith("/experience")) return 2;
  return 1;
}

export default function ResumeFlowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const step = getStep(pathname ?? "");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-amber-900/5 bg-gradient-to-b from-amber-50/95 to-white/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0">
            <SamosaLogoFull />
          </Link>
          <ResumeFlowProgress currentStep={step} />
        </div>
      </header>
      <main className={`mx-auto px-4 sm:px-6 py-10 sm:py-14 ${pathname?.endsWith("/review") ? "max-w-6xl" : "max-w-2xl"}`}>
        {children}
      </main>
    </div>
  );
}
