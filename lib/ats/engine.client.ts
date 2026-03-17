/**
 * Browser-compatible ATS Scoring Engine & Skill Gap Engine.
 * Deterministic: no AI calls. Uses role_intelligence.json.
 */

import roleIntelligenceData from "./data/role_intelligence.json";
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
  cachedRoleIntelligence = roleIntelligenceData as RoleIntelligenceMap;
  return cachedRoleIntelligence;
}

function findRoleIntelligence(targetRole: string) {
  const intel = loadRoleIntelligence();
  const exact = intel[targetRole];
  if (exact) return exact;
  
  // Fuzzy matching: check if any role contains target or vice versa
  const roleKeys = Object.keys(intel);
  const lowerTarget = targetRole.toLowerCase();
  
  for (const key of roleKeys) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes(lowerTarget) || lowerTarget.includes(lowerKey)) {
      return intel[key];
    }
  }
  
  return null;
}

function extractUserSkills(resumeText: string): string[] {
  const skills = new Set<string>();
  
  // Extract skills from role intelligence data
  const intel = loadRoleIntelligence();
  for (const roleData of Object.values(intel)) {
    if (roleData?.top_skills) {
      for (const skillInfo of roleData.top_skills) {
        const skill = skillInfo.skill;
        if (skill && resumeText.toLowerCase().includes(skill.toLowerCase())) {
          skills.add(skill);
        }
      }
    }
  }
  
  // Extract common technical skills
  const techSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby',
    'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS',
    'Azure', 'GCP', 'Git', 'GitHub', 'GitLab', 'CI/CD', 'Jenkins', 'Terraform', 'Ansible',
    'Linux', 'Windows', 'macOS', 'Ubuntu', 'CentOS', 'Debian', 'Alpine', 'Nginx', 'Apache',
    'REST', 'GraphQL', 'gRPC', 'WebSocket', 'TCP/IP', 'HTTP', 'HTTPS', 'SSL', 'TLS',
    'Machine Learning', 'AI', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn',
    'Pandas', 'NumPy', 'Matplotlib', 'Jupyter', 'Spark', 'Hadoop', 'Big Data', 'Data Science',
    'Agile', 'Scrum', 'Kanban', 'Waterfall', 'DevOps', 'Lean', 'ITIL', 'COBIT', 'ISO',
    'Excel', 'Word', 'PowerPoint', 'Outlook', 'Teams', 'Slack', 'Zoom', 'Skype', 'Jira',
    'Confluence', 'Trello', 'Asana', 'Monday.com', 'Notion', 'Figma', 'Sketch', 'Adobe'
  ];
  
  for (const skill of techSkills) {
    if (resumeText.toLowerCase().includes(skill.toLowerCase())) {
      skills.add(skill);
    }
  }
  
  return Array.from(skills);
}

function scoreSkillMatch(userSkills: string[], targetRole: string): number {
  const intel = findRoleIntelligence(targetRole);
  if (!intel?.top_skills) return 0;
  
  const requiredSkills = intel.top_skills.map((s: any) => s.skill).filter(Boolean);
  const matchedSkills = userSkills.filter(skill => 
    requiredSkills.some(req => skill.toLowerCase() === req.toLowerCase())
  );
  
  if (requiredSkills.length === 0) return 0;
  return (matchedSkills.length / requiredSkills.length) * 100;
}

function scoreKeywordDensity(resumeText: string, targetRole: string): number {
  const intel = findRoleIntelligence(targetRole);
  if (!intel?.top_skills) return 0;
  
  const keywords = intel.top_skills.map((s: any) => s.skill).filter(Boolean);
  const lowerText = resumeText.toLowerCase();
  
  let keywordCount = 0;
  for (const keyword of keywords) {
    const regex = new RegExp(keyword.toLowerCase(), 'gi');
    const matches = lowerText.match(regex);
    keywordCount += matches ? matches.length : 0;
  }
  
  // Normalize by text length (keywords per 100 words)
  const words = resumeText.split(/\s+/).length;
  if (words === 0) return 0;
  
  const density = (keywordCount / words) * 100;
  return Math.min(100, density * 10); // Scale to 0-100
}

function scoreActionVerbUsage(resumeText: string): number {
  const actionVerbs = [
    'led', 'managed', 'developed', 'implemented', 'created', 'designed', 'built', 'launched',
    'improved', 'optimized', 'increased', 'decreased', 'reduced', 'achieved', 'delivered', 'completed',
    'coordinated', 'organized', 'planned', 'executed', 'directed', 'supervised', 'trained', 'mentored',
    'analyzed', 'researched', 'investigated', 'evaluated', 'assessed', 'monitored', 'tracked', 'measured',
    'collaborated', 'partnered', 'worked', 'teamed', 'joined', 'supported', 'assisted', 'helped',
    'solved', 'fixed', 'resolved', 'addressed', 'handled', 'maintained', 'updated', 'upgraded'
  ];
  
  const lowerText = resumeText.toLowerCase();
  let verbCount = 0;
  
  for (const verb of actionVerbs) {
    const regex = new RegExp(`\\b${verb}\\b`, 'gi');
    const matches = lowerText.match(regex);
    verbCount += matches ? matches.length : 0;
  }
  
  // Score based on percentage of sentences starting with action verbs
  const sentences = resumeText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 0;
  
  const actionVerbSentences = sentences.filter(sentence => {
    const firstWord = sentence.trim().split(/\s+/)[0]?.toLowerCase();
    return actionVerbs.includes(firstWord);
  });
  
  return (actionVerbSentences.length / sentences.length) * 100;
}

function scoreQuantification(resumeText: string): number {
  // Look for numbers with %, $, or metrics
  const quantPatterns = [
    /\d+%?/gi,  // Percentages
    /\$\d+/gi,  // Dollar amounts
    /\d+\s*(?:million|billion|thousand|k|m|b)/gi,  // Large numbers
    /\d+\s*(?:users|customers|clients|projects|products|sales|revenue|growth|reduction|improvement|increase|decrease)/gi
  ];
  
  let quantCount = 0;
  for (const pattern of quantPatterns) {
    const matches = resumeText.match(pattern);
    quantCount += matches ? matches.length : 0;
  }
  
  // Score based on density of quantified statements
  const sentences = resumeText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 0;
  
  const quantifiedSentences = sentences.filter(sentence => {
    for (const pattern of quantPatterns) {
      if (pattern.test(sentence)) return true;
    }
    return false;
  });
  
  return (quantifiedSentences.length / sentences.length) * 100;
}

function scoreStructure(resumeText: string): number {
  let score = 0;
  
  // Check for common resume sections
  const sections = [
    'summary', 'experience', 'work experience', 'education', 'skills', 'projects',
    'certifications', 'awards', 'publications', 'references'
  ];
  
  const lowerText = resumeText.toLowerCase();
  for (const section of sections) {
    if (lowerText.includes(section)) {
      score += 10;
    }
  }
  
  // Check for bullet points
  const bulletPatterns = /[•·-]\s|\n\s*[-*•·]\s/g;
  const bulletMatches = resumeText.match(bulletPatterns);
  if (bulletMatches && bulletMatches.length > 0) {
    score += Math.min(20, bulletMatches.length * 2);
  }
  
  // Check for consistent formatting
  const lines = resumeText.split('\n');
  const nonEmptyLines = lines.filter(line => line.trim().length > 0);
  if (nonEmptyLines.length > 10) {
    score += 10;
  }
  
  return Math.min(100, score);
}

function scoreExperienceAlignment(resumeText: string, targetRole: string): number {
  const intel = findRoleIntelligence(targetRole);
  if (!intel) return 0;
  
  // Extract experience-related keywords
  const experienceKeywords = intel.top_skills?.map((s: any) => s.skill).slice(0, 10) || [];
  const lowerText = resumeText.toLowerCase();
  
  let alignmentScore = 0;
  for (const keyword of experienceKeywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      alignmentScore += 10;
    }
  }
  
  return Math.min(100, alignmentScore);
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

  breakdown.skillMatch = scoreSkillMatch(userSkills, targetRole);
  breakdown.keywordDensity = scoreKeywordDensity(resumeText, targetRole);
  breakdown.actionVerbUsage = scoreActionVerbUsage(resumeText);
  breakdown.quantificationScore = scoreQuantification(resumeText);
  breakdown.structureScore = scoreStructure(resumeText);
  breakdown.experienceAlignment = scoreExperienceAlignment(resumeText, targetRole);

  const finalScore =
    breakdown.skillMatch * WEIGHTS.skillMatch +
    breakdown.keywordDensity * WEIGHTS.keywordDensity +
    breakdown.actionVerbUsage * WEIGHTS.actionVerbUsage +
    breakdown.quantificationScore * WEIGHTS.quantificationScore +
    breakdown.structureScore * WEIGHTS.structureScore +
    breakdown.experienceAlignment * WEIGHTS.experienceAlignment;

  const requiredSkills = roleIntel.top_skills?.map((s: any) => s.skill).filter(Boolean) || [];
  const missingSkills = requiredSkills.filter(skill => 
    !userSkills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
  );

  return {
    finalScore: Math.round(Math.min(100, Math.max(0, finalScore))),
    breakdown,
    missingSkills,
  };
}
