import { NextResponse } from "next/server";
import { checkAllocate } from "@/lib/supabase/edgeFunctions";

/**
 * Proxies allocation to the Supabase Edge Function (check-allocate).
 * Avoids client-side CORS and "Failed to send a request to the Edge Function" by
 * calling the function from the server.
 */
export async function POST(request: Request) {
  const auth = request.headers.get("Authorization");
  const jwt = auth?.replace(/^Bearer\s+/i, "").trim();
  if (!jwt) {
    return NextResponse.json(
      { error: "Please sign in to generate a resume.", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!supabaseUrl) {
    return NextResponse.json(
      {
        error: "Generation service is not configured. Add NEXT_PUBLIC_SUPABASE_URL to your environment.",
        code: "UNCONFIGURED",
      },
      { status: 503 }
    );
  }

  let body: { model?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const model = body.model === "premium" ? "premium" : "basic";

  const enforceLimits = !!(supabaseUrl && process.env.CONFIRM_GENERATION_SECRET);

  try {
    const result = await checkAllocate(jwt, model);
    if ("token" in result && result.token) {
      return NextResponse.json({ token: result.token });
    }
    const isPaymentRequired =
      result && typeof result === "object" && "code" in result &&
      (result.code === "FREE_LIMIT_REACHED" || result.code === "PREMIUM_LOCKED" || result.code === "INSUFFICIENT_FUNDS");
    if (isPaymentRequired) {
      return NextResponse.json(
        {
          error: (result as { error?: string }).error ?? "Payment required",
          code: (result as { code?: string }).code,
          message: (result as { message?: string }).message ?? "Payment required.",
        },
        { status: 402 }
      );
    }
    // Edge Function returned 500/DB_ERROR/INTERNAL or other failure (e.g. "Failed to send a request to the Edge Function")
    const serviceErrorMsg =
      (result as { message?: string }).message ?? (result as { error?: string }).error ?? "";
    const isEdgeFunctionUnreachable =
      /failed to send|edge function|unreachable|ECONNREFUSED|ENOTFOUND|fetch failed/i.test(serviceErrorMsg);
    const isDev = process.env.NODE_ENV !== "production";
    if (!enforceLimits || (isDev && isEdgeFunctionUnreachable)) {
      return NextResponse.json({ token: "dev-bypass-no-limits" });
    }
    return NextResponse.json(
      {
        error: serviceErrorMsg || "Generation service unavailable.",
        code: "SERVICE_ERROR",
      },
      { status: 503 }
    );
  } catch (e) {
    console.error("Allocate proxy error:", e);
    const message =
      e instanceof Error ? e.message : "Generation service unavailable.";
    const isNetwork =
      /fetch|network|ECONNREFUSED|ENOTFOUND|failed to send/i.test(message);

    // When limits are not enforced, or in development when Edge Function is unreachable, return bypass token
    const isDev = process.env.NODE_ENV !== "production";
    if ((!enforceLimits && isNetwork) || (isDev && isNetwork)) {
      return NextResponse.json({
        token: "dev-bypass-no-limits",
      });
    }

    return NextResponse.json(
      {
        error: isNetwork
          ? "Cannot reach the generation service. If running locally, deploy Supabase Edge Functions (see README) or ensure your Supabase project is running."
          : message,
        code: "SERVICE_ERROR",
      },
      { status: 503 }
    );
  }
}
