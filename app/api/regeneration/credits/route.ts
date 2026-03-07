import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRegenerationCount } from "@/lib/regeneration";

const UNLIMITED_REGEN_EMAIL = "anshjha8463@gmail.com";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }
    if (user.email?.toLowerCase() === UNLIMITED_REGEN_EMAIL) {
      return NextResponse.json({ count: 999, unlimited: true });
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
