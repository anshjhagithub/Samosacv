"use client";

import type { ResumeData, TemplateId } from "@/types/resume";
import { ClassicResume } from "./templates/ClassicResume";
import { ModernResume } from "./templates/ModernResume";
import { MinimalResume } from "./templates/MinimalResume";
import { ProfessionalResume } from "./templates/ProfessionalResume";
import { ExecutiveResume } from "./templates/ExecutiveResume";
import { ThemedResume } from "./templates/ThemedResume";
import { RESUME_THEMES } from "./templates/themes";

export function ResumePreview({ data }: { data: ResumeData }) {
  const id = data.templateId;
  if (id === "classic") return <ClassicResume data={data} />;
  if (id === "modern") return <ModernResume data={data} />;
  if (id === "minimal") return <MinimalResume data={data} />;
  if (id === "professional") return <ProfessionalResume data={data} />;
  if (id === "executive") return <ExecutiveResume data={data} />;
  const theme = RESUME_THEMES[id];
  if (theme) return <ThemedResume data={data} theme={theme} />;
  return <ClassicResume data={data} />;
}

export const TEMPLATE_LABELS: Record<TemplateId, string> = {
  classic: "Classic",
  modern: "Modern",
  minimal: "Minimal",
  professional: "Professional",
  executive: "Executive",
  creative: "Creative",
  compact: "Compact",
  elegant: "Elegant",
  tech: "Tech",
  academic: "Academic",
  simple: "Simple",
  bold: "Bold",
  clean: "Clean",
  contemporary: "Contemporary",
  twoColumn: "Two Column",
  serif: "Serif",
  minimalist: "Minimalist",
  ivyLeague: "Ivy League",
  singleColumn: "Single Column",
  doubleColumn: "Double Column",
  slate: "Slate",
  coral: "Coral",
  forest: "Forest",
  navy: "Navy",
  mint: "Mint",
  warm: "Warm",
  cool: "Cool",
  crisp: "Crisp",
  refined: "Refined",
  standout: "Standout",
  corporate: "Corporate",
  startup: "Startup",
  creativePro: "Creative Pro",
  minimalPro: "Minimal Pro",
  euro: "Euro",
  americano: "Americano",
};
