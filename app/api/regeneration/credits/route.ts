import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRegenerationCount } from "@/lib/regeneration";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get("resumeId")?.trim();
    if (!resumeId) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }
    const count = await getRegenerationCount(user.id, resumeId);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}
