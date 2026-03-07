/**
 * Pricing (₹). Main product (resume_pdf) is ₹15; microservice / add-on prices unchanged.
 */

export const FEATURE_PRICING = {
  resume_pdf: 15,
  ats_breakdown: 3,
  ats_improver: 5,
  skill_roadmap: 4,
  linkedin_optimizer: 3,
  cover_letter: 5,
  interview_pack: 9,
  mock_interview_live: 5,
  resume_regeneration: 2,
  summary_improve: 1,
  project_improve: 1,
  // Placement Performance Engine modules (max ₹5 each)
  ats_domination: 4,
  recruiter_test: 7,
  salary_boost: 6,
  elite_bullet: 3,
  interview_weapon: 5,
} as const;

export type FeatureSlug = keyof typeof FEATURE_PRICING;

/** Base product required to download PDF. */
export const BASE_PRODUCT: FeatureSlug = "resume_pdf";

/** Add-ons (excluding base and regeneration). */
export const ADDON_SLUGS: FeatureSlug[] = [
  "ats_breakdown",
  "ats_improver",
  "skill_roadmap",
  "linkedin_optimizer",
  "cover_letter",
  "interview_pack",
];

/** Placement Performance Engine module slugs (unlock page). */
export const PLACEMENT_MODULE_SLUGS: FeatureSlug[] = [
  "ats_domination",
  "recruiter_test",
  "salary_boost",
  "elite_bullet",
  "interview_weapon",
];

/** Post-purchase upsell. */
export const UPSELL_SLUG: FeatureSlug = "mock_interview_live";

export function getPrice(slug: FeatureSlug): number {
  return FEATURE_PRICING[slug] ?? 0;
}

export function getTotalRupees(selected: Partial<Record<FeatureSlug, boolean>>): number {
  let total = 0;
  for (const slug of Object.keys(selected) as FeatureSlug[]) {
    if (selected[slug]) total += getPrice(slug);
  }
  return total;
}
