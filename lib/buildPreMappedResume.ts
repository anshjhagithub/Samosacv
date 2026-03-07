/**
 * Builds a complete ResumeData object from user input + rolePresets + real data bullets.
 * Zero API cost — all data comes from local presets and extracted dataset intelligence.
 */

import type { ResumeData, TemplateId, ExperienceEntry, ProjectEntry } from "@/types/resume";
import { rolePresets, ROLE_IDS } from "@/lib/rolePresets";
import type { ExperienceLevel, ExperienceEntryInput, ProjectEntryInput } from "@/lib/resumeFlowStorage";
import roleBulletsData from "@/lib/data/role_bullets.json";

const roleBullets = roleBulletsData as Record<string, string[]>;

const EXPERIENCE_BULLETS: Record<string, string[]> = {
  fresher: [
    "Completed coursework and hands-on projects demonstrating core competencies",
    "Collaborated with peers on team-based assignments and group deliverables",
  ],
  "1-3": [
    "Contributed to cross-functional projects, improving team delivery by 15%",
    "Streamlined existing workflows resulting in 20% faster turnaround time",
    "Participated in code reviews and knowledge-sharing sessions",
  ],
  "3-6": [
    "Led end-to-end delivery of key initiatives impacting 10K+ users",
    "Mentored 3 junior team members and conducted technical onboarding",
    "Reduced operational costs by 25% through process optimization",
    "Collaborated with stakeholders to define requirements and success metrics",
  ],
  "6+": [
    "Spearheaded strategic initiatives generating $500K+ in annual value",
    "Built and managed a team of 8, driving 40% improvement in productivity",
    "Architected scalable systems handling 1M+ monthly transactions",
    "Presented data-driven insights to C-suite, influencing company roadmap",
  ],
};

const ROLE_BULLET_MAP: Record<string, string> = {
  "data-analyst": "Data Analyst",
  "data-scientist": "Data Scientist",
  "data-engineer": "Data Engineer",
  "data-architect": "Data Architect",
  "software-developer": "Software Developer",
  "software-engineer": "Software Engineer",
  "frontend-developer": "React Developer",
  "react-developer": "React Developer",
  "backend-developer": "Java Developer",
  "java-developer": "Java Developer",
  "python-developer": "Python Developer",
  "dotnet-developer": ".NET Developer",
  "fullstack-developer": "Full Stack Developer",
  "mobile-developer": "Mobile App Developer",
  "devops-engineer": "DevOps Engineer",
  "cloud-engineer": "Cloud Engineer",
  "cloud-architect": "Cloud Architect",
  "ml-engineer": "ML Engineer",
  "ai-engineer": "AI Engineer",
  "ai-researcher": "AI Researcher",
  "blockchain-developer": "Blockchain Developer",
  "game-developer": "Game Developer",
  "ar-vr-developer": "AR/VR Developer",
  "robotics-engineer": "Robotics Engineer",
  "qa-engineer": "QA Engineer",
  "security-engineer": "Cybersecurity Analyst",
  "cybersecurity-analyst": "Cybersecurity Analyst",
  "network-engineer": "Network Security Engineer",
  "systems-administrator": "Systems Administrator",
  "database-administrator": "Database Administrator",
  "sql-developer": "SQL Developer",
  "etl-developer": "ETL Developer",
  "sap-developer": "SAP Developer",
  "solutions-architect": "Cloud Architect",
  "product-manager": "Product Manager",
  "project-manager": "Project Manager",
  "business-analyst": "Business Analyst",
  "business-development": "Business Development",
  "ux-designer": "UX Designer",
  "ui-designer": "UI Designer",
  "graphic-designer": "Graphic Designer",
  "product-designer": "UI Designer",
  "web-designer": "Web Designer",
  "marketing-analyst": "Digital Marketing Specialist",
  "digital-marketer": "Digital Marketing Specialist",
  "ecommerce-specialist": "E-commerce Specialist",
  "content-writer": "Content Writer",
  "seo-specialist": "Digital Marketing Specialist",
  "social-media-manager": "Digital Media",
  "public-relations": "Public Relations",
  "sales-executive": "Sales",
  "account-manager": "Sales",
  "hr-manager": "HR Manager",
  "recruiter": "HR Specialist",
  "financial-analyst": "Financial Analyst",
  accountant: "Accountant",
  "banking-professional": "Banking",
  "investment-banker": "Financial Analyst",
  "management-consultant": "Consultant",
  "operations-manager": "Operations Manager",
  "supply-chain-analyst": "Operations Manager",
  "construction-manager": "Construction",
  "bpo-specialist": "BPO",
  "mechanical-engineer": "Mechanical Engineer",
  "electrical-engineer": "Electrical Engineer",
  "civil-engineer": "Civil Engineer",
  architect: "Architecture",
  "biomedical-engineer": "Healthcare",
  "research-scientist": "Data Scientist",
  pharmacist: "Health and Fitness",
  nurse: "Health and Fitness",
  "healthcare-professional": "Healthcare",
  teacher: "Teacher",
  chef: "Chef",
  "aviation-professional": "Aviation",
  lawyer: "Advocate",
  journalist: "Digital Media",
  "video-editor": "Arts",
  photographer: "Arts",
  "customer-success": "BPO",
  "technical-support": "IT Support Specialist",
  "technical-writer": "Content Writer",
  "scrum-master": "Project Manager",
};

function getRoleBullets(roleId: string, count: number): string[] {
  const mappedRole = ROLE_BULLET_MAP[roleId];
  if (!mappedRole) return [];
  const pool = roleBullets[mappedRole];
  if (!pool || pool.length === 0) return [];
  return pool.slice(0, count);
}

function matchRole(targetRole: string) {
  const target = targetRole.trim().toLowerCase();
  const match = ROLE_IDS.find((id) => {
    const label = rolePresets[id].label.toLowerCase();
    return target.includes(label) || label.includes(target);
  });
  return match ? rolePresets[match] : rolePresets["other"];
}

function yearRange(expLevel: ExperienceLevel): { start: string; end: string } {
  const now = new Date();
  const endYear = now.getFullYear();
  const gap = expLevel === "fresher" ? 0 : expLevel === "1-3" ? 2 : expLevel === "3-6" ? 4 : 7;
  return {
    start: `${endYear - gap}-01`,
    end: "Present",
  };
}

export function buildPreMappedResume(input: {
  fullName: string;
  targetRole: string;
  experienceLevel: ExperienceLevel;
  location?: string;
  experiences: ExperienceEntryInput[];
  projects: ProjectEntryInput[];
  templateId?: TemplateId;
}): ResumeData {
  const preset = matchRole(input.targetRole);
  const genericBullets = EXPERIENCE_BULLETS[input.experienceLevel] ?? EXPERIENCE_BULLETS["1-3"];
  const realBullets = getRoleBullets(preset.id, 6);
  const bullets = realBullets.length >= 3 ? realBullets.slice(0, genericBullets.length + 1) : genericBullets;
  const dates = yearRange(input.experienceLevel);

  const experience: ExperienceEntry[] = input.experiences
    .filter((e) => e.jobTitle.trim() || e.company.trim())
    .map((e, i) => ({
      id: `exp-${i}`,
      jobTitle: e.jobTitle || input.targetRole || preset.label,
      company: e.company || "Company",
      location: input.location || "",
      startDate: dates.start,
      endDate: dates.end,
      current: i === 0,
      bullets: [...bullets],
    }));

  if (experience.length === 0) {
    experience.push({
      id: "exp-0",
      jobTitle: input.targetRole || preset.label,
      company: "Company",
      location: input.location || "",
      startDate: dates.start,
      endDate: dates.end,
      current: true,
      bullets: [...bullets],
    });
  }

  const projects: ProjectEntry[] = input.projects
    .filter((p) => p.title.trim())
    .map((p, i) => ({
      id: `proj-${i}`,
      title: p.title,
      description: p.oneLiner || preset.suggestedProjects[i % preset.suggestedProjects.length]?.oneLiner || "",
    }));

  if (projects.length === 0 && preset.suggestedProjects.length > 0) {
    projects.push({
      id: "proj-0",
      title: preset.suggestedProjects[0].title,
      description: preset.suggestedProjects[0].oneLiner,
    });
  }

  const nameParts = input.fullName.trim().split(/\s+/);
  const emailName = nameParts.join(".").toLowerCase();

  return {
    templateId: input.templateId ?? "classic",
    personal: {
      fullName: input.fullName || "Your Name",
      email: `${emailName || "your.name"}@email.com`,
      phone: "+91 98XXX XXXXX",
      location: input.location || "India",
      linkedin: `linkedin.com/in/${emailName || "yourname"}`,
      website: "",
      title: input.targetRole || preset.label,
    },
    summary: preset.summaryTemplate,
    experience,
    education: [
      {
        id: "edu-0",
        school: "University",
        degree: "Bachelor's Degree",
        field: "Relevant Field",
        startDate: `${new Date().getFullYear() - 4}-08`,
        endDate: `${new Date().getFullYear()}-05`,
        gpa: "",
      },
    ],
    skills: [...preset.skills],
    certifications: [],
    projects,
  };
}
