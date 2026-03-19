import { createClient } from "@supabase/supabase-js";

// This client is for server-side use with service role key.
// We use fallback values to prevent build-time errors when env vars are missing.
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder";

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
