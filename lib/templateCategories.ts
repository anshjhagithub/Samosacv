import type { TemplateId } from "@/types/resume";
import { TEMPLATE_IDS } from "@/types/resume";

export type TemplateCategory = "all" | "tech" | "executive" | "creative" | "minimalist";

export const TEMPLATE_CATEGORIES: { id: TemplateCategory; label: string }[] = [
  { id: "all", label: "All Templates" },
  { id: "tech", label: "Tech & Engineering" },
  { id: "executive", label: "Executive" },
  { id: "creative", label: "Creative" },
  { id: "minimalist", label: "Minimalist" },
];

const CATEGORY_MAP: Record<Exclude<TemplateCategory, "all">, TemplateId[]> = {
  tech: [
    "modern", "tech", "twoColumn", "doubleColumn", "startup", "clean", "crisp", "compact", "minimalPro",
  ],
  executive: [
    "classic", "professional", "executive", "corporate", "refined", "serif", "ivyLeague", "euro", "americano", "navy",
  ],
  creative: [
    "creative", "creativePro", "standout", "coral", "forest", "warm", "cool", "mint", "slate",
  ],
  minimalist: [
    "minimal", "minimalist", "singleColumn", "contemporary", "bold", "simple", "elegant", "academic",
  ],
};

export function getTemplateIdsForCategory(cat: TemplateCategory): TemplateId[] {
  if (cat === "all") return [...TEMPLATE_IDS];
  return CATEGORY_MAP[cat] ?? [];
}

function ensureAllIds(): void {
  const assigned = new Set<TemplateId>();
  (["tech", "executive", "creative", "minimalist"] as const).forEach((cat) => {
    CATEGORY_MAP[cat].forEach((id) => assigned.add(id));
  });
  const left = TEMPLATE_IDS.filter((id) => !assigned.has(id));
  if (left.length) CATEGORY_MAP.minimalist.push(...left);
}

ensureAllIds();

export const TEMPLATE_DISPLAY: Record<TemplateId, { name: string; subtitle: string; badge?: string }> = {
  classic: { name: "Classic", subtitle: "Traditional, recruiter-approved", badge: "Popular" },
  modern: { name: "Modern", subtitle: "Clean lines, contemporary feel", badge: "Popular" },
  minimal: { name: "Minimal", subtitle: "Less is more" },
  professional: { name: "Professional", subtitle: "Polished corporate look" },
  executive: { name: "Executive", subtitle: "C-suite ready" },
  creative: { name: "Creative", subtitle: "Stand out visually" },
  compact: { name: "Compact", subtitle: "Maximum info, minimum space" },
  elegant: { name: "Elegant", subtitle: "Refined typography" },
  tech: { name: "Tech", subtitle: "Built for engineers" },
  academic: { name: "Academic", subtitle: "Research & education" },
  simple: { name: "Simple", subtitle: "Distraction-free" },
  bold: { name: "Bold", subtitle: "Strong visual impact" },
  clean: { name: "Clean", subtitle: "Crisp and organized" },
  contemporary: { name: "Contemporary", subtitle: "Fresh modern layout" },
  twoColumn: { name: "Two Column", subtitle: "Side-by-side layout" },
  serif: { name: "Serif", subtitle: "Classic serif typography" },
  minimalist: { name: "Minimalist", subtitle: "Ultra-clean design" },
  ivyLeague: { name: "Ivy League", subtitle: "Academic prestige" },
  singleColumn: { name: "Single Column", subtitle: "Streamlined flow" },
  doubleColumn: { name: "Double Column", subtitle: "Balanced two-panel" },
  slate: { name: "Slate", subtitle: "Cool gray tones" },
  coral: { name: "Coral", subtitle: "Warm accent colors" },
  forest: { name: "Forest", subtitle: "Nature-inspired palette" },
  navy: { name: "Navy", subtitle: "Professional navy theme" },
  mint: { name: "Mint", subtitle: "Fresh green accents" },
  warm: { name: "Warm", subtitle: "Warm earth tones" },
  cool: { name: "Cool", subtitle: "Cool blue palette" },
  crisp: { name: "Crisp", subtitle: "Sharp and defined" },
  refined: { name: "Refined", subtitle: "Sophisticated details" },
  standout: { name: "Standout", subtitle: "Eye-catching design" },
  corporate: { name: "Corporate", subtitle: "Enterprise-ready" },
  startup: { name: "Startup", subtitle: "Dynamic tech vibe" },
  creativePro: { name: "Creative Pro", subtitle: "Professional creativity" },
  minimalPro: { name: "Minimal Pro", subtitle: "Premium minimalism" },
  euro: { name: "Euro", subtitle: "European CV format" },
  americano: { name: "Americano", subtitle: "US-style resume" },
};
