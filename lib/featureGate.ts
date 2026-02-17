/**
 * Feature gating: PDF download, ATS breakdown, regeneration, etc.
 * Server-side only (uses DB). Use from API routes.
 */

import type { FeatureSlug } from "./pricing";

const TABLE_ORDERS = "orders";

export type AccessMap = Partial<Record<FeatureSlug, boolean>>;

import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function checkAccess(
  userId: string,
  featureName: FeatureSlug,
  resumeId: string | null
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  const { data: rows } = await supabase
    .from(TABLE_ORDERS)
    .select("resume_id, line_items")
    .eq("user_id", userId)
    .eq("status", "paid")
    .not("line_items", "is", null);
  if (!rows?.length) return false;
  for (const row of rows as { resume_id: string | null; line_items: Record<string, boolean> | null }[]) {
    const li = row.line_items ?? {};
    if (!li[featureName]) continue;
    if (resumeId != null && row.resume_id != null && row.resume_id !== resumeId) continue;
    return true;
  }
  return false;
}

export async function getAccessMap(userId: string, resumeId: string | null): Promise<AccessMap> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return {};
  const { data: rows } = await supabase
    .from(TABLE_ORDERS)
    .select("resume_id, line_items")
    .eq("user_id", userId)
    .eq("status", "paid")
    .not("line_items", "is", null);
  const access: AccessMap = {};
  if (!rows?.length) return access;
  for (const row of rows as { resume_id: string | null; line_items: Record<string, boolean> | null }[]) {
    if (resumeId != null && row.resume_id != null && row.resume_id !== resumeId) continue;
    const li = row.line_items ?? {};
    for (const key of Object.keys(li)) {
      if (li[key]) access[key as FeatureSlug] = true;
    }
  }
  return access;
}

export async function canDownloadPdf(userId: string, resumeId: string | null): Promise<boolean> {
  return checkAccess(userId, "resume_pdf", resumeId);
}
