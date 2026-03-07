import { NextResponse } from "next/server";
import { generateFromMinimal } from "@/lib/ai/generate-from-minimal";
import { validateToken, confirmGeneration } from "@/lib/supabase/edgeFunctions";
import { scoreResume, findRoleIntelligence } from "@/lib/ats/engine";
import { resumeToText } from "@/lib/utils/resumeToText";
import type { ExperienceLevel } from "@/lib/resumeFlowStorage";

export const maxDuration = 60;

const ENFORCE_LIMITS = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.CONFIRM_GENERATION_SECRET
);

function apiCostPaise(promptTokens: number, completionTokens: number): number {
  const inputPaisePer1k = 17;
  const outputPaisePer1k = 50;
  return Math.ceil((promptTokens / 1000) * inputPaisePer1k + (completionTokens / 1000) * outputPaisePer1k);
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "production") {
    console.log("[generate-from-minimal] POST received");
  }

  const jwt = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "").trim();
  const generationToken = request.headers.get("X-Generation-Token")?.trim();

  // Allow unauthenticated generation (sign-in required only at pay/download in builder)
  const isAuthenticated = !!jwt;

  if (isAuthenticated && ENFORCE_LIMITS && generationToken) {
    const valid = await validateToken(jwt, generationToken);
    if ("error" in valid) {
      return NextResponse.json(
        { error: "Invalid or expired generation token", code: "INVALID_TOKEN" },
        { status: 401 }
      );
    }
  }

  let body: {
    fullName?: string;
    targetRole?: string;
    experienceLevel?: ExperienceLevel;
    location?: string;
    jobDescription?: string;
    experiences?: { jobTitle?: string; company?: string; duration?: string }[];
    projects?: { title?: string; oneLiner?: string }[];
    apiKey?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const fullName = (body.fullName ?? "").trim();
  const targetRole = (body.targetRole ?? "").trim();
  const experienceLevel = (body.experienceLevel ?? "1-3") as ExperienceLevel;
  if (!fullName || !targetRole) {
    return NextResponse.json(
      { error: "fullName and targetRole are required" },
      { status: 400 }
    );
  }

  const experiences = Array.isArray(body.experiences)
    ? body.experiences
        .map((e) => ({
          jobTitle: (e?.jobTitle ?? "").trim(),
          company: (e?.company ?? "").trim(),
          duration: (e?.duration ?? "").trim(),
        }))
        .filter((e) => e.jobTitle)
    : [];
  const projects = Array.isArray(body.projects)
    ? body.projects
        .map((p) => ({
          title: (p?.title ?? "").trim(),
          oneLiner: (p?.oneLiner ?? "").trim(),
        }))
        .filter((p) => p.title)
    : [];

  try {
    const { resume, usage } = await generateFromMinimal({
      fullName,
      targetRole,
      experienceLevel,
      location: body.location?.trim(),
      jobDescription: body.jobDescription?.trim(),
      experiences,
      projects,
      apiKey: body.apiKey ?? null,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("[generate-from-minimal] LLM resume generated", { projectsCount: resume.projects?.length ?? 0, projectBullets: resume.projects?.map((p) => (p as { bullets?: string[] }).bullets?.length ?? 0) });
    }

    const textForScore = resumeToText(resume);
    const atsResult = scoreResume(textForScore, targetRole);
    const roleIntel = findRoleIntelligence(targetRole);

    const tokensUsed = (usage?.promptTokens ?? 0) + (usage?.completionTokens ?? 0);
    const apiCostPaiseVal = usage ? apiCostPaise(usage.promptTokens, usage.completionTokens) : 0;
    if (ENFORCE_LIMITS && generationToken && isAuthenticated) {
      await confirmGeneration(generationToken, {
        success: true,
        tokens_used: tokensUsed,
        api_cost_paise: apiCostPaiseVal,
      });
    }

    return NextResponse.json({
      resume,
      atsScore: atsResult.finalScore,
      breakdown: atsResult.breakdown,
      missingSkills: atsResult.missingSkills,
      targetRole,
      roleTopSkills: roleIntel?.top_skills.slice(0, 15).map((s) => s.skill) ?? [],
    });
  } catch (err) {
    if (ENFORCE_LIMITS && generationToken && isAuthenticated) {
      await confirmGeneration(generationToken, { success: false });
    }
    console.error("Generate-from-minimal error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to generate resume. Please try again.",
      },
      { status: 500 }
    );
  }
}
