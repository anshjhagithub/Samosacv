/**
 * Micro-transaction pricing (₹). All values in rupees.
 */

export const FEATURE_PRICING = {
  resume_pdf: 7,
  ats_breakdown: 6,
  skill_roadmap: 5,
  linkedin_optimizer: 6,
  cover_letter: 7,
  interview_pack: 9,
  mock_interview_live: 12,
  resume_regeneration: 2,
} as const;

export type FeatureSlug = keyof typeof FEATURE_PRICING;

/** Base product required to download PDF. */
export const BASE_PRODUCT: FeatureSlug = "resume_pdf";

/** Add-ons (excluding base and regeneration). */
export const ADDON_SLUGS: FeatureSlug[] = [
  "ats_breakdown",
  "skill_roadmap",
  "linkedin_optimizer",
  "cover_letter",
  "interview_pack",
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
