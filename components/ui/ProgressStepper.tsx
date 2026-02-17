"use client";

interface ProgressStepperProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function ProgressStepper({ currentStep, totalSteps, className = "" }: ProgressStepperProps) {
  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <span className="font-medium text-white">
        STEP {String(currentStep).padStart(2, "0")}
      </span>
      <span className="h-4 w-px bg-gray-600" aria-hidden />
      <span className="text-gray-400">STEP {String(totalSteps).padStart(2, "0")}</span>
    </div>
  );
}
