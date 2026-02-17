/**
 * Step 2: Build role intelligence from cleaned_resumes.json.
 * For each job_role: top 40 skills (with freq %), action verbs from responsibilities,
 * avg matched_score, avg experience_years. Saves role_intelligence.json.
 *
 * Run: npx tsx scripts/build-role-intelligence.ts
 * Expects: data/cleaned_resumes.json
 * Output: lib/ats/data/role_intelligence.json
 */

import * as fs from "fs";
import * as path from "path";
import type { CleanedResume } from "../lib/ats/types";
import type { RoleIntelligence, RoleIntelligenceMap, SkillFrequency } from "../lib/ats/types";

const DATA_DIR = path.join(process.cwd(), "data");
const CLEANED_PATH = path.join(DATA_DIR, "cleaned_resumes.json");
const OUT_DIR = path.join(process.cwd(), "lib", "ats", "data");
const OUT_PATH = path.join(OUT_DIR, "role_intelligence.json");

const TOP_SKILLS_N = 40;
const ACTION_VERB_PATTERN = /\b(led|managed|developed|implemented|created|built|designed|improved|increased|reduced|delivered|launched|optimized|established|coordinated|executed|analyzed|automated|streamlined|drove|achieved|oversaw|supervised|trained|mentored|collaborated|resolved|negotiated|presented|published|researched|integrated|migrated|deployed|maintained|supported|documented|tested|monitored|evaluated|identified)\b/gi;

function extractActionVerbs(texts: string[]): string[] {
  const count = new Map<string, number>();
  for (const t of texts) {
    const lower = t.toLowerCase();
    let m: RegExpExecArray | null;
    const re = new RegExp(ACTION_VERB_PATTERN.source, "gi");
    while ((m = re.exec(lower)) !== null) {
      const w = m[0].toLowerCase();
      count.set(w, (count.get(w) ?? 0) + 1);
    }
  }
  return Array.from(count.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([verb]) => verb);
}

function buildRoleIntelligence(cleaned: CleanedResume[]): RoleIntelligenceMap {
  const byRole = new Map<string, CleanedResume[]>();
  for (const r of cleaned) {
    const role = r.job_role?.trim() || "Unknown";
    if (!byRole.has(role)) byRole.set(role, []);
    byRole.get(role)!.push(r);
  }

  const out: RoleIntelligenceMap = {};

  for (const [jobRole, rows] of byRole) {
    const skillCount = new Map<string, number>();
    const allResponsibilities: string[] = [];
    let sumScore = 0;
    let sumExp = 0;

    for (const r of rows) {
      for (const s of r.skills) {
        const key = s.trim();
        if (key) skillCount.set(key, (skillCount.get(key) ?? 0) + 1);
      }
      allResponsibilities.push(...r.responsibilities);
      sumScore += r.matched_score;
      sumExp += r.experience_years;
    }

    const totalSkillMentions = Array.from(skillCount.values()).reduce((a, b) => a + b, 0);
    const topSkills: SkillFrequency[] = Array.from(skillCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_SKILLS_N)
      .map(([skill, count]) => ({
        skill,
        count,
        frequency_percent: totalSkillMentions ? Math.round((count / totalSkillMentions) * 10000) / 100 : 0,
      }));

    const actionVerbs = extractActionVerbs(allResponsibilities);

    out[jobRole] = {
      job_role: jobRole,
      top_skills: topSkills,
      action_verbs: actionVerbs,
      avg_matched_score: rows.length ? Math.round((sumScore / rows.length) * 100) / 100 : 0,
      avg_experience_years: rows.length ? Math.round((sumExp / rows.length) * 100) / 100 : 0,
    };
  }

  return out;
}

function main(): void {
  if (!fs.existsSync(CLEANED_PATH)) {
    console.error("Missing data/cleaned_resumes.json. Run: npx tsx scripts/process-resume-data.ts");
    process.exit(1);
  }

  const cleaned: CleanedResume[] = JSON.parse(fs.readFileSync(CLEANED_PATH, "utf-8"));
  const roleIntelligence = buildRoleIntelligence(cleaned);

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }
  fs.writeFileSync(OUT_PATH, JSON.stringify(roleIntelligence, null, 2), "utf-8");
  console.log(`Wrote role intelligence for ${Object.keys(roleIntelligence).length} roles to ${OUT_PATH}`);
}

main();
