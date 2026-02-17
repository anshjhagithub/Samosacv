import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAccessMap } from "@/lib/featureGate";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ access: {} }, { status: 200 });
    }
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get("resumeId")?.trim() || null;
    const access = await getAccessMap(user.id, resumeId);
    return NextResponse.json({ access });
  } catch {
    return NextResponse.json({ access: {} }, { status: 200 });
  }
}
