/**
 * generate_resume — validates that a user has paid for resume_pdf,
 * then allocates a generation token.
 *
 * Replaces the old 2-free-generations logic.
 * Called by: /api/allocate proxy (which calls check-allocate instead).
 * This function is kept for backward compatibility or direct invocation.
 *
 * Request body: { user_id: string, model?: "basic" | "premium" }
 * Response:     { token: string } or { error: string, code: string }
 */
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

const PREMIUM_PAY_RESERVE_PAISE = 1500; // ₹15

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function getSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

async function getAuthUser(
  req: Request
): Promise<{ id: string } | null> {
  const jwt = req.headers
    .get("Authorization")
    ?.replace(/^Bearer\s+/i, "");
  if (!jwt) return null;
  const supabase = getSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(jwt);
  if (error || !user) return null;
  return { id: user.id };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth — prefer JWT from header; fall back to user_id in body (legacy)
    const user = await getAuthUser(req);
    const body = await req.json().catch(() => ({}));
    const userId = user?.id ?? (body.user_id as string | undefined);

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "UNAUTHORIZED", code: "UNAUTHORIZED" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const model = (body.model as string) === "premium" ? "premium" : "basic";
    const supabase = getSupabase();

    // ── Check if user has a paid order that includes resume_pdf ──
    const { data: paidOrders } = await supabase
      .from("orders")
      .select("order_id, line_items")
      .eq("user_id", userId)
      .eq("status", "paid")
      .not("line_items", "is", null);

    const hasPaidResume = (paidOrders ?? []).some((row: { line_items: Record<string, boolean> | null }) => {
      return row.line_items?.resume_pdf === true;
    });

    // ── Check user_limits for pack / wallet balance ──
    const { data: limits, error: limitsError } = await supabase
      .from("user_limits")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (limitsError && limitsError.code !== "PGRST116") {
      return new Response(
        JSON.stringify({ error: "DB_ERROR", code: "DB_ERROR", message: limitsError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const premiumRemaining = limits?.premium_generations_remaining ?? 0;
    const walletPaise = limits?.wallet_balance_paise ?? 0;

    let allocationType: "premium_pack" | "premium_pay_per_use" | "order_paid";

    // Priority 1: User already paid for this resume via cart checkout
    if (hasPaidResume) {
      allocationType = "order_paid";
      // No deduction needed — they paid through /api/create-order → Cashfree
    }
    // Priority 2: Premium pack credits
    else if (premiumRemaining > 0) {
      allocationType = "premium_pack";
      const { error: deductError } = await supabase
        .from("user_limits")
        .update({
          premium_generations_remaining: premiumRemaining - 1,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (deductError) {
        return new Response(
          JSON.stringify({ error: "DB_ERROR", code: "DB_ERROR", message: deductError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    // Priority 3: Wallet pay-per-use (₹15)
    else if (walletPaise >= PREMIUM_PAY_RESERVE_PAISE) {
      allocationType = "premium_pay_per_use";
      const { error: deductError } = await supabase
        .from("user_limits")
        .update({
          wallet_balance_paise: walletPaise - PREMIUM_PAY_RESERVE_PAISE,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (deductError) {
        return new Response(
          JSON.stringify({
            error: "PAYMENT_REQUIRED",
            code: "INSUFFICIENT_FUNDS",
            message: "Insufficient wallet balance.",
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    // No payment method available
    else {
      return new Response(
        JSON.stringify({
          error: "PAYMENT_REQUIRED",
          code: "PAYMENT_REQUIRED",
          message:
            "Pay ₹15 per AI resume or unlock the ₹49 pack for 5 generations.",
        }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Create one-time generation token ──
    const tokenAllocType =
      allocationType === "order_paid"
        ? "premium_pay_per_use"
        : allocationType;

    const { data: tokenRow, error: tokenError } = await supabase
      .from("generation_tokens")
      .insert({
        user_id: userId,
        model,
        allocation_type: tokenAllocType,
      })
      .select("token")
      .single();

    if (tokenError || !tokenRow) {
      return new Response(
        JSON.stringify({
          error: "DB_ERROR",
          code: "DB_ERROR",
          message: tokenError?.message ?? "Failed to create token",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        token: tokenRow.token,
        allocation_type: allocationType,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "INTERNAL", code: "INTERNAL", message: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
