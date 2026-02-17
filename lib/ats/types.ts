/**
 * ATS + Resume Intelligence types.
 */

export interface CleanedResume {
  job_role: string;
  job_position_name: string;
  skills: string[];
  responsibilities: string[];
  experience_years: number;
  matched_score: number;
}

export interface SkillFrequency {
  skill: string;
  count: number;
  frequency_percent: number;
}

export interface RoleIntelligence {
  job_role: string;
  top_skills: SkillFrequency[];
  action_verbs: string[];
  avg_matched_score: number;
  avg_experience_years: number;
}

export interface RoleIntelligenceMap {
  [jobRole: string]: RoleIntelligence;
}

export interface ATSBreakdown {
  skillMatch: number;
  keywordDensity: number;
  actionVerbUsage: number;
  quantificationScore: number;
  structureScore: number;
  experienceAlignment: number;
}

export interface ATSScoreResult {
  finalScore: number;
  breakdown: ATSBreakdown;
  missingSkills: string[];
}
