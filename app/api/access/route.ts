import { NextResponse } from "next/server";
import { getAccessMap } from "@/lib/featureGate";
import { getGuestUserId } from "@/lib/guestUser";

export async function GET(request: Request) {
  try {
    const userId = await getGuestUserId();
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get("resumeId")?.trim() || null;
    const access = await getAccessMap(userId, resumeId);
    return NextResponse.json({ access });
  } catch {
    return NextResponse.json({ access: {} }, { status: 200 });
  }
}
