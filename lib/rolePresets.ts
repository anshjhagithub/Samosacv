/**
 * Role presets for onboarding. Used to auto-fill skills and summary template.
 * No API calls — pure data.
 */

export type RoleId =
  | "data-analyst"
  | "ai-engineer"
  | "software-developer"
  | "product-manager"
  | "marketing-analyst"
  | "other";

export interface RolePreset {
  id: RoleId;
  label: string;
  skills: string[];
  summaryTemplate: string;
}

export const rolePresets: Record<RoleId, RolePreset> = {
  "data-analyst": {
    id: "data-analyst",
    label: "Data Analyst",
    skills: ["Python", "SQL", "Power BI", "Excel", "Statistics", "Data Visualization"],
    summaryTemplate:
      "Detail-oriented Data Analyst with experience turning complex datasets into actionable insights. Skilled in SQL, Python, and visualization tools to drive data-driven decision-making.",
  },
  "ai-engineer": {
    id: "ai-engineer",
    label: "AI Engineer",
    skills: ["Python", "PyTorch", "TensorFlow", "LLMs", "MLOps", "NLP"],
    summaryTemplate:
      "AI Engineer with experience building and deploying machine learning systems. Proficient in deep learning frameworks, LLMs, and production ML pipelines.",
  },
  "software-developer": {
    id: "software-developer",
    label: "Software Developer",
    skills: ["JavaScript", "TypeScript", "React", "Node.js", "Git", "REST APIs"],
    summaryTemplate:
      "Software Developer focused on building scalable, maintainable applications. Strong foundation in modern web technologies and clean architecture.",
  },
  "product-manager": {
    id: "product-manager",
    label: "Product Manager",
    skills: ["Roadmapping", "Agile", "User Research", "Stakeholder Management", "Metrics", "Prioritization"],
    summaryTemplate:
      "Product Manager with a track record of shipping products users love. Combines user research, data, and cross-functional collaboration to deliver impact.",
  },
  "marketing-analyst": {
    id: "marketing-analyst",
    label: "Marketing Analyst",
    skills: ["Google Analytics", "SEO", "A/B Testing", "Campaign Analysis", "Excel", "Data Storytelling"],
    summaryTemplate:
      "Marketing Analyst skilled in turning campaign and funnel data into clear narratives. Experience with analytics platforms, experimentation, and growth metrics.",
  },
  other: {
    id: "other",
    label: "Other",
    skills: [],
    summaryTemplate:
      "Results-driven professional with diverse experience. Adaptable and focused on delivering impact.",
  },
};

export const ROLE_IDS: RoleId[] = [
  "data-analyst",
  "ai-engineer",
  "software-developer",
  "product-manager",
  "marketing-analyst",
  "other",
];

export function getPreset(id: RoleId): RolePreset {
  return rolePresets[id];
}

export function getSummaryFromPreset(roleId: RoleId): string {
  return rolePresets[roleId].summaryTemplate;
}
