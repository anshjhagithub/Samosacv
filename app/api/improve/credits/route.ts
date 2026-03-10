import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getImproveCreditsCount, hasUnlimitedImproves } from "@/lib/improveCredits";

export async function GET() {
  try {
    return NextResponse.json({ summary_improve: 999, project_improve: 999, unlimited: true });
  } catch {
    return NextResponse.json({ summary_improve: 0, project_improve: 0, unlimited: false });
  }
}
