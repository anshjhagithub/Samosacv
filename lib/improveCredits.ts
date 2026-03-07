/**
 * Builder improve credits: ₹1 per summary/project improvement.
 * Server-side only.
 */

import { createClient } from "@supabase/supabase-js";

const TABLE = "improve_credits";
export type ImproveFeatureType = "summary_improve" | "project_improve";

const UNLIMITED_EMAIL = "anshjha8463@gmail.com";

export function hasUnlimitedImproves(email: string | undefined): boolean {
  return email?.toLowerCase() === UNLIMITED_EMAIL;
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key);
}

/** Count unconsumed credits for a user and feature type. */
export async function getImproveCreditsCount(
  userId: string,
  featureType: ImproveFeatureType
): Promise<number> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("feature_type", featureType)
    .is("consumed_at", null);
  if (error) return 0;
  return count ?? 0;
}

/** Count consumed (used) credits per feature type for a user. */
export async function getImproveUsageCount(
  userId: string
): Promise<{ summary_improve: number; project_improve: number; total: number }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { summary_improve: 0, project_improve: 0, total: 0 };
  const { count: summary } = await supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("feature_type", "summary_improve")
    .not("consumed_at", "is", null);
  const { count: project } = await supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("feature_type", "project_improve")
    .not("consumed_at", "is", null);
  const summary_improve = summary ?? 0;
  const project_improve = project ?? 0;
  return { summary_improve, project_improve, total: summary_improve + project_improve };
}

/** Consume one credit. Returns true if one was consumed. */
export async function consumeImproveCredit(
  userId: string,
  featureType: ImproveFeatureType
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  const { data: rows } = await supabase
    .from(TABLE)
    .select("id")
    .eq("user_id", userId)
    .eq("feature_type", featureType)
    .is("consumed_at", null)
    .limit(1);
  if (!rows?.length) return false;
  const { error } = await supabase
    .from(TABLE)
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", rows[0].id);
  return !error;
}
