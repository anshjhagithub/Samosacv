import type { RoleId } from "@/lib/rolePresets";

const ONBOARDING_KEY = "resume_onboarding";

export type ExperienceLevel = "student" | "0-2" | "2-5" | "5+";

export type InputMethod = "job-description" | "upload-pdf" | "start-fresh";

export interface OnboardingData {
  roleId: RoleId;
  experienceLevel: ExperienceLevel;
  inputMethod: InputMethod;
  completedAt: number;
}

function isClient(): boolean {
  return typeof window !== "undefined";
}

export function loadOnboarding(): OnboardingData | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingData;
  } catch {
    return null;
  }
}

export function saveOnboarding(data: Omit<OnboardingData, "completedAt">): void {
  if (!isClient()) return;
  try {
    const full: OnboardingData = {
      ...data,
      completedAt: Date.now(),
    };
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(full));
  } catch (e) {
    console.warn("Failed to save onboarding", e);
  }
}

export function clearOnboarding(): void {
  if (!isClient()) return;
  try {
    localStorage.removeItem(ONBOARDING_KEY);
  } catch {
    // no-op
  }
}
