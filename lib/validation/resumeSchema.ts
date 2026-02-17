import { z } from "zod";

/** Schema for AI-extracted resume (no ids; we add when mapping to ResumeData). */
export const extractedPersonalSchema = z.object({
  fullName: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().optional(),
  website: z.string().optional(),
  title: z.string().optional(),
});

export const extractedExperienceSchema = z.object({
  jobTitle: z.string(),
  company: z.string(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  current: z.boolean().optional(),
  bullets: z.array(z.string()),
});

export const extractedEducationSchema = z.object({
  school: z.string(),
  degree: z.string(),
  field: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  gpa: z.string().optional(),
});

export const extractedProjectSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export const extractedResumeSchema = z.object({
  personal: extractedPersonalSchema,
  summary: z.string(),
  experience: z.array(extractedExperienceSchema),
  education: z.array(extractedEducationSchema),
  skills: z.array(z.string()),
  projects: z.array(extractedProjectSchema).optional(),
});

export type ExtractedResume = z.infer<typeof extractedResumeSchema>;
