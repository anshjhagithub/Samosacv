import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

export function createAdminClient() {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key);
}

export function getAuthUser(req: Request): Promise<{ id: string } | null> {
  const authHeader = req.headers.get("Authorization");
  const jwt = authHeader?.replace(/^Bearer\s+/i, "");
  if (!jwt) return Promise.resolve(null);
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(url, key);
  return supabase.auth.getUser(jwt).then(({ data: { user }, error }) => {
    if (error || !user) return null;
    return { id: user.id };
  });
}
