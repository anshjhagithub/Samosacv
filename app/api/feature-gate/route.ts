import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { checkAccess } from "@/lib/featureGate";
import type { FeatureSlug } from "@/lib/pricing";
import { getGuestUserId } from "@/lib/guestUser";

function getSupabaseAdmin() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createAdminClient(url, key);
}

export async function GET(request: Request) {
  try {
    const userId = await getGuestUserId();
    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ granted: false, error: "Server config error" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get("resumeId") || null;
    const feature = (searchParams.get("feature") || "resume_pdf") as FeatureSlug;

    const granted = await checkAccess(userId, feature, resumeId);
    
    // Also fetch any purchased add-ons for this resume if they exist
    let purchasedAddons: string[] = [];
    if (granted && resumeId) {
      const { data: orders } = await admin
        .from("orders")
        .select("line_items")
        .eq("user_id", userId)
        .eq("resume_id", resumeId)
        .eq("status", "paid");
        
      if (orders && orders.length > 0) {
        const addonSet = new Set<string>();
        orders.forEach(order => {
          if (order.line_items && typeof order.line_items === 'object') {
            Object.keys(order.line_items).forEach(k => {
              if (order.line_items[k] === true && k !== 'resume_pdf' && k !== 'mock_interview_live' && k !== 'resume_regeneration') {
                addonSet.add(k);
              }
            });
          }
        });
        purchasedAddons = Array.from(addonSet);
      }
    }

    return NextResponse.json({ granted, purchasedAddons });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Feature gate check failed";
    return NextResponse.json({ granted: false, purchasedAddons: [], error: message }, { status: 500 });
  }
}
