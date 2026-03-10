import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAccess } from "@/lib/featureGate";
import type { FeatureSlug } from "@/lib/pricing";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ granted: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get("resumeId") || null;
    const feature = (searchParams.get("feature") || "resume_pdf") as FeatureSlug;

    const granted = await checkAccess(user.id, feature, resumeId);
    
    // Also fetch any purchased add-ons for this resume if they exist
    let purchasedAddons: string[] = [];
    if (granted && resumeId) {
      const { data: orders } = await supabase
        .from("orders")
        .select("line_items")
        .eq("user_id", user.id)
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
