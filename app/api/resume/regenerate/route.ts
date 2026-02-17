import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deductRegenerationCredit } from "@/lib/regeneration";
import { extractResume } from "@/lib/ai/resume-extract";

export const maxDuration = 60;

/**
 * Consume one ₹2 regeneration credit and run extract again (same AI route).
 * Body: { resumeId: string, content: string, jobDescription?: string }
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const resumeId = typeof body.resumeId === "string" ? body.resumeId.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!resumeId || !content || content.length < 50) {
      return NextResponse.json(
        { error: "resumeId and content (resume text) required" },
        { status: 400 }
      );
    }

    const consumed = await deductRegenerationCredit(user.id, resumeId);
    if (!consumed) {
      return NextResponse.json(
        { error: "No regeneration credit. Pay ₹2 to regenerate.", code: "NO_CREDIT" },
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
