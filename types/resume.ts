/**
 * Resume builder — data model. Minimal required fields per section.
 */

export type TemplateId =
  | "classic"
  | "modern"
  | "minimal"
  | "professional"
  | "executive"
  | "creative"
  | "compact"
  | "elegant"
  | "tech"
  | "academic"
  | "simple"
  | "bold"
  | "clean"
  | "contemporary"
  | "twoColumn"
  | "serif"
  | "minimalist"
  | "ivyLeague"
  | "singleColumn"
  | "doubleColumn"
  | "slate"
  | "coral"
  | "forest"
  | "navy"
  | "mint"
  | "warm"
  | "cool"
  | "crisp"
  | "refined"
  | "standout"
  | "corporate"
  | "startup"
  | "creativePro"
  | "minimalPro"
  | "euro"
  | "americano";

export const TEMPLATE_IDS: TemplateId[] = [
  "classic",
  "modern",
  "minimal",
  "professional",
  "executive",
  "creative",
  "compact",
  "elegant",
  "tech",
  "academic",
  "simple",
  "bold",
  "clean",
  "contemporary",
  "twoColumn",
  "serif",
  "minimalist",
  "ivyLeague",
  "singleColumn",
  "doubleColumn",
  "slate",
  "coral",
  "forest",
  "navy",
  "mint",
  "warm",
  "cool",
  "crisp",
  "refined",
  "standout",
  "corporate",
  "startup",
  "creativePro",
  "minimalPro",
  "euro",
  "americano",
];

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  title: string; // Professional title / headline
  /** Optional profile photo URL (data URL or hosted image) for resume */
  photoUrl?: string;
}

export interface ExperienceEntry {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface EducationEntry {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

export interface ProjectEntry {
  id: string;
  title: string;
  description: string;
}

export interface ResumeData {
  templateId: TemplateId;
  personal: PersonalInfo;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  certifications: { name: string; issuer: string; date: string }[];
  projects?: ProjectEntry[];
}

export type BuilderStep =
  | "template"
  | "personal"
  | "experience"
  | "education"
  | "skills"
  | "summary"
  | "preview";

export const BUILDER_STEPS: BuilderStep[] = [
  "template",
  "personal",
  "experience",
  "education",
  "skills",
  "summary",
  "preview",
];

export function createEmptyPersonal(): PersonalInfo {
  return {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
    title: "",
    photoUrl: undefined,
  };
}

export function createEmptyExperience(id: string): ExperienceEntry {
  return {
    id,
    jobTitle: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    bullets: [""],
  };
}

export function createEmptyEducation(id: string): EducationEntry {
  return {
    id,
    school: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
    gpa: "",
  };
}

export function createEmptyProject(id: string): ProjectEntry {
  return { id, title: "", description: "" };
}

export function createEmptyResume(): ResumeData {
  return {
    templateId: "classic",
    personal: createEmptyPersonal(),
    summary: "",
    experience: [createEmptyExperience(crypto.randomUUID?.() ?? "exp-1")],
    education: [createEmptyEducation(crypto.randomUUID?.() ?? "edu-1")],
    skills: [],
    certifications: [],
    projects: [createEmptyProject(crypto.randomUUID?.() ?? "proj-1")],
  };
}
