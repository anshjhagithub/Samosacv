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

const SYSTEM = `You are an expert resume parser and ATS (Applicant Tracking System) specialist. Your goal is to produce a high-scoring, impact-driven resume that passes ATS and impresses recruiters.

EXTRACTION RULES:
- Extract structured resume data from raw text (LinkedIn, past resume, or mixed content). If a job description is provided, tailor the resume: use keywords from the job, reframe bullets to match responsibilities, and write a targeted summary.
- For EVERY work experience bullet: use strong action verbs (Led, Delivered, Implemented, Reduced, Increased, Launched, Built, Optimized, etc.), include numbers/percentages/timeframes where possible (e.g. "Increased revenue by 25%", "Reduced load time by 40%", "Managed team of 8"), and keep each bullet to one clear achievement. Avoid vague phrases like "Responsible for" or "Helped with".
- Extract or infer a professional summary that is 2-4 sentences, keyword-rich, and outcome-focused. Include years of experience and domain if evident.
- Extract ALL relevant projects: side projects, open source, coursework, hackathons, or work projects. For each project include a short title, a 1-2 sentence description, and a "bullets" array with at least 3 bullet points (action verb, technologies, outcome). Do not output only description—always include 3+ bullets per project.
- Skills: list 8-15 concrete skills (technologies, tools, methods). Pull from the job description when tailoring.
- When ONLY a job description is provided (no candidate content), generate a resume template: infer job title, 5-12 skills from the description, a strong summary, 1-2 placeholder experience entries with ATS-style bullet placeholders, and 0-2 placeholder projects.

OUTPUT: Valid JSON matching the schema. Use empty string for missing fields. Dates: short form like "Jan 2022" or "2020". Include a "projects" array with objects { "title": string, "description": string, "bullets": string[] }—each project must have at least 3 bullets.`;

const JOB_ONLY_SYSTEM = `You are an expert resume builder and ATS specialist. Given ONLY a job description, generate a structured resume template that a candidate can fill in. Output must be ATS-friendly and impact-oriented.

REQUIREMENTS:
(1) Professional title inferred from the role.
(2) 5-12 key skills mentioned or implied in the job description.
(3) A 2-3 sentence summary describing an ideal candidate with relevant keywords.
(4) 1-2 placeholder work experience entries: generic company names, 2-4 bullet points each using action verbs and placeholder metrics (e.g. "Increased X by Y%", "Led team of N", "Reduced Z by N%").
(5) 0-1 placeholder project with title and 1-2 sentence description (technologies + outcome).

Output only valid JSON matching the schema. Use empty strings for personal fullName, email, phone, location. Dates: "Present" or "2023". Include "projects" array (can be empty []).`;

export interface ATSExtractContext {
  targetRole: string;
  currentScore: number;
  breakdown: { skillMatch: number; keywordDensity: number; actionVerbUsage: number; quantificationScore: number; structureScore: number; experienceAlignment: number };
  missingSkills: string[];
  roleTopSkills: string[];
  roleActionVerbs: string[];
}

export async function extractResume(params: {
  content: string;
  jobDescription?: string;
  apiKey?: string | null;
  atsContext?: ATSExtractContext | null;
}): Promise<{ resume: ResumeData; usage?: { promptTokens: number; completionTokens: number } }> {
  const { content, jobDescription, apiKey, atsContext } = params;
  const resolved = resolveModelOptions(apiKey ? { apiKey } : null);
  const model = getModel(resolved);

  const contentTrimmed = content.trim();
  const jobOnly = jobDescription && contentTrimmed.length < 100;

  const atsBlock = atsContext
    ? `\n\n--- ATS OPTIMIZATION (TARGET: 90+ SCORE) ---\nTarget role: ${atsContext.targetRole}\nCurrent ATS score: ${atsContext.currentScore}/100 (Skill match: ${atsContext.breakdown.skillMatch}, Keywords: ${atsContext.breakdown.keywordDensity}, Action verbs: ${atsContext.breakdown.actionVerbUsage}, Quantification: ${atsContext.breakdown.quantificationScore}, Structure: ${atsContext.breakdown.structureScore}, Experience: ${atsContext.breakdown.experienceAlignment}).\nTop skills for this role to include: ${atsContext.roleTopSkills.slice(0, 20).join(", ")}.\nAction verbs to use: ${atsContext.roleActionVerbs.slice(0, 15).join(", ")}.\nMISSING high-value skills to add or reflect in bullets: ${atsContext.missingSkills.join(", ")}.\nRewrite the resume so it scores 90+ for this role: add missing skills where truthful, use these action verbs and numbers/metrics in every bullet, and align summary and skills with the role.`
    : "";

  const userPrompt =
    (jobOnly
      ? `Generate a resume template tailored to this job description. The user will fill in their own details later. Include projects array (can be empty or 1 placeholder). Use ATS-friendly, impact-driven bullet placeholders.\n\n--- JOB DESCRIPTION ---\n${jobDescription.slice(0, 12000)}\n\nOutput the structured resume JSON (template with inferred title, skills, summary, experience, and projects).`
      : jobDescription
        ? `Extract and tailor a resume from the following content. Then tailor it to this job description. Rewrite experience bullets with strong action verbs and numbers where possible. Extract any projects (side projects, coursework, open source). Include keywords from the job description.\n\n--- CONTENT ---\n${content.slice(0, 25000)}\n\n--- JOB DESCRIPTION ---\n${jobDescription.slice(0, 8000)}\n\nOutput the structured resume JSON (tailored to the job, with experience, education, skills, and projects).`
        : `Extract a structured resume from the following content (LinkedIn, resume text, or similar). For each work experience bullet, rewrite for impact: use action verbs and add or infer numbers/percentages where possible. Extract all projects (title + description). Output ATS-friendly, keyword-rich summary and skills.\n\n${content.slice(0, 30000)}\n\nOutput the structured resume JSON including experience, education, skills, and projects.`) + atsBlock;

  const systemPrompt = jobOnly ? JOB_ONLY_SYSTEM : SYSTEM;

  const result = await generateObject({
    model: model as never,
    schema: extractedResumeSchema,
    system: systemPrompt,
    prompt: userPrompt,
  });
  const { object } = result;
  const usage = "usage" in result && result.usage
    ? { promptTokens: result.usage.promptTokens ?? 0, completionTokens: result.usage.completionTokens ?? 0 }
    : undefined;

  const personal = {
    ...createEmptyPersonal(),
    fullName: object.personal.fullName || "",
    email: object.personal.email || "",
    phone: object.personal.phone || "",
    location: object.personal.location || "",
    linkedin: object.personal.linkedin || "",
    website: object.personal.website || "",
    title: object.personal.title || "",
  };

  const experienceList = object.experience?.length ? object.experience : [];
  const experience = experienceList.map((e: { jobTitle?: string; company?: string; location?: string; startDate?: string; endDate?: string; current?: boolean; bullets?: string[] }, i: number) => ({
    ...createEmptyExperience(crypto.randomUUID?.() ?? `exp-${i}`),
    jobTitle: e?.jobTitle ?? "",
    company: e?.company ?? "",
    location: e?.location ?? "",
    startDate: e?.startDate ?? "",
    endDate: e?.endDate ?? "",
    current: e?.current ?? false,
    bullets: Array.isArray(e?.bullets) && e.bullets.length ? e.bullets : [""],
  }));
  if (experience.length === 0) experience.push(createEmptyExperience(crypto.randomUUID?.() ?? "exp-0"));

  const educationList = object.education?.length ? object.education : [];
  const education = educationList.map((e: { school?: string; degree?: string; field?: string; startDate?: string; endDate?: string; gpa?: string }, i: number) => ({
    ...createEmptyEducation(crypto.randomUUID?.() ?? `edu-${i}`),
    school: e?.school ?? "",
    degree: e?.degree ?? "",
    field: e?.field ?? "",
    startDate: e?.startDate ?? "",
    endDate: e?.endDate ?? "",
    gpa: e?.gpa ?? "",
  }));
  if (education.length === 0) education.push(createEmptyEducation(crypto.randomUUID?.() ?? "edu-0"));

  const projectsList = (object as { projects?: { title?: string; description?: string; bullets?: string[] }[] }).projects ?? [];
  const projects = projectsList.length
    ? projectsList.map((p: { title?: string; description?: string; bullets?: string[] }, i: number) => {
        const rawBullets = Array.isArray(p?.bullets) ? p.bullets.filter(Boolean) : [];
        const desc = p?.description ?? "";
        const title = p?.title ?? "";
        let bullets = rawBullets.length >= 3 ? rawBullets : [...rawBullets];
        if (bullets.length < 3 && desc) {
          const parts = desc.split(/[.;]\s+/).filter(Boolean);
          while (bullets.length < 3 && parts.length > 0) bullets.push(parts.shift()!.trim());
          while (bullets.length < 3) bullets.push(desc);
        } else if (bullets.length < 3) {
          while (bullets.length < 3) bullets.push(desc || "Key contribution and outcome.");
        }
        return {
          ...createEmptyProject(crypto.randomUUID?.() ?? `proj-${i}`),
          title,
          description: desc,
          bullets: bullets.length > 0 ? bullets.slice(0, 8) : (desc ? [desc] : []),
        };
      })
    : [createEmptyProject(crypto.randomUUID?.() ?? "proj-0")];

  const resume: ResumeData = {
    ...createEmptyResume(),
    personal,
    summary: object.summary ?? "",
    experience,
    education,
    skills: Array.isArray(object.skills) ? object.skills.filter(Boolean) : [],
    projects,
  };

  return { resume, usage };
}

export type ExtractResult = Awaited<ReturnType<typeof extractResume>>;
