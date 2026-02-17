"use client";

import { useRef, useState } from "react";
import type { ResumeData } from "@/types/resume";
import { ResumePreview } from "./ResumePreview";

export function StepPreview({ data }: { data: ResumeData }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleExportPdf = async () => {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).jsPDF;
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const w = 210;
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(img, "PNG", 0, 0, w, h);
      pdf.save(`${data.personal.fullName || "resume"}-resume.pdf`);
    } catch (e) {
      if (process.env.NODE_ENV !== "production") console.error(e);
      alert("Export failed. Try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-slate-600">
        Review your resume. Download as PDF when ready.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleExportPdf}
          disabled={exporting}
          className="rounded-lg bg-teal-600 px-6 py-2.5 text-white font-medium hover:bg-teal-700 disabled:opacity-50"
        >
          {exporting ? "Generating PDF…" : "Download PDF"}
        </button>
      </div>
      <div className="flex justify-center bg-slate-100 p-4 rounded-xl">
        <div ref={previewRef} className="resume-pdf-source">
          <ResumePreview data={data} />
        </div>
      </div>
    </div>
  );
}
