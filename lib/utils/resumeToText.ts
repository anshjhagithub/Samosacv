/**
 * Serialize ResumeData to plain text for ATS scoring (scoreResume expects a string).
 */
import type { ResumeData } from "@/types/resume";

export function resumeToText(data: ResumeData): string {
  const parts: string[] = [];

  const p = data.personal;
  if (p.fullName) parts.push(p.fullName);
  if (p.title) parts.push(p.title);
  if (p.location) parts.push(p.location);

  if (data.summary) parts.push(data.summary);

  if (data.experience?.length) {
    parts.push("Experience");
    for (const e of data.experience) {
      if (e.jobTitle) parts.push(e.jobTitle);
      if (e.company) parts.push(e.company);
      if (e.bullets?.length) parts.push(...e.bullets.filter(Boolean));
    }
  }

  if (data.skills?.length) parts.push("Skills", ...data.skills);

  if (data.projects?.length) {
    parts.push("Projects");
    for (const proj of data.projects) {
      if (proj.title) parts.push(proj.title);
      if (proj.description) parts.push(proj.description);
    }
  }

  if (data.education?.length) {
    parts.push("Education");
    for (const e of data.education) {
      if (e.school) parts.push(e.school);
      if (e.degree) parts.push(e.degree);
      if (e.field) parts.push(e.field);
    }
  }

  return parts.join("\n");
}
