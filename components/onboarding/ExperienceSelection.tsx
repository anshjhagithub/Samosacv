"use client";

import { GlowSelectableCard } from "@/components/ui/GlowSelectableCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import type { ExperienceLevel } from "@/lib/onboardingStorage";

const EXPERIENCE_OPTIONS: { id: ExperienceLevel; label: string; subtitle: string }[] = [
  { id: "student", label: "Student", subtitle: "Internships, coursework, and early projects" },
  { id: "0-2", label: "0–2 years", subtitle: "Early career, building foundations" },
  { id: "2-5", label: "2–5 years", subtitle: "Growing impact and ownership" },
  { id: "5+", label: "5+ years", subtitle: "Senior level, leadership and depth" },
];

interface ExperienceSelectionProps {
  selected: ExperienceLevel | null;
  onSelect: (level: ExperienceLevel) => void;
  onContinue: () => void;
}

export function ExperienceSelection({
  selected,
  onSelect,
  onContinue,
}: ExperienceSelectionProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-serif text-stone-900 text-center mb-2">
        How much experience do you have?
      </h1>
      <p className="text-stone-500 text-center text-sm sm:text-base mb-10">
        We&apos;ll tune your resume tone and emphasis to match.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {EXPERIENCE_OPTIONS.map((opt) => (
          <GlowSelectableCard
            key={opt.id}
            selected={selected === opt.id}
            onClick={() => onSelect(opt.id)}
            className="p-6"
          >
            <h3 className="font-semibold text-stone-900 text-lg">{opt.label}</h3>
            <p className="text-stone-500 text-sm mt-1">{opt.subtitle}</p>
          </GlowSelectableCard>
        ))}
      </div>

      <div className="flex justify-center">
        <PrimaryButton
          onClick={onContinue}
          disabled={!selected}
          className="w-full sm:w-auto min-w-[200px] uppercase tracking-wider text-sm"
        >
          Continue
        </PrimaryButton>
      </div>
    </div>
  );
}
