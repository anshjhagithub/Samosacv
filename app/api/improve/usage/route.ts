import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getImproveUsageCount } from "@/lib/improveCredits";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ summary_improve: 0, project_improve: 0, total: 0 });
    }
    const usage = await getImproveUsageCount(user.id);
    return NextResponse.json(usage);
  } catch {
    return NextResponse.json({ summary_improve: 0, project_improve: 0, total: 0 });
  }
}
