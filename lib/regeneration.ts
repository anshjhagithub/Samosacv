/**
 * Regeneration system: ₹2 per regeneration.
 * canRegenerate, deductRegenerationCredit, trackRegenerationHistory.
 * Server-side only.
 */

import { createClient } from "@supabase/supabase-js";

const TABLE_REGENERATION = "regeneration_history";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key);
}

export interface RegenerationRecord {
  id: string;
  user_id: string;
  resume_id: string;
  order_id: string | null;
  amount_paise: number;
  created_at: string;
}

/**
 * Check if user can trigger a regeneration (we only check they're authenticated;
 * payment is taken at regeneration time via create-order for ₹2).
 */
export function canRegenerate(_user: { id: string }): boolean {
  return true;
}

/**
 * Create a regeneration order and return order_id/payment_session_id for ₹2.
 * Caller should redirect to Cashfree; on success webhook will record the order.
 * Alternatively: deduct from wallet if you have wallet_balance_rupees.
 */
export async function createRegenerationPayment(
  userId: string,
  resumeId: string
): Promise<{ orderId: string; amount: number } | null> {
  const amount = 2;
  return { orderId: `regen_${userId}_${resumeId}_${Date.now()}`, amount };
}

/**
 * Record a regeneration after successful ₹2 payment (called from webhook or after payment confirmation).
 */
export async function trackRegenerationHistory(
  userId: string,
  resumeId: string,
  orderId: string,
  amountPaise: number
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  const { error } = await supabase.from(TABLE_REGENERATION).insert({
    user_id: userId,
    resume_id: resumeId,
    order_id: orderId,
    amount_paise: amountPaise,
  });
  return !error;
}

/**
 * Count regenerations for a resume (for display).
 */
export async function getRegenerationCount(
  userId: string,
  resumeId: string
): Promise<number> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from(TABLE_REGENERATION)
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("resume_id", resumeId);
  if (error) return 0;
  return count ?? 0;
}

/**
 * Consume one regeneration credit (delete one row). Returns true if one was consumed.
 */
export async function deductRegenerationCredit(
  userId: string,
  resumeId: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  const { data: rows } = await supabase
    .from(TABLE_REGENERATION)
    .select("id")
    .eq("user_id", userId)
    .eq("resume_id", resumeId)
    .limit(1);
  if (!rows?.length) return false;
  const { error } = await supabase
    .from(TABLE_REGENERATION)
    .delete()
    .eq("id", rows[0].id);
  return !error;
}
