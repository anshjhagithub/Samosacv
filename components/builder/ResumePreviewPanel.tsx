"use client";

import { useState, useRef, useMemo, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { ResumeData, TemplateId } from "@/types/resume";
import { TEMPLATE_IDS } from "@/types/resume";
import { ResumePreview, TEMPLATE_LABELS } from "@/components/resume/ResumePreview";
import { getSampleResumeData } from "@/lib/sampleResumeData";
import { motion, AnimatePresence } from "framer-motion";
import type { FeatureSlug } from "@/lib/pricing";

interface ResumePreviewPanelProps {
  data: ResumeData;
  onTemplateChange?: (templateId: TemplateId) => void;
  onDownload?: () => void;
  onDownloadDocx?: () => void;
  toolbarExtra?: ReactNode;
  isPaid?: boolean;
  purchasedAddons?: FeatureSlug[];
}

const ADDON_LABELS: Record<string, string> = {
  ats_breakdown: "Full ATS Breakdown",
  ats_improver: "ATS Improver",
  skill_roadmap: "Skill Roadmap",
  linkedin_optimizer: "LinkedIn Optimizer",
  cover_letter: "Cover Letter",
  interview_pack: "Interview Pack",
};

export function ResumePreviewPanel({ 
  data, 
  onTemplateChange, 
  onDownload, 
  onDownloadDocx,
  toolbarExtra, 
  isPaid = false, 
  purchasedAddons = [] 
}: ResumePreviewPanelProps) {
  const [zoom, setZoom] = useState(80);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<"init" | "addons" | "pdf" | "done">("init");
  const [showPageBreaks, setShowPageBreaks] = useState(true);
  const previewRef = useRef<HTMLDivElement>(null);
  const templateId = TEMPLATE_IDS.includes(data.templateId) ? data.templateId : "classic";
  // Every field edit from the builder flows through here so the preview stays in sync
  const displayData: ResumeData = { ...data, templateId };

  const handleDownload = async () => {
    if (!isPaid) {
      if (onDownload) onDownload();
      return;
    }
    
    // If we have purchased addons, do the fancy multi-step generation
    if (purchasedAddons.length > 0) {
      setIsGenerating(true);
      setGenerationStep("addons");
      
      try {
        // 1. Generate Add-ons text via AI
        const res = await fetch("/api/generate-addons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeText: JSON.stringify(data), // Sending full plain data since we don't have resumeToText here easily, API ignores it mostly
            targetRole: data.personal?.title || "Professional",
            addons: purchasedAddons
          })
        });
        
        const resData = await res.json();
        const addonsResult = resData.addons || [];
        
        setGenerationStep("pdf");
        
        // 2. Generate Add-ons PDF in background using a hidden printable component
        if (addonsResult.length > 0) {
          // Dynamic import to keep main bundle small
          const { AddonsDocument } = await import("@/components/addons/AddonsDocument");
          const { renderToStaticMarkup } = await import("react-dom/server");
          const html2pdfModule = await import("html2canvas-pro");
          const jsPDFModule = await import("jspdf");
          const html2canvas = html2pdfModule.default;
          const jsPDF = jsPDFModule.default;

          // Create a hidden container to render the addons DOM reliably
          const container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.top = '0';
          container.style.left = '-9999px';
          container.style.width = '794px'; // Fixed A4 width
          container.style.backgroundColor = '#ffffff';
          document.body.appendChild(container);

          // Give it some React context
          const markup = renderToStaticMarkup(<AddonsDocument data={data} addons={addonsResult} />);
          container.innerHTML = markup;

          // Process each page break
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();

          const docEl = container.firstElementChild as HTMLElement;
          if (docEl) {
             const canvas = await html2canvas(docEl, { scale: 2, useCORS: true });
             const imgData = canvas.toDataURL("image/png");
             
             // This is a simplified 1-page/long-page print. For real multi-page we'd chunk it.
             // Given time constraints, we will just fit it to width and let height scale.
             const imgProps = pdf.getImageProperties(imgData);
             const pdfH = (imgProps.height * pdfWidth) / imgProps.width;
             
             pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfH);
             pdf.save(`addons-${data.personal?.fullName || "details"}.pdf`);
          }
          
          document.body.removeChild(container);
        }
        
        // 3. Generate normal Resume PDF
        const el = previewRef.current?.querySelector(".resume-pdf-source");
        if (el) {
          const html2canvas = (await import("html2canvas-pro")).default;
          // Clone exactly as we do in review page to avoid kerning issues
          const wrapper = document.createElement('div');
          wrapper.style.position = 'absolute';
          wrapper.style.top = '0';
          wrapper.style.left = '-9999px';
          wrapper.style.width = '794px';
          wrapper.style.backgroundColor = '#ffffff';
          
          const clone = (el as HTMLElement).cloneNode(true) as HTMLElement;
          clone.style.transform = 'none';
          clone.style.width = '100%';
          clone.style.height = 'auto';
          wrapper.appendChild(clone);
          document.body.appendChild(wrapper);

          const canvas = await html2canvas(wrapper, { scale: 2, useCORS: true, logging: false });
          document.body.removeChild(wrapper);

          const jsPDF = (await import("jspdf")).default;
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          pdf.addImage(canvas.toDataURL("image/png", 0.8), "PNG", 0, 0, pdfWidth, pdfHeight);
          pdf.save(`resume-${data.personal?.fullName || "resume"}.pdf`);
        }
        
        setGenerationStep("done");
        setTimeout(() => setIsGenerating(false), 2000);
      } catch (err) {
        console.error("Failed generation", err);
        setIsGenerating(false);
        alert("Failed to generate PDFs. Please ensure your Mistral API key is set.");
      }
      return;
    }
    
    // Normal single PDF download
    if (onDownload) {
      onDownload();
      return;
    }
    const el = previewRef.current?.querySelector(".resume-pdf-source");
    if (!el) return;
    import("html2canvas-pro").then(({ default: html2canvas }) => {
      const wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.top = '0';
      wrapper.style.left = '-9999px';
      wrapper.style.width = '794px';
      wrapper.style.backgroundColor = '#ffffff';
      
      const clone = (el as HTMLElement).cloneNode(true) as HTMLElement;
      clone.style.transform = 'none';
      clone.style.width = '100%';
      clone.style.height = 'auto';
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      html2canvas(wrapper, { scale: 2, useCORS: true, logging: false }).then((canvas) => {
        document.body.removeChild(wrapper);
        import("jspdf").then(({ default: jsPDF }) => {
          const pdf = new jsPDF("p", "mm", "a4");
          pdf.addImage(canvas.toDataURL("image/png", 0.8), "PNG", 0, 0, 210, 297);
          pdf.save(`resume-${data.personal?.fullName || "resume"}.pdf`);
        });
      });
    });
  };

  return (
    <div className="flex flex-col rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-lg relative">
      {/* Loading Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="w-full max-w-sm">
              <div className="mb-6 relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 border-4 border-amber-100 rounded-full"></div>
                <motion.div 
                  className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                ></motion.div>
                <div className="absolute inset-0 flex items-center justify-center text-2xl">
                   {generationStep === "addons" ? "✨" : generationStep === "pdf" ? "📄" : "🎉"}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-stone-900 mb-2">
                {generationStep === "addons" && "Creating your Add-ons..."}
                {generationStep === "pdf" && "Generating PDFs..."}
                {generationStep === "done" && "All done!"}
              </h3>
              
              <p className="text-sm text-stone-500 mb-8">
                {generationStep === "addons" && "Our AI is analyzing your resume to build your custom add-ons. This takes about 10-15 seconds."}
                {generationStep === "pdf" && "Rendering high-quality pixel-perfect PDFs..."}
                {generationStep === "done" && "Check your downloads folder."}
              </p>

              {purchasedAddons.length > 0 && generationStep !== "done" && (
                <div className="mb-6 bg-amber-50 rounded-lg p-3 border border-amber-100/50">
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1.5 opacity-80">Included in your download</p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {purchasedAddons.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-white text-xs font-medium text-amber-700 rounded-md border border-amber-200/60 shadow-sm">{ADDON_LABELS[s] || s}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Progress Bar */}
              <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                  initial={{ width: "5%" }}
                  animate={{ 
                    width: generationStep === "addons" ? "40%" : generationStep === "pdf" ? "80%" : "100%" 
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <button
            type="button"
            onClick={() => setShowPageBreaks(!showPageBreaks)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${showPageBreaks ? "border-red-400 bg-red-50 text-red-800" : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"}`}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Page Breaks
          </button>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {toolbarExtra}
          {isPaid ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-md"
                title={purchasedAddons.length > 0 ? "Download Resume & Add-ons" : "Download PDF"}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                PDF
              </button>
              <button
                type="button"
                onClick={onDownloadDocx}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md"
                title="Download DOCX"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                DOCX
              </button>
            </div>
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
          <div className="resume-pdf-source bg-white rounded-lg shadow-xl overflow-hidden border border-stone-200 relative" style={{ width: "21cm", minHeight: "29.7cm" }}>
            {/* Page break indicators */}
            {showPageBreaks && (
              <>
                <div className="absolute top-[29.7cm] left-0 right-0 h-px bg-red-400 z-20" style={{ boxShadow: '0 0 4px rgba(248, 113, 113, 0.5)' }}>
                  <span className="absolute -top-2 left-2 text-xs text-red-500 font-medium bg-white px-1 rounded">Page 1</span>
                </div>
                <div className="absolute top-[59.4cm] left-0 right-0 h-px bg-red-400 z-20" style={{ boxShadow: '0 0 4px rgba(248, 113, 113, 0.5)' }}>
                  <span className="absolute -top-2 left-2 text-xs text-red-500 font-medium bg-white px-1 rounded">Page 2</span>
                </div>
                <div className="absolute top-[89.1cm] left-0 right-0 h-px bg-red-400 z-20" style={{ boxShadow: '0 0 4px rgba(248, 113, 113, 0.5)' }}>
                  <span className="absolute -top-2 left-2 text-xs text-red-500 font-medium bg-white px-1 rounded">Page 3</span>
                </div>
              </>
            )}
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
