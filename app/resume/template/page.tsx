"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { TEMPLATE_IDS, type TemplateId } from "@/types/resume";
import { ResumePreview, TEMPLATE_LABELS } from "@/components/resume/ResumePreview";
import { getSampleResumeData } from "@/lib/sampleResumeData";
import { loadResume, saveResume } from "@/lib/storage/resumeStorage";
import { TEMPLATE_DISPLAY } from "@/lib/templateCategories";
import { SamosaLogoFull } from "@/components/brand/SamosaLogo";

const RESUME_W = 794;
/** Match homescreen TemplateShowcase: scale to fit container (thumbnail-style previews). */

export default function TemplateSelectPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<TemplateId>("classic");

  const handleContinue = () => {
    const resume = loadResume();
    if (resume) {
      saveResume({ ...resume, templateId: selected });
    }
    router.push("/resume/projects");
  };

  const handleUseTemplate = (templateId: TemplateId) => {
    setSelected(templateId);
    const resume = loadResume();
    if (resume) {
      saveResume({ ...resume, templateId });
    }
    router.push("/resume/projects");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-amber-900/5 bg-gradient-to-b from-amber-50/95 to-white/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0">
            <SamosaLogoFull />
          </Link>
          <div className="flex items-center gap-4 text-xs text-stone-400">
            {["Basics", "Experience", "Template", "Projects"].map((label, i) => (
              <span key={label} className="flex items-center gap-1.5">
                {i > 0 && <span className="w-6 h-px bg-stone-300" />}
                <span className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${i === 2 ? "bg-amber-500 text-white" : i < 2 ? "bg-amber-200 text-amber-800" : "bg-stone-200 text-stone-500"}`}>{i + 1}</span>
                <span className={i === 2 ? "text-stone-800 font-medium" : ""}>{label}</span>
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Choose your template</h1>
          <p className="text-stone-500 text-sm mt-1">Pick a style. You can switch anytime in the builder.</p>
        </motion.div>

        <div className="flex flex-col items-center gap-2 mb-8">
          <motion.button
            type="button"
            onClick={handleContinue}
            className="rounded-2xl bg-amber-600 px-10 py-3.5 text-base font-semibold text-white shadow-lg shadow-amber-900/20 hover:bg-amber-700 transition-all hover:-translate-y-0.5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            Continue with {TEMPLATE_LABELS[selected]} &#x2192;
          </motion.button>
          <Link href="/resume/experience" className="text-xs text-stone-400 hover:text-amber-700 transition-colors">
            &#x2190; Back to experience
          </Link>
        </div>

        {/* Same grid and card style as homescreen TemplateShowcase: thumbnail previews */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {TEMPLATE_IDS.map((id, i) => (
            <TemplateFlowCard
              key={id}
              templateId={id}
              isSelected={selected === id}
              onSelect={() => setSelected(id)}
              onUse={() => handleUseTemplate(id)}
              index={i}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

function TemplateFlowCard({
  templateId,
  isSelected,
  onSelect,
  onUse,
  index,
}: {
  templateId: TemplateId;
  isSelected: boolean;
  onSelect: () => void;
  onUse: () => void;
  index: number;
}) {
  const sampleData = useMemo(() => getSampleResumeData(templateId), [templateId]);
  const display = TEMPLATE_DISPLAY[templateId];
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.45);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0) setScale(w / RESUME_W);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.4), duration: 0.5 }}
    >
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        onClick={onSelect}
        className={`group relative block w-full text-left rounded-xl border bg-white overflow-hidden transition-all duration-300 shadow-md ${
          isSelected
            ? "ring-2 ring-amber-500 ring-offset-2 shadow-xl border-amber-300"
            : "border-stone-200 hover:border-amber-300 hover:shadow-xl hover:scale-[1.01]"
        }`}
      >
        <div ref={containerRef} className="relative overflow-hidden" style={{ aspectRatio: "210 / 297" }}>
          <div
            className="absolute top-0 left-0 origin-top-left pointer-events-none"
            style={{ transform: `scale(${scale})`, width: RESUME_W, minHeight: 1123 }}
          >
            <ResumePreview data={{ ...sampleData, templateId }} />
          </div>
          {display?.badge && (
            <div className="absolute top-2 left-2 z-10 rounded-md bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 shadow">
              {display.badge}
            </div>
          )}
          {isSelected && (
            <div className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6 z-10">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onUse();
              }}
              className="rounded-lg bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform"
            >
              Use this template
            </button>
          </div>
        </div>
        <div className="px-4 py-3 border-t border-stone-100">
          <p className={`text-sm font-semibold truncate ${isSelected ? "text-amber-800" : "text-stone-900 group-hover:text-amber-800"}`}>
            {display?.name ?? templateId}
          </p>
          <p className="text-xs text-stone-500 truncate">{display?.subtitle ?? "ATS-friendly"}</p>
        </div>
      </div>
    </motion.div>
  );
}
