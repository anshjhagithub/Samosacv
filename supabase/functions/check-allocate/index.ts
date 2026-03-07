import { createAdminClient, getAuthUser } from "../_shared/supabaseAdmin.ts";

const PREMIUM_PACK_GENERATIONS = 5;
const PREMIUM_PAY_RESERVE_PAISE = 1500; // ₹15

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const user = await getAuthUser(req);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "UNAUTHORIZED", message: "Valid JWT required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const model = (body.model as string) === "premium" ? "premium" : "basic";

    const supabase = createAdminClient();

    const { data: limits, error: limitsError } = await supabase
      .from("user_limits")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (limitsError && limitsError.code !== "PGRST116") {
      return new Response(
        JSON.stringify({ error: "DB_ERROR", message: limitsError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const premiumRemaining = limits?.premium_generations_remaining ?? 0;
    const walletPaise = limits?.wallet_balance_paise ?? 0;

    let allocationType: "premium_pack" | "premium_pay_per_use";

    if (premiumRemaining > 0) {
      allocationType = "premium_pack";
      const { error: deductError } = await supabase
        .from("user_limits")
        .update({
          premium_generations_remaining: premiumRemaining - 1,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (deductError) {
        return new Response(
          JSON.stringify({ error: "DB_ERROR", message: deductError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else if (walletPaise >= PREMIUM_PAY_RESERVE_PAISE) {
      allocationType = "premium_pay_per_use";
      const { error: deductError } = await supabase
        .from("user_limits")
        .update({
          wallet_balance_paise: walletPaise - PREMIUM_PAY_RESERVE_PAISE,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (deductError) {
        return new Response(
          JSON.stringify({
            error: "PAYMENT_REQUIRED",
            message: "Insufficient wallet balance.",
            code: "INSUFFICIENT_FUNDS",
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      const code = limits?.premium_unlocked_at ? "INSUFFICIENT_FUNDS" : "PREMIUM_LOCKED";
      return new Response(
        JSON.stringify({
          error: "PAYMENT_REQUIRED",
          message: code === "PREMIUM_LOCKED"
            ? "Pay ₹15 per AI resume or unlock the ₹49 pack for 5 generations."
            : "Insufficient wallet balance (₹15 per generation).",
          code,
        }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: tokenRow, error: tokenError } = await supabase
      .from("generation_tokens")
      .insert({ user_id: user.id, model, allocation_type: allocationType })
      .select("token")
      .single();

    if (tokenError || !tokenRow) {
      return new Response(
        JSON.stringify({ error: "DB_ERROR", message: tokenError?.message ?? "Failed to create token" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ token: tokenRow.token }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "INTERNAL", message: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
