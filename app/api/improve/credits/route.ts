import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getImproveCreditsCount, hasUnlimitedImproves } from "@/lib/improveCredits";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ summary_improve: 0, project_improve: 0, unlimited: false });
    }
    if (hasUnlimitedImproves(user.email)) {
      return NextResponse.json({ summary_improve: 999, project_improve: 999, unlimited: true });
    }
    const [summary_improve, project_improve] = await Promise.all([
      getImproveCreditsCount(user.id, "summary_improve"),
      getImproveCreditsCount(user.id, "project_improve"),
    ]);
    return NextResponse.json({ summary_improve, project_improve, unlimited: false });
  } catch {
    return NextResponse.json({ summary_improve: 0, project_improve: 0, unlimited: false });
  }
}
