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
const MIN_SCALE = 0.72; // Zoomed for readability (EnhanceCV-style)

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

        {/* Full-width grid: 3 templates per row, zoomed and readable */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {TEMPLATE_IDS.map((id, i) => (
            <TemplateFlowCard
              key={id}
              templateId={id}
              isSelected={selected === id}
              onSelect={() => setSelected(id)}
              index={i}
              minScale={MIN_SCALE}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

function TemplateFlowCard({ templateId, isSelected, onSelect, index, minScale = 0.4 }: { templateId: TemplateId; isSelected: boolean; onSelect: () => void; index: number; minScale?: number }) {
  const sampleData = useMemo(() => getSampleResumeData(templateId), [templateId]);
  const display = TEMPLATE_DISPLAY[templateId];
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(minScale);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        setScale(Math.max(minScale, w / RESUME_W));
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [minScale]);

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3) }}
      className={`group relative rounded-2xl overflow-hidden text-left transition-all duration-200 ${
        isSelected
          ? "ring-2 ring-amber-500 ring-offset-2 shadow-xl"
          : "border border-stone-200 shadow-md hover:shadow-lg hover:border-amber-200"
      }`}
    >
      <div ref={containerRef} className="relative overflow-hidden bg-white w-full min-h-[480px] sm:min-h-[560px]" style={{ aspectRatio: "210 / 297" }}>
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={{ transform: `scale(${scale})`, width: RESUME_W, minHeight: 1123 }}
        >
          <ResumePreview data={{ ...sampleData, templateId }} />
        </div>
        {display?.badge && (
          <div className="absolute top-2 left-2 z-10 rounded-md bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 shadow">{display.badge}</div>
        )}
        {isSelected && (
          <div className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
        )}
      </div>
      <div className="px-4 py-3 bg-white border-t border-stone-100">
        <p className={`text-base font-semibold truncate ${isSelected ? "text-amber-800" : "text-stone-900"}`}>{display?.name ?? templateId}</p>
        <p className="text-xs text-stone-500 truncate">{display?.subtitle ?? "ATS-friendly"}</p>
      </div>
    </motion.button>
  );
}
