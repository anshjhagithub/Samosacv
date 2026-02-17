declare const Deno: { serve: (handler: (req: Request) => Promise<Response>) => void };

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

    const body = await req.json().catch(() => ({}));
    const token = body.token as string;
    if (!token) {
      return new Response(
        JSON.stringify({ error: "BAD_REQUEST", message: "token required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createAdminClient();
    const { data: row, error } = await supabase
      .from("generation_tokens")
      .select("id, user_id, model")
      .eq("token", token)
      .is("used_at", null)
      .single();

    if (error || !row || row.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "INVALID_TOKEN", message: "Token invalid or already used" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, model: row.model }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "INTERNAL", message: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
