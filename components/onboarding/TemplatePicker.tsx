"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { TemplateId } from "@/types/resume";
import { TEMPLATE_IDS } from "@/types/resume";
import { TEMPLATE_LABELS } from "@/components/resume/ResumePreview";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { getSampleResumeData } from "@/lib/sampleResumeData";

const PREVIEW_SCALE = 0.32;
const CARD_WIDTH = 220;
const CARD_HEIGHT = 280;

interface TemplatePickerProps {
  selectedId: TemplateId | null;
  onSelect: (id: TemplateId) => void;
  onUseTemplate: () => void;
}

export function TemplatePicker({ selectedId, onSelect, onUseTemplate }: TemplatePickerProps) {
  return (
    <div className="w-full">
      <h2 className="text-xl sm:text-2xl font-serif text-white mb-1">
        Choose a template for your resume
      </h2>
      <p className="text-gray-400 text-sm mb-8">
        Choose from 35+ professional templates. You can change it later in the builder.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {TEMPLATE_IDS.map((id, i) => (
          <TemplateCard
            key={id}
            templateId={id}
            label={TEMPLATE_LABELS[id]}
            isSelected={selectedId === id}
            onSelect={() => onSelect(id)}
            onUseTemplate={selectedId === id ? onUseTemplate : undefined}
            index={i}
          />
        ))}
      </div>

      {selectedId && (
        <motion.div
          className="mt-8 flex justify-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            type="button"
            onClick={onUseTemplate}
            className="rounded-xl bg-accent px-8 py-3.5 font-semibold text-white shadow-glow hover:bg-accent/90 transition-all"
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
  label,
  isSelected,
  onSelect,
  onUseTemplate,
  index,
}: {
  templateId: TemplateId;
  label: string;
  isSelected: boolean;
  onSelect: () => void;
  onUseTemplate?: () => void;
  index: number;
}) {
  const sampleData = useMemo(() => getSampleResumeData(templateId), [templateId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className={`rounded-xl border-2 bg-[#16121f] overflow-hidden transition-all cursor-pointer ${
        isSelected
          ? "border-accent shadow-lg shadow-accent/20 ring-2 ring-accent/30"
          : "border-white/10 hover:border-white/25"
      }`}
      onClick={onSelect}
    >
      <div
        className="relative overflow-hidden bg-white rounded-t-xl"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT, margin: "0 auto" }}
      >
        <div
          className="absolute top-0 left-0 origin-top-left bg-white shadow-inner"
          style={{
            transform: `scale(${PREVIEW_SCALE})`,
            width: 794,
            minHeight: 1123,
          }}
        >
          <ResumePreview data={sampleData} />
        </div>
      </div>
      <div className="p-3 border-t border-white/10">
        <p className="text-white font-medium text-sm truncate">{label}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-accent/20 text-accent text-[10px] font-bold">
            ATS
          </span>
          <span className="text-[10px] text-gray-500">Friendly</span>
        </div>
        {isSelected && onUseTemplate && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUseTemplate();
            }}
            className="mt-2 w-full rounded-lg bg-accent py-2 text-white text-xs font-semibold hover:bg-accent/90 transition-colors"
          >
            Use This Template
          </button>
        )}
      </div>
    </motion.div>
  );
}
