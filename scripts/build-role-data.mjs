/**
 * Parses all CSV datasets to extract:
 * - Skills per role
 * - Action verbs per role
 * - Bullet points per role
 * - Experience years per role
 * Outputs:
 * - lib/ats/data/role_intelligence.json (enhanced)
 * - lib/data/role_bullets.json (role-specific bullets from real resumes)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "data");

// ── Minimal CSV parser (handles quoted fields with commas/newlines) ──
function parseCSV(text) {
  const rows = [];
  let i = 0;
  const len = text.length;

  function readField() {
    if (i >= len || text[i] === "\n" || text[i] === "\r") return "";
    if (text[i] === '"') {
      i++; // skip opening quote
      let val = "";
      while (i < len) {
        if (text[i] === '"') {
          if (i + 1 < len && text[i + 1] === '"') {
            val += '"';
            i += 2;
          } else {
            i++; // skip closing quote
            break;
          }
        } else {
          val += text[i++];
        }
      }
      return val;
    }
    let val = "";
    while (i < len && text[i] !== "," && text[i] !== "\n" && text[i] !== "\r") {
      val += text[i++];
    }
    return val;
  }

  function readRow() {
    const fields = [];
    while (i < len && text[i] !== "\n" && text[i] !== "\r") {
      fields.push(readField());
      if (i < len && text[i] === ",") i++;
    }
    if (i < len && text[i] === "\r") i++;
    if (i < len && text[i] === "\n") i++;
    return fields;
  }

  const headers = readRow();
  while (i < len) {
    if (text[i] === "\n" || text[i] === "\r") { i++; continue; }
    const row = readRow();
    if (row.length === 0 || (row.length === 1 && !row[0])) continue;
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h.trim()] = row[idx] ?? "";
    });
    rows.push(obj);
  }
  return rows;
}

// ── Common action verbs for resumes ──
const ACTION_VERBS = new Set([
  "achieved","administered","analyzed","architected","automated","built","collaborated",
  "conducted","configured","coordinated","created","debugged","delivered","deployed",
  "designed","developed","devised","directed","documented","drove","enhanced","ensured",
  "established","evaluated","executed","facilitated","formulated","generated","headed",
  "identified","implemented","improved","increased","initiated","integrated","investigated",
  "launched","led","maintained","managed","mentored","migrated","modernized","monitored",
  "negotiated","optimized","orchestrated","organized","oversaw","performed","pioneered",
  "planned","presented","prioritized","processed","produced","programmed","proposed",
  "published","reduced","refactored","reformed","resolved","restructured","reviewed",
  "revamped","scaled","scheduled","secured","simplified","solved","spearheaded","streamlined",
  "strengthened","supervised","supported","surpassed","tested","trained","transformed",
  "troubleshot","unified","upgraded","utilized","validated","verified",
  "accelerated","advised","allocated","assembled","assessed","audited","authored",
  "balanced","boosted","calculated","cataloged","championed","clarified","coached",
  "compiled","completed","composed","computed","conceptualized","consolidated","constructed",
  "consulted","customized","decreased","defined","delegated","demonstrated","diagnosed",
  "discovered","distributed","earned","educated","eliminated","empowered","engineered",
  "exceeded","expanded","expedited","extracted","finalized","forecasted","founded",
  "guided","illustrated","influenced","inspected","installed","instituted","instructed",
  "interpreted","introduced","invented","mapped","maximized","mediated","minimized",
  "modeled","modified","motivated","navigated","obtained","operated","originated",
  "overhauled","partnered","piloted","prescribed","prevented","projected","promoted",
  "qualified","quantified","recommended","reconciled","recruited","redesigned","refined",
  "regulated","rehabilitated","reinforced","remodeled","rendered","reorganized","reported",
  "represented","researched","restored","revitalized","shaped","standardized","steered",
  "stimulated","strategized","succeeded","supervised","systematized","targeted","translated",
  "troubleshot","uncovered","undertook","updated","validated","visualized","won"
]);

// ── Skill extraction from resume text ──
const SKILL_PATTERNS = /\b(?:skills?|technical|tools?|technologies?|proficien(?:t|cy)|expertise|competenc(?:ies|y)|languages?)\s*[:\-–]\s*([^\n]+)/gi;
const BULLET_RE = /^[\s•·\-\*]+(.{20,200})/gm;

function extractSkills(text) {
  const skills = new Map();
  // From explicit skill sections
  let m;
  const t = text || "";
  while ((m = SKILL_PATTERNS.exec(t)) !== null) {
    const parts = m[1].split(/[,;|•·\/]/).map(s => s.trim()).filter(s => s.length >= 2 && s.length <= 60);
    for (const p of parts) {
      const clean = p.replace(/[()]/g, "").trim();
      if (clean.length < 2) continue;
      const k = clean.toLowerCase();
      skills.set(k, { skill: clean, count: (skills.get(k)?.count || 0) + 1 });
    }
  }
  SKILL_PATTERNS.lastIndex = 0;
  return skills;
}

function extractActionVerbs(text) {
  const verbs = new Map();
  const words = (text || "").toLowerCase().split(/\W+/);
  for (const w of words) {
    if (ACTION_VERBS.has(w)) {
      verbs.set(w, (verbs.get(w) || 0) + 1);
    }
  }
  return verbs;
}

function extractBullets(text) {
  const bullets = [];
  let m;
  const t = text || "";
  while ((m = BULLET_RE.exec(t)) !== null) {
    const bullet = m[1].trim();
    if (bullet.length >= 25 && bullet.length <= 250 && /[a-zA-Z]/.test(bullet)) {
      bullets.push(bullet);
    }
  }
  BULLET_RE.lastIndex = 0;
  return bullets;
}

function extractExperienceYears(text) {
  const m = (text || "").match(/(\d+)\+?\s*years?/i);
  if (m) return parseInt(m[1], 10);
  const dateRanges = (text || "").match(/\b(20\d{2})\s*[-–]\s*(20\d{2}|present)/gi);
  if (dateRanges && dateRanges.length > 0) {
    let maxSpan = 0;
    for (const dr of dateRanges) {
      const nums = dr.match(/20\d{2}/g);
      if (nums && nums.length >= 2) {
        maxSpan = Math.max(maxSpan, parseInt(nums[1]) - parseInt(nums[0]));
      }
    }
    if (maxSpan > 0) return maxSpan;
  }
  return 0;
}

// ── Normalize category names to consistent IDs ──
function normalizeCategory(cat) {
  if (!cat) return null;
  const c = cat.trim().toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9\-\/]/g, "");
  const MAP = {
    "accountant": "Accountant",
    "advocate": "Advocate",
    "agriculture": "Agriculture",
    "apparel": "Apparel",
    "architecture": "Architecture",
    "arts": "Arts",
    "automobile": "Automobile",
    "aviation": "Aviation",
    "banking": "Banking",
    "blockchain": "Blockchain Developer",
    "blockchain-developer": "Blockchain Developer",
    "bpo": "BPO",
    "building-and-construction": "Construction",
    "construction": "Construction",
    "business-analyst": "Business Analyst",
    "business-development": "Business Development",
    "civil-engineer": "Civil Engineer",
    "cloud-architect": "Cloud Architect",
    "cloud-engineer": "Cloud Engineer",
    "consultant": "Consultant",
    "content-writer": "Content Writer",
    "cybersecurity-analyst": "Cybersecurity Analyst",
    "cybersecurity-specialist": "Cybersecurity Specialist",
    "data-analyst": "Data Analyst",
    "data-architect": "Data Architect",
    "data-engineer": "Data Engineer",
    "data-science": "Data Scientist",
    "data-scientist": "Data Scientist",
    "database": "Database Administrator",
    "database-administrator": "Database Administrator",
    "designer": "Graphic Designer",
    "designing": "Graphic Designer",
    "devops": "DevOps Engineer",
    "devops-engineer": "DevOps Engineer",
    "digital-marketer": "Digital Marketing Specialist",
    "digital-marketing-specialist": "Digital Marketing Specialist",
    "digital-media": "Digital Media",
    "dotnet-developer": ".NET Developer",
    "e-commerce-specialist": "E-commerce Specialist",
    "education": "Teacher",
    "electrical-engineering": "Electrical Engineer",
    "engineering": "Mechanical Engineer",
    "etl-developer": "ETL Developer",
    "finance": "Financial Analyst",
    "fitness": "Health and Fitness",
    "food-and-beverages": "Food and Beverages",
    "full-stack-developer": "Full Stack Developer",
    "game-developer": "Game Developer",
    "graphic-designer": "Graphic Designer",
    "hadoop": "Data Engineer",
    "health-and-fitness": "Health and Fitness",
    "healthcare": "Healthcare",
    "hr": "HR Manager",
    "hr-specialist": "HR Specialist",
    "human-resources": "HR Manager",
    "human-resources-specialist": "HR Specialist",
    "information-technology": "IT Support Specialist",
    "it-support-specialist": "IT Support Specialist",
    "java-developer": "Java Developer",
    "machine-learning-engineer": "ML Engineer",
    "management": "Operations Manager",
    "mechanical-engineer": "Mechanical Engineer",
    "mobile-app-developer": "Mobile App Developer",
    "network-engineer": "Network Engineer",
    "network-security-engineer": "Network Security Engineer",
    "operations-manager": "Operations Manager",
    "pmo": "Project Manager",
    "product-manager": "Product Manager",
    "project-manager": "Project Manager",
    "public-relations": "Public Relations",
    "python-developer": "Python Developer",
    "qa-engineer": "QA Engineer",
    "react-developer": "React Developer",
    "robotics-engineer": "Robotics Engineer",
    "sales": "Sales",
    "sap-developer": "SAP Developer",
    "software-developer": "Software Developer",
    "software-engineer": "Software Engineer",
    "sql-developer": "SQL Developer",
    "system-administrator": "Systems Administrator",
    "teacher": "Teacher",
    "testing": "QA Engineer",
    "automation-testing": "QA Engineer",
    "ui-designer": "UI Designer",
    "ui/ux-designer": "UI/UX Designer",
    "ux-designer": "UX Designer",
    "web-designing": "Web Designer",
    "ai-engineer": "AI Engineer",
    "ai-researcher": "AI Researcher",
    "ar/vr-developer": "AR/VR Developer",
    "chef": "Chef",
  };
  return MAP[c] || cat.trim();
}

// ── Main processing ──
async function main() {
  const roleData = new Map();

  function ensure(roleName) {
    if (!roleData.has(roleName)) {
      roleData.set(roleName, {
        skills: new Map(),
        actionVerbs: new Map(),
        bullets: [],
        experienceYears: [],
        resumeCount: 0,
      });
    }
    return roleData.get(roleName);
  }

  function processResume(roleName, text) {
    if (!roleName || !text || text.length < 50) return;
    const data = ensure(roleName);
    data.resumeCount++;

    const skills = extractSkills(text);
    for (const [k, v] of skills) {
      const existing = data.skills.get(k);
      if (existing) {
        existing.count += v.count;
      } else {
        data.skills.set(k, { ...v });
      }
    }

    const verbs = extractActionVerbs(text);
    for (const [v, c] of verbs) {
      data.actionVerbs.set(v, (data.actionVerbs.get(v) || 0) + c);
    }

    const bullets = extractBullets(text);
    data.bullets.push(...bullets);

    const years = extractExperienceYears(text);
    if (years > 0) data.experienceYears.push(years);
  }

  // ── Load Dataset.csv ──
  console.log("Processing Dataset.csv...");
  try {
    const raw = fs.readFileSync(path.join(DATA, "Dataset.csv"), "utf-8");
    const rows = parseCSV(raw);
    console.log(`  ${rows.length} rows`);
    for (const row of rows) {
      const role = normalizeCategory(row.Category);
      processResume(role, row.Text);
    }
  } catch (e) { console.error("Dataset.csv error:", e.message); }

  // ── Load dataset2.csv ──
  console.log("Processing dataset2.csv...");
  try {
    const raw = fs.readFileSync(path.join(DATA, "dataset2.csv"), "utf-8");
    const rows = parseCSV(raw);
    console.log(`  ${rows.length} rows`);
    for (const row of rows) {
      const role = normalizeCategory(row.Role);
      processResume(role, row.Resume);
      if (row.Job_Description && row.Job_Description.length > 30) {
        processResume(role, row.Job_Description);
      }
    }
  } catch (e) { console.error("dataset2.csv error:", e.message); }

  // ── Load Resume.csv ──
  console.log("Processing Resume.csv...");
  try {
    const raw = fs.readFileSync(path.join(DATA, "Resume.csv"), "utf-8");
    const rows = parseCSV(raw);
    console.log(`  ${rows.length} rows`);
    for (const row of rows) {
      const role = normalizeCategory(row.Category);
      processResume(role, row.Resume_str || row.Resume);
    }
  } catch (e) { console.error("Resume.csv error:", e.message); }

  // Skipping updated_data_final_cleaned.csv (197MB — data overlaps with other CSVs)
  console.log("Skipping updated_data_final_cleaned.csv (197MB, data covered by other sources)");

  // ── Load UpdatedResumeDataSet1.csv ──
  console.log("Processing UpdatedResumeDataSet1.csv...");
  try {
    const raw = fs.readFileSync(path.join(DATA, "UpdatedResumeDataSet1.csv"), "utf-8");
    const rows = parseCSV(raw);
    console.log(`  ${rows.length} rows`);
    for (const row of rows) {
      const role = normalizeCategory(row.Category);
      processResume(role, row.Resume);
    }
  } catch (e) { console.error("UpdatedResumeDataSet1.csv error:", e.message); }

  console.log(`\nTotal roles discovered: ${roleData.size}`);
  for (const [role, data] of roleData) {
    console.log(`  ${role}: ${data.resumeCount} resumes, ${data.skills.size} skills, ${data.bullets.length} bullets`);
  }

  // ── Build role_intelligence.json ──
  const intelligence = {};
  for (const [role, data] of roleData) {
    if (data.resumeCount < 1) continue;

    const topSkills = Array.from(data.skills.values())
      .filter(s => {
        const sk = s.skill;
        if (sk.length < 2 || sk.length > 50) return false;
        if (/^\[|^\*|^#|^http|^[:\-–•·]/.test(sk)) return false;
        if (/^(?:and|the|for|with|from|into|that|this|was|were|are|been|have|has|had|not|but|can|will|may|our|all|any|its)$/i.test(sk)) return false;
        if (/^[\d\W]+$/.test(sk)) return false;
        if (/^\*\*/.test(sk) || /^[*]+$/.test(sk)) return false;
        if (/^(?:Programming Languages|Work History|Skills|Education|Experience|Summary|Contact|Highlights|Professional)/i.test(sk)) return false;
        return true;
      })
      .map(s => ({
        ...s,
        skill: s.skill.replace(/^\*+\s*/, "").replace(/\*+$/, "").replace(/^[\s:\-]+/, "").trim(),
      }))
      .filter(s => s.skill.length >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 40)
      .map(s => ({
        skill: s.skill.charAt(0).toUpperCase() + s.skill.slice(1),
        count: s.count,
        frequency_percent: Math.round((s.count / data.resumeCount) * 100),
      }));

    const topVerbs = Array.from(data.actionVerbs.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
      .map(([v]) => v);

    const avgExp = data.experienceYears.length > 0
      ? Math.round(data.experienceYears.reduce((a, b) => a + b, 0) / data.experienceYears.length * 10) / 10
      : 0;

    intelligence[role] = {
      job_role: role,
      top_skills: topSkills,
      action_verbs: topVerbs,
      avg_matched_score: 0,
      avg_experience_years: avgExp,
    };
  }

  const outDir = path.join(ROOT, "lib", "ats", "data");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "role_intelligence.json"),
    JSON.stringify(intelligence, null, 2),
    "utf-8"
  );
  console.log(`\nWrote role_intelligence.json with ${Object.keys(intelligence).length} roles`);

  // ── Build role_bullets.json (best bullets per role) ──
  const roleBullets = {};
  for (const [role, data] of roleData) {
    if (data.bullets.length === 0) continue;
    // Deduplicate and pick best bullets (contain numbers/metrics, decent length)
    const seen = new Set();
    const scored = data.bullets
      .map(b => b.replace(/^\*+\s*/, "").replace(/\*+$/, "").trim())
      .filter(b => {
        if (b.length < 30 || b.length > 220) return false;
        if (/^(?:skills|education|experience|summary|contact|highlights)/i.test(b)) return false;
        const k = b.toLowerCase().slice(0, 60);
        if (seen.has(k)) return false;
        seen.add(k);
        return /[a-zA-Z]/.test(b) && !/^\[|^http/.test(b);
      })
      .map(b => ({
        text: b,
        score: (b.match(/\d/g) || []).length * 2 + (/%/.test(b) ? 5 : 0) + (/\$|₹/.test(b) ? 3 : 0) + Math.min(b.length / 20, 5),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map(b => b.text);
    if (scored.length > 0) roleBullets[role] = scored;
  }

  const dataDir = path.join(ROOT, "lib", "data");
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    path.join(dataDir, "role_bullets.json"),
    JSON.stringify(roleBullets, null, 2),
    "utf-8"
  );
  console.log(`Wrote role_bullets.json with ${Object.keys(roleBullets).length} roles`);
}

main().catch(console.error);
