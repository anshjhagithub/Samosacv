/**
 * localStorage state for the 4-step "Create your resume in 60 seconds" flow.
 * Keys: resume_flow_basic, resume_flow_experience, resume_flow_projects.
 */

const KEY_BASIC = "resume_flow_basic";
const KEY_EXPERIENCE = "resume_flow_experience";
const KEY_PROJECTS = "resume_flow_projects";
const KEY_GENERATED = "resume_flow_generated";

function isClient(): boolean {
  return typeof window !== "undefined";
}

export type ExperienceLevel = "fresher" | "1-3" | "3-6" | "6+";

export interface BasicInfo {
  fullName: string;
  targetRole: string;
  experienceLevel: ExperienceLevel;
  location: string;
  jobDescription: string;
}

export interface ExperienceEntryInput {
  jobTitle: string;
  company: string;
  duration: string;
}

export interface ProjectEntryInput {
  title: string;
  oneLiner: string;
}

export interface GeneratedResult {
  resumeId: string;
  atsScore: number;
  missingSkills: string[];
  targetRole?: string;
  /** When the generation was stored (for review page to load). */
  at: number;
}

const defaultBasic: BasicInfo = {
  fullName: "",
  targetRole: "",
  experienceLevel: "1-3",
  location: "",
  jobDescription: "",
};

export function getBasicInfo(): BasicInfo {
  if (!isClient()) return defaultBasic;
  try {
    const raw = localStorage.getItem(KEY_BASIC);
    if (!raw) return defaultBasic;
    const parsed = JSON.parse(raw) as Partial<BasicInfo>;
    return { ...defaultBasic, ...parsed };
  } catch {
    return defaultBasic;
  }
}

export function setBasicInfo(info: Partial<BasicInfo>): void {
  if (!isClient()) return;
  try {
    const current = getBasicInfo();
    localStorage.setItem(KEY_BASIC, JSON.stringify({ ...current, ...info }));
  } catch (e) {
    console.warn("Failed to save basic info", e);
  }
}

export function getExperienceList(): ExperienceEntryInput[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(KEY_EXPERIENCE);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ExperienceEntryInput[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setExperienceList(list: ExperienceEntryInput[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(KEY_EXPERIENCE, JSON.stringify(list));
  } catch (e) {
    console.warn("Failed to save experience list", e);
  }
}

export function getProjectList(): ProjectEntryInput[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(KEY_PROJECTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ProjectEntryInput[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setProjectList(list: ProjectEntryInput[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(KEY_PROJECTS, JSON.stringify(list));
  } catch (e) {
    console.warn("Failed to save project list", e);
  }
}

export function setGeneratedResult(result: Omit<GeneratedResult, "at">): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(KEY_GENERATED, JSON.stringify({ ...result, at: Date.now() }));
  } catch (e) {
    console.warn("Failed to save generated result", e);
  }
}

export function getGeneratedResult(): GeneratedResult | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(KEY_GENERATED);
    if (!raw) return null;
    return JSON.parse(raw) as GeneratedResult;
  } catch {
    return null;
  }
}

export function clearResumeFlow(): void {
  if (!isClient()) return;
  try {
    localStorage.removeItem(KEY_BASIC);
    localStorage.removeItem(KEY_EXPERIENCE);
    localStorage.removeItem(KEY_PROJECTS);
    localStorage.removeItem(KEY_GENERATED);
  } catch {}
}
