import { createAdminClient, getAuthUser } from "../_shared/supabaseAdmin.ts";

const FREE_LIMIT = 2;
const PREMIUM_PACK_FEE_PAISE = 4900; // ₹49
const PREMIUM_PACK_GENERATIONS = 6;
const PREMIUM_PAY_PER_USE_PLATFORM_PAISE = 500; // ₹5
const PREMIUM_PAY_RESERVE_PAISE = 1500; // Reserve ₹15 for one generation (₹5 + max API estimate)

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

    // Get or create user_limits
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

    const freeUsed = limits?.free_generations_used ?? 0;
    const premiumRemaining = limits?.premium_generations_remaining ?? 0;
    const walletPaise = limits?.wallet_balance_paise ?? 0;

    let allocationType: "free" | "premium_pack" | "premium_pay_per_use" = "free";

    if (model === "basic") {
      if (freeUsed >= FREE_LIMIT) {
        return new Response(
          JSON.stringify({
            error: "PAYMENT_REQUIRED",
            message: "You have used your 2 free generations. Payment required for more.",
            code: "FREE_LIMIT_REACHED",
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      allocationType = "free";
      const { error: updateError } = await supabase
        .from("user_limits")
        .upsert(
          {
            user_id: user.id,
            free_generations_used: freeUsed + 1,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (updateError) {
        if (updateError.code === "23514") {
          return new Response(
            JSON.stringify({ error: "PAYMENT_REQUIRED", message: "Free limit reached.", code: "FREE_LIMIT_REACHED" }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        return new Response(
          JSON.stringify({ error: "DB_ERROR", message: updateError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
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
            JSON.stringify({ error: "PAYMENT_REQUIRED", message: "Insufficient wallet balance.", code: "INSUFFICIENT_FUNDS" }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        const code = limits?.premium_unlocked_at ? "INSUFFICIENT_FUNDS" : "PREMIUM_LOCKED";
        return new Response(
          JSON.stringify({
            error: "PAYMENT_REQUIRED",
            message: code === "PREMIUM_LOCKED"
              ? "Unlock premium with ₹49 to get 6 generations, or use wallet for pay-per-use."
              : "Premium models require wallet balance (₹5 + API cost per generation).",
            code,
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
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
