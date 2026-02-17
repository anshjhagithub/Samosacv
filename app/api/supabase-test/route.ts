import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "edge";

/**
 * GET /api/supabase-test
 * Verifies Supabase configuration (env vars and project connectivity).
 * Safe to call from browser or curl.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.json(
      {
        ok: false,
        message: "Supabase not configured",
        details: {
          hasUrl: !!url,
          hasAnonKey: !!anonKey,
          hint: "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
        },
      },
      { status: 503 }
    );
  }

  try {
    const supabase = createClient(url, anonKey);
    // Test connectivity and key validity by calling a lightweight auth method
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: "Supabase connection failed",
          details: { error: error.message, code: error.code },
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Supabase is configured correctly",
      details: {
        url: url.replace(/\/$/, ""),
        hasSession: !!data?.session,
        userId: data?.session?.user?.id ?? null,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        message: "Supabase check failed",
        details: { error: message },
      },
      { status: 503 }
    );
  }
}
