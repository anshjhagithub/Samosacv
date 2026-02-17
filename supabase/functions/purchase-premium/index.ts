import { createAdminClient, getAuthUser } from "../_shared/supabaseAdmin.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-purchase-secret",
};

const PREMIUM_PACK_AMOUNT_PAISE = 4900; // ₹49
const PREMIUM_PACK_GENERATIONS = 6;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const secret = req.headers.get("x-purchase-secret");
  const isServer = secret === Deno.env.get("PURCHASE_WEBHOOK_SECRET");

  try {
    const body = await req.json().catch(() => ({}));
    let userId: string;
    if (isServer) {
      userId = body.user_id as string;
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "BAD_REQUEST", message: "user_id required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      const user = await getAuthUser(req);
      if (!user) {
        return new Response(
          JSON.stringify({ error: "UNAUTHORIZED", message: "Valid JWT required" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      userId = user.id;
    }
    const type = (body.type as string) || "premium_pack";
    if (type !== "premium_pack" && type !== "wallet_topup") {
      return new Response(
        JSON.stringify({ error: "BAD_REQUEST", message: "type must be premium_pack or wallet_topup" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createAdminClient();

    if (type === "premium_pack") {
      const { data: limits } = await supabase.from("user_limits").select("premium_generations_remaining, premium_unlocked_at").eq("user_id", userId).single();
      await supabase.from("user_limits").upsert(
        {
          user_id: userId,
          premium_generations_remaining: (limits?.premium_generations_remaining ?? 0) + PREMIUM_PACK_GENERATIONS,
          premium_unlocked_at: limits?.premium_unlocked_at ?? new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
      await supabase.from("payments").insert({
        user_id: userId,
        amount_paise: PREMIUM_PACK_AMOUNT_PAISE,
        type: "premium_pack",
        premium_generations_added: PREMIUM_PACK_GENERATIONS,
        external_id: body.external_id ?? null,
      });
      return new Response(
        JSON.stringify({
          ok: true,
          premium_generations_added: PREMIUM_PACK_GENERATIONS,
          message: "₹49 pack applied. You have 6 premium generations.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // wallet_topup
    const amountPaise = Math.max(0, Number(body.amount_paise) || 0);
    if (amountPaise <= 0) {
      return new Response(
        JSON.stringify({ error: "BAD_REQUEST", message: "amount_paise required and > 0" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const { data: lim } = await supabase.from("user_limits").select("wallet_balance_paise").eq("user_id", userId).single();
    const newBalance = (lim?.wallet_balance_paise ?? 0) + amountPaise;
    await supabase.from("user_limits").upsert(
      { user_id: userId, wallet_balance_paise: newBalance, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
    await supabase.from("payments").insert({
      user_id: userId,
      amount_paise: amountPaise,
      type: "wallet_topup",
      wallet_balance_added_paise: amountPaise,
      external_id: body.external_id ?? null,
    });
    return new Response(
      JSON.stringify({ ok: true, wallet_balance_paise: newBalance, amount_added_paise: amountPaise }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "INTERNAL", message: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
