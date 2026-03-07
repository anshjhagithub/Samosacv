/**
 * ATS Scoring Engine & Skill Gap Engine.
 * Deterministic: no AI calls. Uses role_intelligence.json.
 */

import * as fs from "fs";
import * as path from "path";
import type {
  RoleIntelligenceMap,
  ATSBreakdown,
  ATSScoreResult,
} from "./types";

const WEIGHTS = {
  skillMatch: 0.4,
  keywordDensity: 0.15,
  actionVerbUsage: 0.1,
  quantificationScore: 0.15,
  structureScore: 0.1,
  experienceAlignment: 0.1,
} as const;

let cachedRoleIntelligence: RoleIntelligenceMap | null = null;

function loadRoleIntelligence(): RoleIntelligenceMap {
  if (cachedRoleIntelligence) return cachedRoleIntelligence;
  const p = path.join(process.cwd(), "lib", "ats", "data", "role_intelligence.json");
  if (!fs.existsSync(p)) return {};
  cachedRoleIntelligence = JSON.parse(fs.readFileSync(p, "utf-8")) as RoleIntelligenceMap;
  return cachedRoleIntelligence;
}

function normalizeRoleKey(role: string): string {
  return role.trim().toLowerCase().replace(/\s+/g, " ");
}

function findRoleIntelligence(targetRole: string): import("./types").RoleIntelligence | null {
  const map = loadRoleIntelligence();
  const key = normalizeRoleKey(targetRole);
  const exact = map[targetRole.trim()] ?? map[key];
  if (exact) return exact;
  for (const [r, data] of Object.entries(map)) {
    if (normalizeRoleKey(r) === key) return data;
    if (r.toLowerCase().includes(key) || key.includes(r.toLowerCase())) return data;
  }
  return null;
}

/** Extract skills from resume text: simple word tokens and comma/semicolon-separated lists. */
function extractUserSkills(resumeText: string): string[] {
  const lower = resumeText.toLowerCase();
  const skills: Set<string> = new Set();
  const listMatch = resumeText.match(/\b(?:skills?|technical|tools?|technologies?)\s*[:\-]\s*([^\n]+)/gi);
  if (listMatch) {
    for (const m of listMatch) {
      const part = m.replace(/^[^:\-]+\s*[:\-]\s*/i, "").trim();
      part.split(/[,;|•·]/).forEach((s) => {
        const t = s.trim();
        if (t.length >= 2 && t.length <= 50) skills.add(t);
      });
    }
  }
  const bulletWords = resumeText.split(/\s*[\n•·\-]\s*/).flatMap((line) =>
    line.split(/[,;]/).map((s) => s.trim()).filter((s) => s.length >= 2 && s.length <= 40)
  );
  bulletWords.forEach((w) => skills.add(w));
  return Array.from(skills);
}

/** Skill match: % of role's top 40 skills that appear in user skills (or in resume text). */
function scoreSkillMatch(
  resumeText: string,
  userSkills: string[],
  roleIntel: import("./types").RoleIntelligence
): number {
  const top40 = roleIntel.top_skills.map((s) => s.skill.toLowerCase());
  if (top40.length === 0) return 100;
  const resumeLower = resumeText.toLowerCase();
  const userSet = new Set(userSkills.map((s) => s.toLowerCase()));
  let matched = 0;
  for (const skill of top40) {
    if (userSet.has(skill)) {
      matched++;
    } else if (resumeLower.includes(skill)) {
      matched++;
    }
  }
  return Math.min(100, Math.round((matched / top40.length) * 100));
}

/** Keyword density: role skills mentioned in resume / total role skills. */
function scoreKeywordDensity(
  resumeText: string,
  roleIntel: import("./types").RoleIntelligence
): number {
  const top40 = roleIntel.top_skills.map((s) => s.skill.toLowerCase());
  if (top40.length === 0) return 100;
  const lower = resumeText.toLowerCase();
  const mentioned = top40.filter((s) => lower.includes(s)).length;
  return Math.min(100, Math.round((mentioned / top40.length) * 100));
}

/** Action verb usage: role's common verbs found in resume. */
function scoreActionVerbUsage(
  resumeText: string,
  roleIntel: import("./types").RoleIntelligence
): number {
  const verbs = roleIntel.action_verbs;
  if (verbs.length === 0) return 100;
  const lower = resumeText.toLowerCase();
  const found = verbs.filter((v) => lower.includes(v)).length;
  return Math.min(100, Math.round((found / verbs.length) * 100));
}

/** Quantification: numbers, %, $, timeframes. */
function scoreQuantification(resumeText: string): number {
  const hasNumbers = /\d+%|\d+\s*(?:x|years?|months?|people|members|clients|users|%\s*increase|%\s*reduction|\$|₹|k\b|M\b)/i.test(resumeText);
  const count = (resumeText.match(/\d+/g) || []).length;
  const bullets = (resumeText.match(/^[\s•·\-]*\S/gm) || []).length;
  if (bullets === 0) return 50;
  const ratio = count / bullets;
  if (ratio >= 1.5) return 100;
  if (ratio >= 1) return 90;
  if (ratio >= 0.5 || hasNumbers) return 70;
  return 40;
}

/** Structure: sections, bullets, length. */
function scoreStructure(resumeText: string): number {
  const hasSections = /(?:experience|education|skills|summary|work|employment|projects)/i.test(resumeText);
  const bullets = (resumeText.match(/^[\s•·\-]*\S/gm) || []).length;
  const len = resumeText.trim().length;
  let s = 50;
  if (hasSections) s += 20;
  if (bullets >= 3) s += 15;
  if (bullets >= 6) s += 10;
  if (len >= 300 && len <= 1500) s += 5;
  return Math.min(100, s);
}

/** Experience alignment: compare inferred years to role avg. */
function scoreExperienceAlignment(
  resumeText: string,
  roleIntel: import("./types").RoleIntelligence
): number {
  const avgExp = roleIntel.avg_experience_years;
  const yearsMatch = resumeText.match(/(\d+)\+?\s*years?|\b(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp\.?)/i)
    || resumeText.match(/(\d+)\s*-\s*(\d+)\s*years?/i);
  let userYears = 0;
  if (yearsMatch) {
    const a = parseInt(yearsMatch[1] || "0", 10);
    const b = parseInt(yearsMatch[2] || "0", 10);
    userYears = b > 0 ? (a + b) / 2 : a;
  }
  if (avgExp <= 0) return userYears >= 0 ? 80 : 50;
  const diff = Math.abs(userYears - avgExp);
  if (diff <= 1) return 100;
  if (diff <= 2) return 85;
  if (diff <= 3) return 70;
  if (diff <= 5) return 55;
  return 40;
}

/**
 * Score resume against a target role. Returns 0–100 score, breakdown, and missing skills.
 */
export function scoreResume(resumeText: string, targetRole: string): ATSScoreResult {
  const roleIntel = findRoleIntelligence(targetRole);
  const userSkills = extractUserSkills(resumeText);

  const breakdown: ATSBreakdown = {
    skillMatch: 0,
    keywordDensity: 0,
    actionVerbUsage: 0,
    quantificationScore: 0,
    structureScore: 0,
    experienceAlignment: 0,
  };

  if (!roleIntel) {
    breakdown.quantificationScore = scoreQuantification(resumeText);
    breakdown.structureScore = scoreStructure(resumeText);
    // Always use same formula: weighted sum of all 6 (zeros for missing role data)
    const finalScore =
      breakdown.skillMatch * WEIGHTS.skillMatch +
      breakdown.keywordDensity * WEIGHTS.keywordDensity +
      breakdown.actionVerbUsage * WEIGHTS.actionVerbUsage +
      breakdown.quantificationScore * WEIGHTS.quantificationScore +
      breakdown.structureScore * WEIGHTS.structureScore +
      breakdown.experienceAlignment * WEIGHTS.experienceAlignment;
    return {
      finalScore: Math.round(Math.min(100, Math.max(0, finalScore))),
      breakdown,
      missingSkills: [],
    };
  }

  breakdown.skillMatch = scoreSkillMatch(resumeText, userSkills, roleIntel);
  breakdown.keywordDensity = scoreKeywordDensity(resumeText, roleIntel);
  breakdown.actionVerbUsage = scoreActionVerbUsage(resumeText, roleIntel);
  breakdown.quantificationScore = scoreQuantification(resumeText);
  breakdown.structureScore = scoreStructure(resumeText);
  breakdown.experienceAlignment = scoreExperienceAlignment(resumeText, roleIntel);

  const finalScore =
    breakdown.skillMatch * WEIGHTS.skillMatch +
    breakdown.keywordDensity * WEIGHTS.keywordDensity +
    breakdown.actionVerbUsage * WEIGHTS.actionVerbUsage +
    breakdown.quantificationScore * WEIGHTS.quantificationScore +
    breakdown.structureScore * WEIGHTS.structureScore +
    breakdown.experienceAlignment * WEIGHTS.experienceAlignment;

  const missingSkills = getTopMissingSkills(userSkills, targetRole);

  return {
    finalScore: Math.round(Math.min(100, Math.max(0, finalScore))),
    breakdown,
    missingSkills,
  };
}

/**
 * Compare user skills to role's top 40; return top 10 missing skills ranked by frequency.
 */
export function getTopMissingSkills(
  userSkills: string[],
  targetRole: string,
  limit = 10
): string[] {
  const roleIntel = findRoleIntelligence(targetRole);
  if (!roleIntel || roleIntel.top_skills.length === 0) return [];
  const userSet = new Set(userSkills.map((s) => s.toLowerCase()));
  const missing = roleIntel.top_skills.filter(
    (s) => !userSet.has(s.skill.toLowerCase())
  );
  return missing.slice(0, limit).map((s) => s.skill);
}

/** Infer target role from job description by matching role_intelligence keys. */
export function inferTargetRoleFromJobDescription(jobDescription: string): string | null {
  const map = loadRoleIntelligence();
  const keys = Object.keys(map);
  if (keys.length === 0) return null;
  const lower = jobDescription.toLowerCase();
  let best: string | null = null;
  let bestLen = 0;
  for (const role of keys) {
    const rLower = role.toLowerCase();
    if (lower.includes(rLower) && rLower.length > bestLen) {
      best = role;
      bestLen = rLower.length;
    }
  }
  return best;
}

export { loadRoleIntelligence, findRoleIntelligence };
