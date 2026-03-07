"use client";

import { useState, useRef, useMemo, type ReactNode } from "react";
import type { ResumeData, TemplateId } from "@/types/resume";
import { TEMPLATE_IDS } from "@/types/resume";
import { ResumePreview, TEMPLATE_LABELS } from "@/components/resume/ResumePreview";
import { getSampleResumeData } from "@/lib/sampleResumeData";

interface ResumePreviewPanelProps {
  data: ResumeData;
  onTemplateChange?: (templateId: TemplateId) => void;
  onDownload?: () => void;
  toolbarExtra?: ReactNode;
  isPaid?: boolean;
}

export function ResumePreviewPanel({ data, onTemplateChange, onDownload, toolbarExtra, isPaid = false }: ResumePreviewPanelProps) {
  const [zoom, setZoom] = useState(80);
  const [showTemplates, setShowTemplates] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const templateId = TEMPLATE_IDS.includes(data.templateId) ? data.templateId : "classic";
  // Every field edit from the builder flows through here so the preview stays in sync
  const displayData: ResumeData = { ...data, templateId };

  const handleDownload = () => {
    if (!isPaid) {
      if (onDownload) onDownload();
      return;
    }
    if (onDownload) {
      onDownload();
      return;
    }
    const el = previewRef.current?.querySelector(".resume-pdf-source");
    if (!el) return;
    import("html2canvas").then(({ default: html2canvas }) => {
      html2canvas(el as HTMLElement, { scale: 2, useCORS: true }).then((canvas) => {
        const link = document.createElement("a");
        link.download = `resume-${data.personal?.fullName || "resume"}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    });
  };

  return (
    <div className="flex flex-col rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-lg">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-stone-200 bg-stone-50">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-stone-700">Live preview</span>
          <button
            type="button"
            onClick={() => setShowTemplates((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${showTemplates ? "border-amber-400 bg-amber-50 text-amber-800" : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"}`}
          >
            <span>{TEMPLATE_LABELS[templateId]}</span>
            <svg className={`w-3 h-3 transition-transform ${showTemplates ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <div className="flex items-center rounded-lg border border-stone-200 overflow-hidden bg-white">
            <button type="button" onClick={() => setZoom((z) => Math.max(50, z - 10))} className="p-2 text-stone-500 hover:text-stone-900 transition-colors" aria-label="Zoom out">−</button>
            <span className="px-2 py-1 text-xs text-stone-500 min-w-[2.5rem] text-center">{zoom}%</span>
            <button type="button" onClick={() => setZoom((z) => Math.min(120, z + 10))} className="p-2 text-stone-500 hover:text-stone-900 transition-colors" aria-label="Zoom in">+</button>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {toolbarExtra}
          {isPaid ? (
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-md"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download resume
            </button>
          ) : (
            <a
              href="#builder-checkout"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("builder-checkout")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-xs text-amber-600 font-medium hover:text-amber-700 hover:underline"
            >
              Pay above to get PDF
            </a>
          )}
        </div>
      </div>

      {/* Template gallery strip */}
      {showTemplates && (
        <div className="border-b border-stone-200 bg-stone-50 px-3 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {TEMPLATE_IDS.map((id) => (
              <TemplateMiniCard
                key={id}
                templateId={id}
                isActive={templateId === id}
                onClick={() => { onTemplateChange?.(id); }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Preview area with copy protection */}
      <div
        ref={previewRef}
        className="overflow-auto p-4 flex justify-center bg-stone-100 relative"
        style={{ maxHeight: "calc(100vh - 12rem)" }}
        onContextMenu={isPaid ? undefined : (e) => e.preventDefault()}
      >
        <div
          className={`transition-transform duration-200 origin-top shrink-0 relative ${!isPaid ? "select-none" : ""}`}
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
        >
          <div className="resume-pdf-source bg-white rounded-lg shadow-xl overflow-hidden border border-stone-200" style={{ width: "21cm", minHeight: "29.7cm" }}>
            <ResumePreview data={displayData} />
          </div>

          {/* Watermark overlay — only when not paid */}
          {!isPaid && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <div className="rotate-[-30deg] select-none">
                <p className="text-[64px] font-black text-stone-900/[0.06] whitespace-nowrap tracking-widest leading-none">
                  PREVIEW
                </p>
                <p className="text-[28px] font-bold text-amber-600/[0.10] whitespace-nowrap tracking-wider text-center mt-2">
                  Pay ₹15 to unlock
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TemplateMiniCard({ templateId, isActive, onClick }: { templateId: TemplateId; isActive: boolean; onClick: () => void }) {
  const sampleData = useMemo(() => getSampleResumeData(templateId), [templateId]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative shrink-0 rounded-lg overflow-hidden transition-all ${isActive ? "ring-2 ring-amber-500 ring-offset-1 shadow-md" : "border border-stone-200 hover:border-amber-300 hover:shadow-sm"}`}
      style={{ width: 80, height: 104 }}
      title={TEMPLATE_LABELS[templateId]}
    >
      <div className="w-full h-full bg-white overflow-hidden">
        <div className="origin-top-left" style={{ transform: "scale(0.1)", width: 794, minHeight: 1123 }}>
          <ResumePreview data={{ ...sampleData, templateId }} />
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 px-1 py-0.5 text-[7px] font-semibold text-center truncate ${isActive ? "bg-amber-500 text-white" : "bg-stone-800/70 text-white"}`}>
        {TEMPLATE_LABELS[templateId]}
      </div>
    </button>
  );
}
