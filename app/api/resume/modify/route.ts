import { NextResponse } from "next/server";
import { modifyResume } from "@/lib/ai/resume-modify";
import type { ResumeModifier } from "@/lib/ai/resume-modify";
import type { ResumeData } from "@/types/resume";

export const maxDuration = 30;

const ALLOWED_MODIFIERS: ResumeModifier[] = ["impactful", "technical", "leadership", "ats"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const resume = body.resume as ResumeData | undefined;
    const modifier = body.modifier as string | undefined;

    if (!resume || typeof resume !== "object") {
      return NextResponse.json({ error: "resume is required" }, { status: 400 });
    }
    if (!modifier || !ALLOWED_MODIFIERS.includes(modifier as ResumeModifier)) {
      return NextResponse.json(
        { error: "modifier must be one of: impactful, technical, leadership, ats" },
        { status: 400 }
      );
    }

    const updated = await modifyResume({
      resume,
      modifier: modifier as ResumeModifier,
      apiKey: body.apiKey ?? null,
    });
    return NextResponse.json({ resume: updated });
  } catch (err) {
    console.error("Resume modify error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to apply modifier" },
      { status: 500 }
    );
  }
}
