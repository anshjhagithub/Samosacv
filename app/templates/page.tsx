"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TemplatePicker } from "@/components/onboarding/TemplatePicker";
import type { TemplateId } from "@/types/resume";
import { loadResume, saveResume } from "@/lib/storage/resumeStorage";

export default function TemplatesPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<TemplateId | null>("classic");
  const [hasResume, setHasResume] = useState<boolean | null>(null);

  useEffect(() => {
    setHasResume(!!loadResume());
  }, []);

  const handleUseTemplate = () => {
    const resume = loadResume();
    if (!resume) {
      router.push("/onboarding");
      return;
    }
    saveResume({ ...resume, templateId: selectedId ?? "classic" });
    router.push("/builder");
  };

  if (hasResume === null) {
    return (
      <div className="min-h-screen bg-[#0c0a12] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!hasResume) {
    return (
      <div className="min-h-screen bg-[#0c0a12] theme-dark flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-gray-400">No resume in progress. Start from the beginning.</p>
        <Link href="/onboarding" className="text-accent hover:underline">
          Go to onboarding
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0a12] theme-dark">
      <header className="border-b border-white/5 sticky top-0 z-20 bg-[#0c0a12]/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white font-semibold">
            <span className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-sm font-bold">
              A
            </span>
            ARTICULATED
          </Link>
          <Link href="/builder" className="text-sm text-gray-400 hover:text-white transition-colors">
            Skip to builder
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <TemplatePicker
          selectedId={selectedId}
          onSelect={setSelectedId}
          onUseTemplate={handleUseTemplate}
        />
      </main>
    </div>
  );
}
