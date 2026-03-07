"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { TemplateId } from "@/types/resume";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { getSampleResumeData } from "@/lib/sampleResumeData";
import {
  TEMPLATE_CATEGORIES,
  getTemplateIdsForCategory,
  TEMPLATE_DISPLAY,
  type TemplateCategory,
} from "@/lib/templateCategories";

const PREVIEW_SCALE = 0.58;
const CARD_PREVIEW_H = 500;

const PAPER_TINT: Partial<Record<TemplateId, string>> = {
  classic: "bg-amber-50/80",
  executive: "bg-stone-50/90",
};

interface TemplatePickerProps {
  selectedId: TemplateId | null;
  onSelect: (id: TemplateId) => void;
  onUseTemplate: () => void;
}

export function TemplatePicker({ selectedId, onSelect, onUseTemplate }: TemplatePickerProps) {
  const [category, setCategory] = useState<TemplateCategory>("all");
  const ids = useMemo(() => getTemplateIdsForCategory(category), [category]);

  return (
    <div className="w-full">
      <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-1">
        Choose a template
      </h2>
      <p className="text-stone-500 text-sm mb-6">
        35+ ATS-friendly templates. Switch anytime in the builder.
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              category === cat.id
                ? "bg-amber-600 text-white shadow-md"
                : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300 hover:bg-stone-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ids.map((templateId, i) => (
          <TemplateCard
            key={templateId}
            templateId={templateId}
            isSelected={selectedId === templateId}
            onSelect={() => onSelect(templateId)}
            onUseTemplate={selectedId === templateId ? onUseTemplate : undefined}
            index={i}
          />
        ))}
        <CustomRequestCard />
      </div>

      {selectedId && (
        <motion.div
          className="mt-10 flex justify-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            type="button"
            onClick={onUseTemplate}
            className="rounded-xl bg-amber-600 px-10 py-4 font-semibold text-white shadow-lg shadow-amber-900/20 hover:bg-amber-700 hover:shadow-xl transition-all"
          >
            Use This Template
          </button>
        </motion.div>
      )}
    </div>
  );
}

function TemplateCard({
  templateId,
  isSelected,
  onSelect,
  onUseTemplate,
  index,
}: {
  templateId: TemplateId;
  isSelected: boolean;
  onSelect: () => void;
  onUseTemplate?: () => void;
  index: number;
}) {
  const sampleData = useMemo(() => getSampleResumeData(templateId), [templateId]);
  const display = TEMPLATE_DISPLAY[templateId];
  const badge = display?.badge;
  const paperTint = PAPER_TINT[templateId];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.25) }}
      className={`rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 bg-white ${
        isSelected
          ? "shadow-xl shadow-amber-900/15 ring-2 ring-amber-400/80 ring-offset-2 ring-offset-[#fef9e7]"
          : "border border-stone-200/90 shadow-md hover:shadow-lg hover:border-amber-200/60"
      }`}
      onClick={onSelect}
    >
      <div
        className="relative overflow-hidden rounded-t-2xl flex items-center justify-center bg-gradient-to-b from-stone-100 to-stone-50"
        style={{ height: CARD_PREVIEW_H }}
      >
        <div
          className={`absolute top-3 left-1/2 -translate-x-1/2 overflow-hidden rounded-lg shadow-md ${paperTint ?? "bg-white"}`}
          style={{ width: 794 * PREVIEW_SCALE, height: Math.min(1123 * PREVIEW_SCALE, CARD_PREVIEW_H - 24) }}
        >
          <div
            className="absolute top-0 left-0 origin-top-left"
            style={{
              transform: `scale(${PREVIEW_SCALE})`,
              width: 794,
              minHeight: 1123,
            }}
          >
            <ResumePreview data={sampleData} />
          </div>
        </div>
        {badge && (
          <div className="absolute top-3 left-3 rounded-md bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 shadow">
            {badge}
          </div>
        )}
      </div>
      <div className="p-4 border-t border-stone-200">
        <p className="text-stone-900 font-bold text-sm truncate">{display?.name ?? templateId}</p>
        <p className="text-stone-500 text-xs mt-0.5 truncate">{display?.subtitle ?? ""}</p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">ATS Friendly</span>
          </div>
          {isSelected && onUseTemplate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUseTemplate();
              }}
              className="rounded-lg bg-amber-600 px-4 py-2 text-white text-xs font-bold hover:bg-amber-700 transition-colors"
            >
              USE TEMPLATE
            </button>
          )}
        </div>
        {!isSelected && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className="mt-3 w-full rounded-lg border-2 border-amber-600 text-amber-700 py-2.5 text-sm font-semibold hover:bg-amber-50 transition-colors"
          >
            USE TEMPLATE
          </button>
        )}
      </div>
    </motion.div>
  );
}

function CustomRequestCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border-2 border-dashed border-amber-200/80 bg-gradient-to-b from-amber-50/50 to-stone-50 overflow-hidden flex flex-col items-center justify-center min-h-[380px] p-6 text-center"
    >
      <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mb-4">
        <span className="text-2xl font-bold">+</span>
      </div>
      <h3 className="text-stone-900 font-bold text-sm mb-2">Custom Request?</h3>
      <p className="text-stone-500 text-xs max-w-[200px] mb-4">
        Need a layout or style that&apos;s not here? We can design a custom template for you.
      </p>
      <a
        href="/contact"
        className="text-amber-700 text-sm font-semibold hover:underline"
      >
        CONTACT SUPPORT
      </a>
    </motion.div>
  );
}
