"use client";

import { GlowSelectableCard } from "@/components/ui/GlowSelectableCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import type { InputMethod as InputMethodType } from "@/lib/onboardingStorage";

const INPUT_OPTIONS: {
  id: InputMethodType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "job-description",
    label: "Add job description",
    description: "Paste a job posting and we'll create a tailored resume template.",
    icon: (
      <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    id: "upload-pdf",
    label: "Upload PDF",
    description: "We'll extract and structure your existing resume.",
    icon: (
      <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    id: "start-fresh",
    label: "Start from scratch",
    description: "Build your resume step by step with guided sections.",
    icon: (
      <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
      </svg>
    ),
  },
];

interface InputMethodProps {
  selected: InputMethodType | null;
  onSelect: (method: InputMethodType) => void;
  onContinue: () => void;
  onSkip?: () => void;
}

export function InputMethod({
  selected,
  onSelect,
  onContinue,
  onSkip,
}: InputMethodProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-serif text-stone-900 text-center mb-2">
        Choose your starting point
      </h1>
      <p className="text-stone-600 text-center text-sm sm:text-base mb-10">
        Import existing content or build from the ground up.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {INPUT_OPTIONS.map((opt) => (
          <GlowSelectableCard
            key={opt.id}
            selected={selected === opt.id}
            onClick={() => onSelect(opt.id)}
            className="p-6 flex flex-col items-center text-center"
          >
            <div className="mb-3">{opt.icon}</div>
            <h3 className="font-semibold text-stone-900">{opt.label}</h3>
            <p className="text-stone-500 text-sm mt-1">{opt.description}</p>
          </GlowSelectableCard>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        <PrimaryButton
          onClick={onContinue}
          disabled={!selected}
          className="w-full sm:w-auto min-w-[200px] uppercase tracking-wider text-sm"
        >
          Continue to resume
        </PrimaryButton>
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="text-stone-500 text-sm hover:text-stone-700"
          >
            I&apos;ll do this later
          </button>
        )}
      </div>
    </div>
  );
}
