/**
 * Server-side only. Call Supabase Edge Functions for limit enforcement.
 * Do not expose CONFIRM_GENERATION_SECRET to the client.
 */

const FUNCTIONS_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") + "/functions/v1";

export async function checkAllocate(jwt: string, model: "basic" | "premium"): Promise<{ token: string } | { error: string; code: string; message: string }> {
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
