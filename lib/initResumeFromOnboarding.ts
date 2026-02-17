import {
  createEmptyResume,
  createEmptyExperience,
  createEmptyEducation,
  createEmptyProject,
  type ResumeData,
  type TemplateId,
} from "@/types/resume";
import { getPreset, getSummaryFromPreset } from "@/lib/rolePresets";
import type { OnboardingData } from "@/lib/onboardingStorage";

function generateId(): string {
  return crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Build initial resume state from completed onboarding. No API calls.
 * Optionally pass templateId to set the chosen template (defaults to classic).
 */
export function buildResumeFromOnboarding(
  onboarding: OnboardingData,
  templateId?: TemplateId
): ResumeData {
  const base = createEmptyResume();
  const preset = getPreset(onboarding.roleId);

  const resume: ResumeData = {
    ...base,
    templateId: templateId ?? base.templateId,
    personal: {
      ...base.personal,
      title: preset.label,
    },
    summary: getSummaryFromPreset(onboarding.roleId),
    skills: preset.skills.length > 0 ? [...preset.skills] : base.skills,
    experience: [createEmptyExperience(generateId())],
    education: [createEmptyEducation(generateId())],
    projects: base.projects ?? [createEmptyProject(generateId())],
  };

  return resume;
}
