/**
 * Generate full resume from minimal user input (name, role, experience level, job titles, project titles, optional JD).
 * Uses Mistral API; prompt is informed by patterns from 27k+ resumes. Schema requires 3+ bullets per project.
 */

import { z } from "zod";
import { generateObject } from "ai";
import { getModel, resolveModelOptions } from "./model";
import { getResumePatternsPrompt } from "./resumePatterns";
import { extractedResumeSchema } from "@/lib/validation/resumeSchema";
import type { ResumeData } from "@/types/resume";
import {
  createEmptyResume,
  createEmptyPersonal,
  createEmptyExperience,
  createEmptyEducation,
  createEmptyProject,
} from "@/types/resume";
import type { ExperienceLevel } from "@/lib/resumeFlowStorage";

/** Projects: bullets optional in schema so we never 500; we pad to 3+ in code. */
const projectWithRequiredBulletsSchema = z.object({
  title: z.string(),
  description: z.string(),
  bullets: z.array(z.string()).optional().describe("At least 3 bullet points per project preferred; each a full sentence with action verb and outcome"),
});

const generateFromMinimalSchema = extractedResumeSchema.extend({
  projects: z.array(projectWithRequiredBulletsSchema).optional(),
});

const SYSTEM = `You are a professional resume writer. Your goal is to produce a high-scoring, impact-driven resume that passes ATS and impresses recruiters. The resume must look so strong that the candidate feels confident paying to download it.

RULES:
- Write realistic, impactful, ATS-optimized resume content. Do not just copy the user's job titles or project names—expand them into full, compelling bullets with strong action verbs and outcomes.
- Saturate the resume with ATS keywords: include role-specific technical terms, tools, frameworks, methodologies, and soft skills in the summary, every experience bullet, every project bullet, and the skills list. Recruiters and ATS systems search for these keywords.
- Never fabricate extreme metrics. Keep achievements believable but impressive (e.g. "Improved X by 15%", "Reduced turnaround by 20%", "Supported 10K+ users").
- Use quantified impact where possible (percentages, timeframes, team size) and keep numbers plausible for the experience level.
- Tone must match experience level: Fresher = emphasize projects, internships, coursework; 1-3 years = execution, collaboration; 3-6 = ownership, scope; 6+ = leadership, strategy, cross-functional impact.
- For each work experience: generate 4-6 bullet points with strong action verbs (Led, Delivered, Implemented, Reduced, Increased, Built, Optimized). Include role-relevant tools and technologies. Make each bullet outcome-focused and keyword-rich.
- For each project: you MUST output a "bullets" array with at least 3 bullet points per project. Each bullet must be a full sentence with action verb, tech stack or method, and result/impact. Also provide a short "description" (1 sentence overview). Do not output only a single description—always include 3+ bullets per project.
- Skills: infer from target role, job titles, and projects. List 10-18 items: technical skills, tools, frameworks, and soft skills. Use exact terms that appear in job descriptions for the target role.
- Professional summary: 2-4 sentences, dense with ATS keywords and outcomes. Match seniority and industry. Make the candidate sound like a strong fit for the target role.
- If a job description is provided, extract required keywords and core skills and embed them naturally in summary, every bullet, and skills.
- Output only valid JSON matching the schema. Use empty string for missing optional fields. Dates: short form like "Jan 2022" or "Present". For each project include "title", "description", and "bullets" (array of 3+ strings).`
  + getResumePatternsPrompt();

export interface GenerateFromMinimalInput {
  fullName: string;
  targetRole: string;
  experienceLevel: ExperienceLevel;
  location?: string;
  jobDescription?: string;
  experiences: { jobTitle: string; company?: string; duration?: string }[];
  projects: { title: string; oneLiner?: string }[];
  apiKey?: string | null;
}

export async function generateFromMinimal(params: GenerateFromMinimalInput): Promise<{
  resume: ResumeData;
  usage?: { promptTokens: number; completionTokens: number };
}> {
  const { fullName, targetRole, experienceLevel, location, jobDescription, experiences, projects, apiKey } = params;
  const resolved = resolveModelOptions(apiKey ? { apiKey } : null);
  const model = getModel(resolved);

  const levelLabel =
    experienceLevel === "fresher"
      ? "Fresher (0-1 years)"
      : experienceLevel === "1-3"
        ? "1-3 years"
        : experienceLevel === "3-6"
          ? "3-6 years"
          : "6+ years";

  const expBlock =
    experiences.length > 0
      ? experiences
          .map(
            (e) =>
              `- ${e.jobTitle}${e.company ? ` at ${e.company}` : ""}${e.duration ? ` (${e.duration})` : ""}`
          )
          .join("\n")
      : "- (No job titles provided)";

  const projBlock =
    projects.length > 0
      ? projects.map((p) => `- ${p.title}${p.oneLiner ? `: ${p.oneLiner}` : ""}`).join("\n")
      : "- (No projects provided)";

  const userPrompt = `Generate a complete ATS-optimized resume from ONLY the following minimal input. Do not ask for more; infer and generate all content.

--- CANDIDATE INPUT ---
Full Name: ${fullName}
Target Job Role: ${targetRole}
Experience Level: ${levelLabel}
${location ? `Location: ${location}` : ""}

Job titles (and optional company/duration):
${expBlock}

Projects (and optional one-line description):
${projBlock}
${jobDescription ? `\n--- JOB DESCRIPTION (tailor resume to this) ---\n${jobDescription.slice(0, 8000)}` : ""}

--- INSTRUCTIONS ---
1. Set personal.fullName to "${fullName}", personal.title to a professional title matching "${targetRole}", and personal.location to "${location || ""}".
2. Write a professional summary (2-4 sentences) for someone targeting "${targetRole}" with ${levelLabel} experience.
3. For each job title listed above, create ONE work experience entry with company (use "${experiences[0]?.company || "Company"}" or infer), startDate/endDate (infer plausible dates from ${levelLabel}), and 4-6 impact bullets. Use action verbs and realistic metrics.
4. Infer 8-15 skills from the role, job titles, and projects. Include technical skills, tools, and soft skills.
5. For each project listed, use the EXACT "title" and "description" (one-line) as provided by the candidate above; do not rewrite them. Only generate the "bullets" array (at least 3 bullet points per project). Each bullet must use an action verb, mention technologies or methods, and state an outcome. Use ATS keywords relevant to ${targetRole}.
6. Include one education placeholder: school "—", degree "—", field "—", dates "—" if not provided.
7. Output valid JSON matching the schema. Include "projects" array; each project MUST have "title", "description", and "bullets" (exactly 3 or more strings—this is required).`;

  const result = await generateObject({
    model: model as never,
    schema: generateFromMinimalSchema,
    system: SYSTEM,
    prompt: userPrompt,
  });

  const object = result.object as {
    personal: { fullName?: string; email?: string; phone?: string; location?: string; linkedin?: string; website?: string; title?: string };
    summary?: string;
    experience?: { jobTitle?: string; company?: string; location?: string; startDate?: string; endDate?: string; current?: boolean; bullets?: string[] }[];
    education?: { school?: string; degree?: string; field?: string; startDate?: string; endDate?: string; gpa?: string }[];
    skills?: string[];
    projects?: { title?: string; description?: string; bullets?: string[] }[];
  };

  const personal = {
    ...createEmptyPersonal(),
    fullName: object.personal?.fullName ?? fullName,
    email: object.personal?.email ?? "",
    phone: object.personal?.phone ?? "",
    location: object.personal?.location ?? location ?? "",
    linkedin: object.personal?.linkedin ?? "",
    website: object.personal?.website ?? "",
    title: object.personal?.title ?? targetRole,
  };

  const experienceList = object.experience?.length ? object.experience : [];
  const experience = experienceList.map((e: Record<string, unknown>, i: number) => ({
    ...createEmptyExperience(crypto.randomUUID?.() ?? `exp-${i}`),
    jobTitle: (e.jobTitle as string) ?? "",
    company: (e.company as string) ?? "",
    location: (e.location as string) ?? "",
    startDate: (e.startDate as string) ?? "",
    endDate: (e.endDate as string) ?? "",
    current: (e.current as boolean) ?? false,
    bullets: Array.isArray(e.bullets) && e.bullets.length ? (e.bullets as string[]) : [""],
  }));
  if (experience.length === 0) experience.push(createEmptyExperience(crypto.randomUUID?.() ?? "exp-0"));

  const educationList = object.education?.length ? object.education : [];
  const education = educationList.map((e: Record<string, unknown>, i: number) => ({
    ...createEmptyEducation(crypto.randomUUID?.() ?? `edu-${i}`),
    school: (e.school as string) ?? "",
    degree: (e.degree as string) ?? "",
    field: (e.field as string) ?? "",
    startDate: (e.startDate as string) ?? "",
    endDate: (e.endDate as string) ?? "",
    gpa: (e.gpa as string) ?? "",
  }));
  if (education.length === 0) education.push(createEmptyEducation(crypto.randomUUID?.() ?? "edu-0"));

  const projectsList = object.projects ?? [];
  // Preserve user's project title and oneLiner; use AI only for bullets
  const projectsResume = projectsList.length
    ? projectsList.map((p: Record<string, unknown>, i: number) => {
        const rawBullets = Array.isArray(p.bullets) ? (p.bullets as string[]).filter(Boolean) : [];
        const llmDesc = (p.description as string) ?? "";
        const llmTitle = (p.title as string) ?? "";
        const userProj = projects[i];
        const title = (userProj?.title?.trim() || llmTitle) || "";
        const description = (userProj?.oneLiner?.trim() || llmDesc) || "";
        let bullets = rawBullets.length >= 3 ? rawBullets : rawBullets.slice();
        if (bullets.length < 3 && description) {
          const parts = description.split(/[.;]\s+/).filter(Boolean);
          while (bullets.length < 3 && parts.length > 0) bullets.push(parts.shift()!.trim());
          while (bullets.length < 3) bullets.push(description);
        } else if (bullets.length < 3 && title) {
          while (bullets.length < 3) bullets.push(description || `${title}: expanded impact and outcomes.`);
        }
        return {
          ...createEmptyProject(crypto.randomUUID?.() ?? `proj-${i}`),
          title,
          description,
          bullets: bullets.length > 0 ? bullets.slice(0, 8) : (description ? [description] : []),
        };
      })
    : projects.length > 0
      ? projects.map((p, i) => ({
          ...createEmptyProject(crypto.randomUUID?.() ?? `proj-${i}`),
          title: p.title?.trim() || "",
          description: p.oneLiner?.trim() || "",
          bullets: [] as string[],
        }))
      : [createEmptyProject(crypto.randomUUID?.() ?? "proj-0")];

  const resume: ResumeData = {
    ...createEmptyResume(),
    personal,
    summary: object.summary ?? "",
    experience,
    education,
    skills: Array.isArray(object.skills) ? object.skills.filter(Boolean) : [],
    projects: projectsResume,
  };

  const usage =
    "usage" in result && result.usage
      ? { promptTokens: result.usage.promptTokens ?? 0, completionTokens: result.usage.completionTokens ?? 0 }
      : undefined;

  return { resume, usage };
}
