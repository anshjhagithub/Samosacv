"use client";

import { useState, useRef } from "react";
import type { ResumeData, TemplateId } from "@/types/resume";
import { TEMPLATE_IDS } from "@/types/resume";
import { ResumePreview, TEMPLATE_LABELS } from "@/components/resume/ResumePreview";

interface ResumePreviewPanelProps {
  data: ResumeData;
  onTemplateChange?: (templateId: TemplateId) => void;
  onDownload?: () => void;
}

export function ResumePreviewPanel({ data, onTemplateChange, onDownload }: ResumePreviewPanelProps) {
  const [zoom, setZoom] = useState(100);
  const previewRef = useRef<HTMLDivElement>(null);
  const templateId = TEMPLATE_IDS.includes(data.templateId) ? data.templateId : "classic";
  const displayData: ResumeData = { ...data, templateId };

  const handleDownload = () => {
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
    <div className="flex flex-col h-full min-h-[500px] rounded-2xl border border-white/10 bg-[#0c0a12] overflow-hidden shadow-xl shadow-black/20">
      {/* Toolbar – single row like Zety/Novoresume */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-[#16121f]">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-white">Live preview</span>
          <div className="flex items-center gap-2">
            <label htmlFor="template-select" className="text-xs text-gray-500 sr-only">
              Choose template
            </label>
            <select
              id="template-select"
              value={templateId}
              onChange={(e) => onTemplateChange?.(e.target.value as TemplateId)}
              className="rounded-lg border border-white/15 bg-[#0c0a12] text-white text-xs font-medium py-2 pl-3 pr-8 focus:border-accent focus:ring-1 focus:ring-accent/50 outline-none min-w-[140px]"
              title="Choose from 35+ resume templates"
            >
              {TEMPLATE_IDS.map((id) => (
                <option key={id} value={id} className="bg-[#16121f] text-white">
                  {TEMPLATE_LABELS[id]}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-gray-500 hidden sm:inline">35+ templates</span>
          </div>
          <div className="flex items-center rounded-lg border border-white/15 overflow-hidden bg-[#0c0a12]/50">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Zoom out"
            >
              −
            </button>
            <span className="px-2 py-1 text-xs text-gray-400 min-w-[2.5rem] text-center">{zoom}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(120, z + 10))}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Zoom in"
            >
              +
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-all shadow-glow"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download resume
        </button>
      </div>

      {/* Preview area */}
      <div ref={previewRef} className="flex-1 overflow-auto p-6 flex justify-center bg-[#0c0a12] min-h-[400px]">
        <div
          className="transition-transform duration-200 origin-top"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          <div className="resume-pdf-source bg-white rounded-lg shadow-2xl overflow-hidden border border-white/10 w-full max-w-[21cm]">
            <ResumePreview data={displayData} />
          </div>
        </div>
      </div>
    </div>
  );
}
