import { NextResponse } from "next/server";
import { deductRegenerationCredit } from "@/lib/regeneration";
import { extractResume } from "@/lib/ai/resume-extract";
import { getGuestUserId } from "@/lib/guestUser";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const userId = await getGuestUserId();

    const body = await request.json().catch(() => ({}));
    const resumeId = typeof body.resumeId === "string" ? body.resumeId.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!resumeId || !content || content.length < 50) {
      return NextResponse.json(
        { error: "resumeId and content (resume text) required" },
        { status: 400 }
      );
    }

    const consumed = await deductRegenerationCredit(userId, resumeId);
    if (!consumed) {
      return NextResponse.json(
        { error: "No regeneration credit. Pay ₹5 to regenerate.", code: "NO_CREDIT" },
        { status: 402 }
      );
    }

    const jobDescription = typeof body.jobDescription === "string" ? body.jobDescription.trim() : undefined;
    const { resume } = await extractResume({ content, jobDescription });
    return NextResponse.json({ resume });
  } catch (e) {
    console.error("Regenerate error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Regeneration failed" },
      { status: 500 }
    );
  }
}
