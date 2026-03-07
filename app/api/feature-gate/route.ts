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
    return NextResponse.json({ granted });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Feature gate check failed";
    return NextResponse.json({ granted: false, error: message }, { status: 500 });
  }
}
