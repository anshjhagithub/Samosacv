"use client";

const STEPS = [
  { path: "/resume/start", label: "Basic info" },
  { path: "/resume/experience", label: "Experience" },
  { path: "/resume/template", label: "Template" },
  { path: "/resume/education", label: "Education" },
  { path: "/resume/projects", label: "Projects" },
  { path: "/resume/review", label: "Review" },
];

export function ResumeFlowProgress({ currentStep }: { currentStep: 1 | 2 | 3 | 4 | 5 | 6 }) {
  return (
    <div className="flex items-center gap-2 sm:gap-4 max-w-full overflow-hidden">
      {STEPS.map((step, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isPast = stepNum < currentStep;
        return (
          <div key={step.path} className="flex items-center flex-shrink-0">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                isActive ? "bg-amber-600 text-white" : isPast ? "bg-amber-100 text-amber-800" : "bg-stone-100 text-stone-400"
              }`}
            >
              {isPast ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                stepNum
              )}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-1 h-0.5 w-4 sm:w-6 ${stepNum < currentStep ? "bg-amber-300" : "bg-stone-200"}`}
                aria-hidden
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
