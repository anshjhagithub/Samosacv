import { NextResponse } from "next/server";
import roleBulletsData from "@/lib/data/role_bullets.json";
import { findRoleIntelligence } from "@/lib/ats/engine";

const roleBullets = roleBulletsData as Record<string, string[]>;

/**
 * FREE Bullet Suggestions — no auth, no payment required.
 * Returns real resume bullet points extracted from 27K+ resumes for a target role.
 *
 * POST body: { targetRole: string, count?: number }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const targetRole = (body.targetRole as string)?.trim();
    if (!targetRole) {
      return NextResponse.json({ error: "targetRole is required" }, { status: 400 });
    }

    const count = Math.min(20, Math.max(1, Number(body.count) || 10));

    // Try exact match first, then fuzzy
    let bullets = roleBullets[targetRole];
    if (!bullets) {
      const lower = targetRole.toLowerCase();
      for (const [key, val] of Object.entries(roleBullets)) {
        if (key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) {
          bullets = val;
          break;
        }
      }
    }

    const roleIntel = findRoleIntelligence(targetRole);
    const actionVerbs = roleIntel?.action_verbs.slice(0, 15) ?? [];

    return NextResponse.json({
      bullets: (bullets ?? []).slice(0, count),
      actionVerbs,
      targetRole,
      totalAvailable: (bullets ?? []).length,
      free: true,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Bullet suggestions failed" },
      { status: 500 }
    );
  }
}
