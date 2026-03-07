import { NextResponse } from "next/server";
import { findRoleIntelligence } from "@/lib/ats/engine";
import roleBulletsData from "@/lib/data/role_bullets.json";
import { rolePresets, ROLE_IDS } from "@/lib/rolePresets";

const roleBullets = roleBulletsData as Record<string, string[]>;

/**
 * FREE Role Intelligence — no auth required.
 * Returns comprehensive data about a target role: skills, action verbs, bullets, presets.
 * Powered by 27K+ real resumes from our dataset.
 *
 * GET ?role=Data+Scientist
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role")?.trim();

  if (!role) {
    return NextResponse.json({
      availableRoles: ROLE_IDS.map((id) => ({
        id,
        label: rolePresets[id].label,
      })),
    });
  }

  const roleIntel = findRoleIntelligence(role);
  const lower = role.toLowerCase();
  const presetMatch = ROLE_IDS.find((id) => {
    const label = rolePresets[id].label.toLowerCase();
    return lower.includes(label) || label.includes(lower) || id === lower;
  });

  let bullets: string[] = [];
  const b = roleBullets[role];
  if (b) {
    bullets = b.slice(0, 10);
  } else {
    for (const [key, val] of Object.entries(roleBullets)) {
      if (key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) {
        bullets = val.slice(0, 10);
        break;
      }
    }
  }

  return NextResponse.json({
    targetRole: role,
    topSkills: roleIntel?.top_skills.slice(0, 20).map((s) => s.skill) ?? [],
    actionVerbs: roleIntel?.action_verbs.slice(0, 15) ?? [],
    avgExperienceYears: roleIntel?.avg_experience_years ?? 0,
    sampleBullets: bullets,
    preset: presetMatch
      ? {
          id: presetMatch,
          label: rolePresets[presetMatch].label,
          skills: rolePresets[presetMatch].skills,
          summary: rolePresets[presetMatch].summaryTemplate,
          suggestedProjects: rolePresets[presetMatch].suggestedProjects,
        }
      : null,
    free: true,
  });
}
