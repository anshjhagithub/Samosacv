import { createAdminClient } from "../_shared/supabaseAdmin.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-confirm-secret",
};

const PREMIUM_PAY_RESERVE_PAISE = 1500;
const PREMIUM_PLATFORM_FEE_PAISE = 500; // ₹5

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const secret = req.headers.get("x-confirm-secret");
  if (secret !== Deno.env.get("CONFIRM_GENERATION_SECRET")) {
    return new Response(
      JSON.stringify({ error: "FORBIDDEN", message: "Invalid secret" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const token = body.token as string;
    const success = body.success !== false;
    const tokensUsed = Math.max(0, Number(body.tokens_used) || 0);
    const apiCostPaise = Math.max(0, Number(body.api_cost_paise) || 0);

    if (!token) {
      return new Response(
        JSON.stringify({ error: "BAD_REQUEST", message: "token required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createAdminClient();
    const { data: tokenRow, error: tokenErr } = await supabase
      .from("generation_tokens")
      .select("id, user_id, model, allocation_type")
      .eq("token", token)
      .single();

    if (tokenErr || !tokenRow) {
      return new Response(
        JSON.stringify({ error: "INVALID_TOKEN", message: "Token not found" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (tokenRow.used_at) {
      return new Response(
        JSON.stringify({ error: "INVALID_TOKEN", message: "Token already used" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const platformFeePaise = tokenRow.model === "premium" && tokenRow.allocation_type === "premium_pay_per_use"
      ? PREMIUM_PLATFORM_FEE_PAISE
      : 0;
    const totalCostPaise = platformFeePaise + apiCostPaise;

    if (!success) {
      // Refund
      if (tokenRow.allocation_type === "free") {
        const { data: lim } = await supabase.from("user_limits").select("free_generations_used").eq("user_id", tokenRow.user_id).single();
        if (lim)
          await supabase.from("user_limits").update({ free_generations_used: Math.max(0, (lim.free_generations_used ?? 1) - 1), updated_at: new Date().toISOString() }).eq("user_id", tokenRow.user_id);
      } else if (tokenRow.allocation_type === "premium_pack") {
        const { data: lim } = await supabase.from("user_limits").select("premium_generations_remaining").eq("user_id", tokenRow.user_id).single();
        if (lim)
          await supabase.from("user_limits").update({ premium_generations_remaining: (lim.premium_generations_remaining ?? 0) + 1, updated_at: new Date().toISOString() }).eq("user_id", tokenRow.user_id);
      } else if (tokenRow.allocation_type === "premium_pay_per_use") {
        const { data: lim } = await supabase.from("user_limits").select("wallet_balance_paise").eq("user_id", tokenRow.user_id).single();
        if (lim)
          await supabase.from("user_limits").update({ wallet_balance_paise: (lim.wallet_balance_paise ?? 0) + PREMIUM_PAY_RESERVE_PAISE, updated_at: new Date().toISOString() }).eq("user_id", tokenRow.user_id);
      }
    } else {
      // Premium pay-per-use: refund reserve and deduct actual (platform_fee + api_cost)
      if (tokenRow.allocation_type === "premium_pay_per_use") {
        const refund = PREMIUM_PAY_RESERVE_PAISE - totalCostPaise;
        const { data: lim } = await supabase.from("user_limits").select("wallet_balance_paise").eq("user_id", tokenRow.user_id).single();
        if (lim)
          await supabase.from("user_limits").update({ wallet_balance_paise: Math.max(0, (lim.wallet_balance_paise ?? 0) + refund), updated_at: new Date().toISOString() }).eq("user_id", tokenRow.user_id);
      }
    }

    await supabase.from("generation_tokens").update({ used_at: new Date().toISOString() }).eq("id", tokenRow.id);

    if (success) {
      await supabase.from("audit_generations").insert({
        user_id: tokenRow.user_id,
        generation_token_id: tokenRow.id,
        model: tokenRow.model,
        free_or_paid: tokenRow.allocation_type,
        tokens_used: tokensUsed,
        api_cost_paise: apiCostPaise,
        platform_fee_paise: platformFeePaise,
        total_cost_paise: totalCostPaise,
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        audit: success
          ? { tokens_used: tokensUsed, api_cost_paise: apiCostPaise, platform_fee_paise: platformFeePaise, total_cost_paise: totalCostPaise, free_or_paid: tokenRow.allocation_type }
          : null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "INTERNAL", message: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
