"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { TemplatePicker } from "@/components/onboarding/TemplatePicker";
import type { TemplateId } from "@/types/resume";
import { loadResume, saveResume } from "@/lib/storage/resumeStorage";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function TemplatesPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<TemplateId | null>("classic");
  const [hasResume, setHasResume] = useState<boolean | null>(null);

  useEffect(() => { setHasResume(!!loadResume()); }, []);

  const handleUseTemplate = () => {
    const resume = loadResume();
    if (!resume) { router.push("/onboarding"); return; }
    saveResume({ ...resume, templateId: selectedId ?? "classic" });
    router.push("/builder");
  };

  if (hasResume === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!hasResume) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-stone-600">No resume in progress.</p>
        <Link href="/onboarding" className="text-amber-700 hover:underline font-medium">Go to onboarding</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <SiteHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <motion.section className="text-center mb-10" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-amber-700 text-xs font-semibold uppercase tracking-widest mb-2">Premium templates</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            Choose a template that matches your <span className="text-amber-700">ambition</span>
          </h1>
          <p className="mt-2 text-stone-500 text-sm max-w-xl mx-auto">35+ ATS-friendly designs. Switch anytime.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/builder" className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-amber-900/20 hover:bg-amber-700 transition-all">Start Building</Link>
            <Link href="#templates-grid" className="inline-flex items-center justify-center rounded-xl border-2 border-stone-300 px-6 py-3.5 text-sm font-medium text-stone-700 hover:bg-stone-100 transition-all">View All</Link>
          </div>
        </motion.section>

        <section id="templates-grid">
          <TemplatePicker selectedId={selectedId} onSelect={setSelectedId} onUseTemplate={handleUseTemplate} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
