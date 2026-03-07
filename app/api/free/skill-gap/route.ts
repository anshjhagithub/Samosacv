import { NextResponse } from "next/server";
import { getTopMissingSkills, findRoleIntelligence } from "@/lib/ats/engine";

/**
 * FREE Skill Gap Analysis — no auth, no payment required.
 * Returns missing skills for a target role based on 27K+ resume dataset.
 *
 * POST body: { skills: string[], targetRole: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const targetRole = (body.targetRole as string)?.trim();
    if (!targetRole) {
      return NextResponse.json({ error: "targetRole is required" }, { status: 400 });
    }

    const userSkills: string[] = Array.isArray(body.skills) ? body.skills : [];
    const missing = getTopMissingSkills(userSkills, targetRole, 15);

    const roleIntel = findRoleIntelligence(targetRole);
    const topRoleSkills = roleIntel?.top_skills.slice(0, 20).map((s) => ({
      skill: s.skill,
      frequency: s.frequency_percent,
    })) ?? [];

    return NextResponse.json({
      missingSkills: missing,
      topRoleSkills,
      targetRole,
      free: true,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Skill gap analysis failed" },
      { status: 500 }
    );
  }
}
