import { NextResponse } from "next/server";
import { getLimits } from "@/lib/supabase/edgeFunctions";
import type { UserLimitsData } from "@/lib/types/limits";

/** Default limits when Edge Function is not deployed or fails (no error shown to user). */
const DEFAULT_LIMITS: UserLimitsData = {
  free_generations_used: 0,
  free_generations_remaining: 2,
  free_limit: 2,
  premium_generations_remaining: 0,
  premium_unlocked: false,
  wallet_balance_paise: 0,
  wallet_balance_rupees: "0",
};

/**
 * GET /api/limits — returns user limits.
 * Proxies to Supabase Edge Function get-limits; on failure returns default limits
 * so the client never sees "Failed to send a request to the Edge Function".
 */
export async function GET(request: Request) {
  const auth = request.headers.get("Authorization");
  const jwt = auth?.replace(/Bearer\s+/i, "").trim();
  if (!jwt) {
    return NextResponse.json(DEFAULT_LIMITS);
  }

  try {
    const limits = await getLimits(jwt);
    if (limits) {
      return NextResponse.json(limits);
    }
  } catch (e) {
    console.error("Limits proxy error:", e);
  }
  return NextResponse.json(DEFAULT_LIMITS);
}
