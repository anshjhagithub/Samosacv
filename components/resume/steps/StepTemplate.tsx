"use client";

import type { ResumeData, TemplateId } from "@/types/resume";
import { ResumePreview } from "../ResumePreview";

const TEMPLATES: { id: TemplateId; name: string; desc: string }[] = [
  { id: "classic", name: "Classic", desc: "Clean, traditional layout. ATS-friendly." },
  { id: "modern", name: "Modern", desc: "Contemporary with accent bar. Stand out." },
];

export function StepTemplate({
  data,
  onSelect,
}: {
  data: ResumeData;
  onSelect: (id: TemplateId) => void;
}) {
  return (
    <div className="space-y-6">
      <p className="text-slate-600">Choose a template. You can change it later.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className={`rounded-xl border-2 p-4 text-left transition-all ${
              data.templateId === t.id
                ? "border-teal-500 bg-teal-50 shadow-md"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow"
            }`}
          >
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden h-64 flex items-start justify-center">
              <div className="scale-[0.32] origin-top">
                <ResumePreview data={{ ...data, templateId: t.id }} />
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100">
              <h3 className="font-semibold text-slate-900">{t.name}</h3>
              <p className="text-sm text-slate-500">{t.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
