import { createAdminClient, getAuthUser } from "../_shared/supabaseAdmin.ts";

const corsHeaders = {
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

    const supabase = createAdminClient();
    const { data: limits } = await supabase
      .from("user_limits")
      .select("premium_generations_remaining, wallet_balance_paise, premium_unlocked_at")
      .eq("user_id", user.id)
      .single();

    const premiumRemaining = limits?.premium_generations_remaining ?? 0;
    const walletPaise = limits?.wallet_balance_paise ?? 0;

    return new Response(
      JSON.stringify({
        premium_generations_remaining: premiumRemaining,
        premium_unlocked: !!limits?.premium_unlocked_at,
        wallet_balance_paise: walletPaise,
        wallet_balance_rupees: (walletPaise / 100).toFixed(2),
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
