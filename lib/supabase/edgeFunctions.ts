/**
 * Server-side only. Call Supabase Edge Functions for limit enforcement.
 * Do not expose CONFIRM_GENERATION_SECRET to the client.
 */

function getFunctionsUrl(): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()?.replace(/\/$/, "");
  if (!base || base === "undefined") return "";
  return `${base}/functions/v1`;
}

export async function checkAllocate(jwt: string, model: "basic" | "premium"): Promise<{ token: string } | { error: string; code: string; message: string }> {
  const FUNCTIONS_URL = getFunctionsUrl();
  if (!FUNCTIONS_URL) {
    return { error: "UNCONFIGURED", code: "UNCONFIGURED", message: "Supabase URL not configured" };
  }
  const res = await fetch(`${FUNCTIONS_URL}/check-allocate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      error: data.error ?? "UNKNOWN",
      code: data.code ?? "UNKNOWN",
      message: data.message ?? "Check allocate failed",
    };
  }
  return { token: data.token };
}

export async function validateToken(jwt: string, token: string): Promise<{ ok: boolean; model?: string } | { error: string }> {
  const FUNCTIONS_URL = getFunctionsUrl();
  if (!FUNCTIONS_URL) return { error: "INVALID_TOKEN" };
  const res = await fetch(`${FUNCTIONS_URL}/validate-token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error ?? "INVALID_TOKEN" };
  return { ok: true, model: data.model };
}

export async function confirmGeneration(
  token: string,
  opts: { success: boolean; tokens_used?: number; api_cost_paise?: number }
): Promise<void> {
  const secret = process.env.CONFIRM_GENERATION_SECRET;
  if (!secret) return;
  const FUNCTIONS_URL = getFunctionsUrl();
  if (!FUNCTIONS_URL) return;
  await fetch(`${FUNCTIONS_URL}/confirm-generation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-confirm-secret": secret,
    },
    body: JSON.stringify({
      token,
      success: opts.success,
      tokens_used: opts.tokens_used ?? 0,
      api_cost_paise: opts.api_cost_paise ?? 0,
    }),
  });
}

/** User limits from get-limits Edge Function. Returns null on failure. */
export async function getLimits(jwt: string): Promise<{
  free_generations_used: number;
  free_generations_remaining: number;
  free_limit: number;
  premium_generations_remaining: number;
  premium_unlocked: boolean;
  wallet_balance_paise: number;
  wallet_balance_rupees: string;
} | null> {
  const FUNCTIONS_URL = getFunctionsUrl();
  if (!FUNCTIONS_URL) return null;
  const res = await fetch(`${FUNCTIONS_URL}/get-limits`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data || typeof data !== "object") return null;
  if (
    typeof data.free_generations_remaining === "number" &&
    typeof data.free_generations_used === "number"
  ) {
    return {
      free_generations_used: data.free_generations_used ?? 0,
      free_generations_remaining: data.free_generations_remaining ?? 0,
      free_limit: data.free_limit ?? 2,
      premium_generations_remaining: data.premium_generations_remaining ?? 0,
      premium_unlocked: !!data.premium_unlocked,
      wallet_balance_paise: data.wallet_balance_paise ?? 0,
      wallet_balance_rupees: data.wallet_balance_rupees ?? "0",
    };
  }
  return null;
}
