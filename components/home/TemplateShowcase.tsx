"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TEMPLATE_IDS, type TemplateId } from "@/types/resume";
import { ResumePreview, TEMPLATE_LABELS } from "@/components/resume/ResumePreview";
import { getSampleResumeData } from "@/lib/sampleResumeData";
import { TEMPLATE_DISPLAY } from "@/lib/templateCategories";

const RESUME_W = 794;
const SHOWCASE_IDS = TEMPLATE_IDS.slice(0, 6);

function TemplateCard({ id, index }: { id: TemplateId; index: number }) {
  const router = useRouter();
  const sampleData = useMemo(() => getSampleResumeData(id), [id]);
  const display = TEMPLATE_DISPLAY[id];
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.45);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setScale(entry.contentRect.width / RESUME_W);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => router.push("/create")}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push("/create"); } }}
        className="block group cursor-pointer rounded-xl border border-stone-200 bg-white group-hover:border-amber-300 group-hover:shadow-xl group-hover:scale-[1.01] transition-all duration-300 overflow-hidden shadow-md relative"
      >
          <div
            ref={containerRef}
            className="relative overflow-hidden"
            style={{ aspectRatio: "210 / 297" }}
          >
            <div
              className="absolute top-0 left-0 origin-top-left"
              style={{
                transform: `scale(${scale})`,
                width: RESUME_W,
                minHeight: 1123,
              }}
            >
              <ResumePreview data={{ ...sampleData, templateId: id }} />
            </div>
            {display?.badge && (
              <div className="absolute top-2 left-2 z-10 rounded-md bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 shadow">
                {display.badge}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6 z-10">
              <span className="rounded-lg bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform">
                Use this template
              </span>
            </div>
          </div>
          <div className="px-4 py-3 border-t border-stone-100">
            <p className="text-sm font-semibold text-stone-900 group-hover:text-amber-800 transition-colors truncate">
              {display?.name ?? TEMPLATE_LABELS[id]}
            </p>
            <p className="text-xs text-stone-500 truncate">
              {display?.subtitle ?? "ATS-friendly"}
            </p>
          </div>
      </div>
    </motion.div>
  );
}

export function TemplateShowcase() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
      {SHOWCASE_IDS.map((id, i) => (
        <TemplateCard key={id} id={id} index={i} />
      ))}
    </div>
  );
}
