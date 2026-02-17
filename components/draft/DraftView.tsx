"use client";

import { useCallback, useState } from "react";
import type { DocumentDraft, DocumentOutline, DocumentMetadata } from "@/types";
import { buildDocumentMetadata, getComplianceBlockText } from "@/engine/compliance";
import { exportDocx } from "@/engine/export/docx";

interface DraftViewProps {
  draft: DocumentDraft | null;
  outline: DocumentOutline;
  documentType: string;
  category: "corporate" | "legal" | "finance";
  riskFlags: string[];
  onBack: () => void;
}

export function DraftView({
  draft,
  outline,
  documentType,
  category,
  riskFlags,
  onBack,
}: DraftViewProps) {
  const [exporting, setExporting] = useState(false);
  const [includeCompliance, setIncludeCompliance] = useState(true);

  const handleExport = useCallback(async () => {
    if (!draft) return;
    setExporting(true);
    try {
      await exportDocx(draft, {
        includeComplianceBlock: includeCompliance,
        fileName: `${draft.metadata.documentId}.docx`,
      });
    } catch (e) {
      console.error(e);
      alert("Export failed.");
    } finally {
      setExporting(false);
    }
  }, [draft, includeCompliance]);

  if (!draft) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12 text-slate-400">
        Draft not yet generated. Use the flow to generate outline then approve to draft.
      </div>
    );
  }

  const complianceText = getComplianceBlockText(draft.metadata);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {includeCompliance && (
        <div className="rounded-lg bg-slate-800/80 border border-slate-600 p-3 text-sm text-slate-400">
          {complianceText}
        </div>
      )}

      <div className="prose prose-invert prose-slate max-w-none">
        {draft.sections
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <div key={section.id} className="mb-8">
              <h2 className="text-xl font-semibold text-slate-100 border-b border-slate-600 pb-1 mb-2">
                {section.title}
              </h2>
              <div className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
                {section.content}
              </div>
            </div>
          ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-700">
        <label className="flex items-center gap-2 text-sm text-slate-400">
          <input
            type="checkbox"
            checked={includeCompliance}
            onChange={(e) => setIncludeCompliance(e.target.checked)}
            className="rounded border-slate-600 bg-slate-800 text-sky-500"
          />
          Include compliance block in export
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Back to structure
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="px-6 py-2.5 rounded-lg bg-sky-600 text-white font-medium disabled:opacity-50 hover:bg-sky-500 transition-colors"
          >
            {exporting ? "Exporting…" : "Export .docx"}
          </button>
        </div>
      </div>
    </div>
  );
}
