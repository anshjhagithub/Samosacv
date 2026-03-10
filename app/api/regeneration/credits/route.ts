import { NextResponse } from "next/server";
import { getRegenerationCount } from "@/lib/regeneration";
import { getGuestUserId } from "@/lib/guestUser";

const UNLIMITED_REGEN_EMAIL = "anshjha8463@gmail.com";

export async function GET(request: Request) {
  try {
    const userId = await getGuestUserId();
    if (userId === "00000000-0000-0000-0000-000000000000") {
      // Just fallback if dummy returned by helper couldn't be resolved
    }
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get("resumeId")?.trim();
    if (!resumeId) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }
    const count = await getRegenerationCount(userId, resumeId);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}
