/**
 * Placement Performance Engine: bundle discounts and line items for unlock page.
 */

import { FEATURE_PRICING, PLACEMENT_MODULE_SLUGS, type FeatureSlug } from "./pricing";

const BASE_PRICE = FEATURE_PRICING.resume_pdf;
const ATS_RECRUITER_DISCOUNT = 2;
const ALL_BUNDLE_PRICE = 29;
const ALL_BUNDLE_SAVE = 11;

export type UnlockCartState = Partial<Record<FeatureSlug, boolean>> & { resume_pdf?: boolean };

export function getPlacementModuleTotal(cart: UnlockCartState): number {
  let sum = 0;
  for (const slug of PLACEMENT_MODULE_SLUGS) {
    if (cart[slug]) sum += FEATURE_PRICING[slug];
  }
  return sum;
}

export function getUnlockTotal(cart: UnlockCartState): {
  total: number;
  bundleApplied: "all" | "ats_recruiter" | null;
  savings: number;
} {
  const base = cart.resume_pdf !== false ? BASE_PRICE : 0;
  const ats = !!cart.ats_domination;
  const recruiter = !!cart.recruiter_test;
  const salary = !!cart.salary_boost;
  const bullet = !!cart.elite_bullet;
  const interview = !!cart.interview_weapon;
  const moduleCount = [ats, recruiter, salary, bullet, interview].filter(Boolean).length;

  let moduleTotal = 0;
  if (ats) moduleTotal += FEATURE_PRICING.ats_domination;
  if (recruiter) moduleTotal += FEATURE_PRICING.recruiter_test;
  if (salary) moduleTotal += FEATURE_PRICING.salary_boost;
  if (bullet) moduleTotal += FEATURE_PRICING.elite_bullet;
  if (interview) moduleTotal += FEATURE_PRICING.interview_weapon;

  if (moduleCount === 5) {
    return {
      total: base + ALL_BUNDLE_PRICE,
      bundleApplied: "all",
      savings: ALL_BUNDLE_SAVE,
    };
  }

  let discount = 0;
  if (ats && recruiter) discount = ATS_RECRUITER_DISCOUNT;

  return {
    total: base + moduleTotal - discount,
    bundleApplied: ats && recruiter ? "ats_recruiter" : null,
    savings: discount,
  };
}

export function getLineItemsForUnlockOrder(cart: UnlockCartState): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  if (cart.resume_pdf !== false) out.resume_pdf = true;
  for (const slug of PLACEMENT_MODULE_SLUGS) {
    if (cart[slug]) out[slug] = true;
  }
  return out;
}

export { PLACEMENT_MODULE_SLUGS, FEATURE_PRICING };
