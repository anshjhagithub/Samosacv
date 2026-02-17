/**
 * Client-only: get a generation token from the Edge Function for the current user.
 * Requires Supabase session. Use before calling /api/resume/extract when limits are enforced.
 */
import { createClient } from "@/lib/supabase/client";

const FUNCTIONS_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")) +
  "/functions/v1";

export type AllocateResult =
  | { token: string; jwt: string }
  | { error: string; code: "UNAUTHORIZED" }
  | { error: string; code: "PAYMENT_REQUIRED" }
  | { error: string; code: string };

export async function getGenerationToken(model: "basic" | "premium" = "basic"): Promise<AllocateResult> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    return { error: "Please sign in to generate a resume.", code: "UNAUTHORIZED" };
  }
  const res = await fetch(`${FUNCTIONS_URL}/check-allocate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 402) {
    return {
      error: data.error ?? "You've used your free generations. Purchase more to continue.",
      code: "PAYMENT_REQUIRED",
    };
  }
  if (!res.ok) {
    return {
      error: data.error ?? "Could not start generation",
      code: data.code ?? "UNKNOWN",
    };
  }
  if (!data.token) {
    return { error: "No token returned", code: "UNKNOWN" };
  }
  return { token: data.token, jwt: session.access_token };
}
