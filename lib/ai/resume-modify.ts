/**
 * Apply a tone/modifier to an existing resume (summary + experience bullets).
 * Used by review page: Make More Impactful, Technical, Leadership, ATS.
 */

import { generateObject } from "ai";
import { getModel, resolveModelOptions } from "./model";
import { extractedResumeSchema } from "@/lib/validation/resumeSchema";
import type { ResumeData } from "@/types/resume";
import {
  createEmptyResume,
  createEmptyPersonal,
  createEmptyExperience,
  createEmptyEducation,
  createEmptyProject,
} from "@/types/resume";

export type ResumeModifier = "impactful" | "technical" | "leadership" | "ats";

const MODIFIER_INSTRUCTIONS: Record<ResumeModifier, string> = {
  impactful:
    "Rewrite the summary and every experience bullet to be more impact-focused. Use strong action verbs (Led, Delivered, Implemented, Reduced, Increased). Add or emphasize quantified results (percentages, time saved, team size). Keep achievements believable.",
  technical:
    "Rewrite the summary and experience bullets to highlight technical depth: tools, technologies, architecture, code quality, performance, and system design. Use precise technical terms relevant to the role.",
  leadership:
    "Rewrite the summary and bullets to emphasize leadership: mentoring, cross-functional collaboration, strategy, ownership, and driving outcomes through others. Keep metrics where relevant.",
  ats:
    "Optimize the summary and every bullet for ATS (Applicant Tracking Systems): include role-relevant keywords naturally, use standard section phrasing, strong action verbs, and clear quantification. Do not change the structure or add new sections.",
};

export async function modifyResume(params: {
  resume: ResumeData;
  modifier: ResumeModifier;
  apiKey?: string | null;
}): Promise<ResumeData> {
  const { resume, modifier, apiKey } = params;
  const resolved = resolveModelOptions(apiKey ? { apiKey } : null);
  const model = getModel(resolved);

  const instruction = MODIFIER_INSTRUCTIONS[modifier];
  const resumeJson = JSON.stringify({
    personal: resume.personal,
    summary: resume.summary,
    experience: resume.experience.map((e) => ({
      jobTitle: e.jobTitle,
      company: e.company,
      location: e.location,
      startDate: e.startDate,
      endDate: e.endDate,
      current: e.current,
      bullets: e.bullets,
    })),
    education: resume.education,
    skills: resume.skills,
    projects: resume.projects,
  }, null, 2);

  const { object } = await generateObject({
    model: model as never,
    schema: extractedResumeSchema,
    system: `You are a professional resume writer. Return only valid JSON matching the schema. Preserve personal, education, skills, and projects exactly as in the input. Only change summary and experience[].bullets (and keep jobTitle, company, dates).`,
    prompt: `${instruction}\n\nCurrent resume (JSON):\n${resumeJson.slice(0, 12000)}\n\nOutput the full resume JSON with updated summary and experience bullets only.`,
  });

  const obj = object as {
    personal: Record<string, unknown>;
    summary?: string;
    experience?: { jobTitle?: string; company?: string; location?: string; startDate?: string; endDate?: string; current?: boolean; bullets?: string[] }[];
    education?: Record<string, unknown>[];
    skills?: string[];
    projects?: { title?: string; description?: string }[];
  };

  const experience = (obj.experience ?? resume.experience).map((e: Record<string, unknown>, i: number) => {
    const existing = resume.experience[i];
    return {
      ...(existing ?? createEmptyExperience(crypto.randomUUID?.() ?? `exp-${i}`)),
      jobTitle: (e.jobTitle as string) ?? existing?.jobTitle ?? "",
      company: (e.company as string) ?? existing?.company ?? "",
      location: (e.location as string) ?? existing?.location ?? "",
      startDate: (e.startDate as string) ?? existing?.startDate ?? "",
      endDate: (e.endDate as string) ?? existing?.endDate ?? "",
      current: (e.current as boolean) ?? existing?.current ?? false,
      bullets: Array.isArray(e.bullets) && e.bullets.length ? (e.bullets as string[]) : existing?.bullets ?? [""],
    };
  });

  return {
    ...resume,
    summary: (obj.summary ?? resume.summary).trim(),
    experience: experience.length ? experience : resume.experience,
  };
}
