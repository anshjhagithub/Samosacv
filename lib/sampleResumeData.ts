import type { ResumeData } from "@/types/resume";
import { createEmptyExperience, createEmptyEducation, createEmptyProject } from "@/types/resume";

/**
 * Minimal sample resume data for template picker previews.
 * Used so every template renders with the same content for a consistent grid.
 */
export function getSampleResumeData(templateId: ResumeData["templateId"]): ResumeData {
  return {
    templateId,
    personal: {
      fullName: "Alex Morgan",
      email: "alex@example.com",
      phone: "+1 555 000 0000",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/alex",
      website: "alex.dev",
      title: "Data Analyst",
    },
    summary: "Detail-oriented Data Analyst with experience turning complex datasets into actionable insights.",
    experience: [
      {
        ...createEmptyExperience("sample-exp-1"),
        jobTitle: "Senior Data Analyst",
        company: "Tech Corp",
        startDate: "2020",
        endDate: "Present",
        bullets: ["Led analytics for product team", "Built dashboards used by 50+ stakeholders"],
      },
    ],
    education: [
      {
        ...createEmptyEducation("sample-edu-1"),
        school: "State University",
        degree: "B.S. Statistics",
        field: "Data Science",
        startDate: "2016",
        endDate: "2020",
      },
    ],
    skills: ["Python", "SQL", "Power BI", "Excel"],
    certifications: [],
    projects: [
      {
        ...createEmptyProject("sample-proj-1"),
        title: "Forecasting Model",
        description: "Built time-series model to reduce inventory costs by 15%.",
      },
    ],
  };
}
