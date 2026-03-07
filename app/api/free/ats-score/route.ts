import { NextResponse } from "next/server";
import { scoreResume } from "@/lib/ats/engine";
import { resumeToText } from "@/lib/utils/resumeToText";
import type { ResumeData } from "@/types/resume";

/**
 * FREE ATS Score — no auth, no payment required.
 * Deterministic scoring using role_intelligence.json data extracted from 27K+ resumes.
 *
 * POST body: { resumeText?: string, resumeData?: ResumeData, targetRole: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const targetRole = (body.targetRole as string)?.trim();
    if (!targetRole) {
      return NextResponse.json({ error: "targetRole is required" }, { status: 400 });
    }

    let text = (body.resumeText as string)?.trim() ?? "";
    if (!text && body.resumeData) {
      text = resumeToText(body.resumeData as ResumeData);
    }
    if (!text || text.length < 30) {
      return NextResponse.json({ error: "Resume text too short (min 30 chars)" }, { status: 400 });
    }

    const result = scoreResume(text, targetRole);
    return NextResponse.json({
      score: result.finalScore,
      breakdown: result.breakdown,
      missingSkills: result.missingSkills,
      targetRole,
      free: true,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "ATS scoring failed" },
      { status: 500 }
    );
  }
}
