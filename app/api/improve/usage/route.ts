import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getImproveUsageCount } from "@/lib/improveCredits";

export async function GET() {
  try {
    return NextResponse.json({ summary_improve: 0, project_improve: 0, total: 0 });
  } catch {
    return NextResponse.json({ summary_improve: 0, project_improve: 0, total: 0 });
  }
}
