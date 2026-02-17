"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ProgressStepper } from "@/components/ui/ProgressStepper";
import { RoleSelection } from "@/components/onboarding/RoleSelection";
import { ExperienceSelection } from "@/components/onboarding/ExperienceSelection";
import { InputMethod } from "@/components/onboarding/InputMethod";
import { TemplatePicker } from "@/components/onboarding/TemplatePicker";
import { saveOnboarding, type OnboardingData, type ExperienceLevel, type InputMethod as InputMethodType } from "@/lib/onboardingStorage";
import { type RoleId } from "@/lib/rolePresets";
import { buildResumeFromOnboarding } from "@/lib/initResumeFromOnboarding";
import { saveResume } from "@/lib/storage/resumeStorage";
import type { TemplateId } from "@/types/resume";

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [roleId, setRoleId] = useState<RoleId | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
  const [inputMethod, setInputMethod] = useState<InputMethodType | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId | null>("classic");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const finishOnboarding = useCallback(
    (templateId: TemplateId = "classic") => {
      if (!roleId || !experienceLevel || !inputMethod) return;
      const data: Omit<OnboardingData, "completedAt"> = {
        roleId,
        experienceLevel,
        inputMethod,
      };
      saveOnboarding(data);
      const resume = buildResumeFromOnboarding(
        { ...data, completedAt: Date.now() },
        templateId
      );
      saveResume(resume);
      setIsTransitioning(true);
      router.push("/builder");
    },
    [roleId, experienceLevel, inputMethod, router]
  );

  const handleRoleContinue = () => {
    if (roleId) setStep(2);
  };

  const handleExperienceContinue = () => {
    if (experienceLevel) setStep(3);
  };

  const handleInputContinue = () => {
    if (!inputMethod) return;
    if (inputMethod === "upload-pdf") {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("createMethod", "pdf");
        window.location.href = "/create?method=pdf";
      } else {
        router.push("/create?method=pdf");
      }
      return;
    }
    if (inputMethod === "job-description") {
      if (typeof window !== "undefined") {
        window.location.href = "/create/job-description";
      } else {
        router.push("/create/job-description");
      }
      return;
    }
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-[#0c0a12] theme-dark">
      <header className="border-b border-white/5 sticky top-0 z-20 bg-[#0c0a12]/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-white font-semibold">
            <span className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-sm font-bold">
              A
            </span>
            ARTICULATED
          </a>
          <div className="flex items-center gap-4">
            <ProgressStepper currentStep={step} totalSteps={TOTAL_STEPS} />
            <div className="w-9 h-9 rounded-full border border-gray-600 flex items-center justify-center text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 min-h-[calc(100vh-4rem)] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <RoleSelection
                selectedRoleId={roleId}
                onSelect={setRoleId}
                onContinue={handleRoleContinue}
                onSearchOther={() => setRoleId("other")}
              />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <ExperienceSelection
                selected={experienceLevel}
                onSelect={setExperienceLevel}
                onContinue={handleExperienceContinue}
              />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <InputMethod
                selected={inputMethod}
                onSelect={setInputMethod}
                onContinue={handleInputContinue}
                onSkip={() => {
                  setInputMethod("start-fresh");
                  setStep(4);
                }}
              />
            </motion.div>
          )}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <TemplatePicker
                selectedId={selectedTemplateId}
                onSelect={setSelectedTemplateId}
                onUseTemplate={() =>
                  finishOnboarding(selectedTemplateId ?? "classic")
                }
              />
            </motion.div>
          )}
        </AnimatePresence>

        {isTransitioning && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1117]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col items-center gap-4">
              <motion.div
                className="w-12 h-12 rounded-full border-2 border-accent border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-gray-400">Preparing your resume…</p>
            </div>
          </motion.div>
        )}
      </main>

      <footer className="border-t border-gray-700/50 py-4">
        <p className="text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} ARTICULATED
        </p>
      </footer>
    </div>
  );
}
