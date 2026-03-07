"use client";

import { GlowSelectableCard } from "@/components/ui/GlowSelectableCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { rolePresets, type RoleId, ROLE_IDS } from "@/lib/rolePresets";

const DEFAULT_ICON = (
  <svg className="w-10 h-10 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const ROLE_ICONS: Partial<Record<RoleId, React.ReactNode>> = {
  "data-analyst": (
    <svg className="w-10 h-10 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h2v-2H3v2zm4 4h2v-2H7v2zm0-8h2V7H7v2zm4 0h2V7h-2v2zm4 4h2v-2h-2v2zm0-8h2V7h-2v2zm4 4h2v-2h-2v2zm0-8h2V7h-2v2z" />
    </svg>
  ),
  "ai-engineer": (
    <svg className="w-10 h-10 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.318H4.517c-1.718 0-2.3-2.086-1.067-3.318L5 14.5" />
    </svg>
  ),
  "software-developer": (
    <svg className="w-10 h-10 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  ),
  "product-manager": (
    <svg className="w-10 h-10 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  "marketing-analyst": (
    <svg className="w-10 h-10 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
    </svg>
  ),
  other: (
    <svg className="w-10 h-10 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
};

interface RoleSelectionProps {
  selectedRoleId: RoleId | null;
  onSelect: (id: RoleId) => void;
  onContinue: () => void;
  onSearchOther?: () => void;
}

export function RoleSelection({
  selectedRoleId,
  onSelect,
  onContinue,
  onSearchOther,
}: RoleSelectionProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-serif text-stone-900 text-center mb-2">
        What role are you targeting?
      </h1>
      <p className="text-stone-500 text-center text-sm sm:text-base mb-10">
        Choose your expertise so we can tailor your narrative.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {ROLE_IDS.map((id) => {
          const preset = rolePresets[id];
          return (
            <GlowSelectableCard
              key={id}
              selected={selectedRoleId === id}
              onClick={() => onSelect(id)}
              className="p-5"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 rounded-xl bg-stone-100 p-3 border border-stone-200">
                  {ROLE_ICONS[id] || DEFAULT_ICON}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-stone-900">{preset.label}</h3>
                  <p className="text-stone-500 text-sm mt-0.5 line-clamp-2">
                    {preset.skills.length ? preset.skills.slice(0, 2).join(", ") : "Custom path"}
                  </p>
                </div>
              </div>
            </GlowSelectableCard>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-4">
        <PrimaryButton
          onClick={onContinue}
          disabled={!selectedRoleId}
          className="w-full sm:w-auto min-w-[240px] uppercase tracking-wider text-sm"
        >
          Continue to experience
        </PrimaryButton>
        {onSearchOther && (
          <p className="text-stone-500 text-sm">
            Can&apos;t find your role?{" "}
            <button
              type="button"
              onClick={onSearchOther}
              className="text-amber-700 hover:underline"
            >
              Search for other expertise
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
