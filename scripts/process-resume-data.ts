/**
 * Step 1: Load resume_data.csv, parse list columns, clean job_position_name,
 * extract structured fields, save cleaned_resumes.json.
 *
 * Run: npx tsx scripts/process-resume-data.ts
 * Expects: data/resume_data.csv
 * Output: data/cleaned_resumes.json
 */

import * as fs from "fs";
import * as path from "path";
import type { CleanedResume } from "../lib/ats/types";

const DATA_DIR = path.join(process.cwd(), "data");
const CSV_PATH = path.join(DATA_DIR, "resume_data.csv");
const OUT_PATH = path.join(DATA_DIR, "cleaned_resumes.json");

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (inQuotes) {
      current += c;
    } else if (c === ",") {
      out.push(current.trim());
      current = "";
    } else {
      current += c;
    }
  }
  out.push(current.trim());
  return out;
}

/** Parse list-like string: "a, b, c" or "a|b|c" or '["a","b"]' or Python-style "['A', 'B']" */
function parseListString(val: string): string[] {
  if (!val || typeof val !== "string") return [];
  const trimmed = val.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      return Array.isArray(parsed) ? parsed.map((s) => String(s).trim()).filter(Boolean) : [];
    } catch {
      // Python-style: ['A', 'B'] -> replace single-quoted items for JSON
      try {
        const asJson = trimmed.replace(/'([^']*)'/g, '"$1"');
        const parsed = JSON.parse(asJson) as unknown;
        return Array.isArray(parsed) ? parsed.map((s) => String(s).trim()).filter(Boolean) : [];
      } catch {
        // fallthrough to split
      }
    }
  }
  const split = trimmed.includes("|") ? trimmed.split("|") : trimmed.split(",");
  return split.map((s) => s.replace(/^["'\s]+|["'\s]+$/g, "").trim()).filter(Boolean);
}

/** Parse responsibilities: newline- or comma-separated list of phrases. */
function parseResponsibilities(val: string): string[] {
  if (!val || typeof val !== "string") return [];
  const trimmed = val.trim();
  if (!trimmed) return [];
  const byNewline = trimmed.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  const byComma = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  const combined = byNewline.length >= byComma.length ? byNewline : byComma;
  return combined.filter((s) => s.length > 1 && s.length < 500);
}

/** Clean job_position_name: normalize spaces, title-case optional */
function cleanJobPositionName(name: string): string {
  if (!name || typeof name !== "string") return "";
  return name
    .replace(/\s+/g, " ")
    .replace(/\s*[|\-]\s*/g, " - ")
    .trim();
}

function parseNumber(val: string): number {
  if (val === undefined || val === null || val === "") return 0;
  const n = parseFloat(String(val).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Parse experience from "At least 5 year(s)" or "At least 1 year" etc. */
function parseExperienceYears(val: string): number {
  if (!val || typeof val !== "string") return 0;
  const m = val.match(/(\d+)\s*year/i);
  return m ? parseInt(m[1], 10) : parseNumber(val);
}

function main(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CSV_PATH)) {
    console.error("Missing data/resume_data.csv. Create it with columns: job_position_name, job_role, skills, responsibilities, experience_years, matched_score");
    process.exit(1);
  }

  const raw = fs.readFileSync(CSV_PATH, "utf-8");
  const rows: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c === '"') inQuotes = !inQuotes;
    else if ((c === "\n" || c === "\r") && !inQuotes) {
      if (current.trim()) rows.push(current);
      current = "";
      if (c === "\r" && raw[i + 1] === "\n") i++;
    } else current += c;
  }
  if (current.trim()) rows.push(current);
  if (rows.length < 2) {
    console.error("CSV must have header + at least one row.");
    process.exit(1);
  }

  const headers = parseCsvLine(rows[0]).map((h) => h.replace(/\uFEFF/g, "").toLowerCase().replace(/\s+/g, "_"));
  const col = (name: string) => {
    const i = headers.indexOf(name);
    return i >= 0 ? i : headers.indexOf(name.replace(/_/g, " "));
  };
  const jobPositionIdx = col("job_position_name") >= 0 ? col("job_position_name") : col("job_position") >= 0 ? col("job_position") : 0;
  const jobRoleIdx = col("job_role") >= 0 ? col("job_role") : col("jobrole") >= 0 ? col("jobrole") : jobPositionIdx;
  const skillsIdx = col("skills") >= 0 ? col("skills") : -1;
  const responsibilitiesIdx = col("responsibilities.1") >= 0 ? col("responsibilities.1") : col("responsibilities") >= 0 ? col("responsibilities") : -1;
  const experienceIdx = col("experience_years") >= 0 ? col("experience_years") : col("experiencere_requirement") >= 0 ? col("experiencere_requirement") : col("experience") >= 0 ? col("experience") : -1;
  const matchedIdx = col("matched_score") >= 0 ? col("matched_score") : col("matchedscore") >= 0 ? col("matchedscore") : -1;

  const cleaned: CleanedResume[] = [];

  for (let i = 1; i < rows.length; i++) {
    const cells = parseCsvLine(rows[i]);
    const get = (idx: number) => (idx >= 0 && idx < cells.length ? cells[idx] : "");
    const jobPositionName = get(jobPositionIdx);
    const jobRole = get(jobRoleIdx) || cleanJobPositionName(jobPositionName) || "Unknown";
    const skillsRaw = skillsIdx >= 0 ? get(skillsIdx) : "";
    const responsibilitiesRaw = responsibilitiesIdx >= 0 ? get(responsibilitiesIdx) : "";
    const experienceYears = experienceIdx >= 0 ? parseExperienceYears(get(experienceIdx)) : 0;
    const matchedScore = matchedIdx >= 0 ? parseNumber(get(matchedIdx)) : 0;

    cleaned.push({
      job_role: jobRole.trim() || "Unknown",
      job_position_name: cleanJobPositionName(jobPositionName),
      skills: parseListString(skillsRaw),
      responsibilities: parseResponsibilities(responsibilitiesRaw),
      experience_years: experienceYears,
      matched_score: matchedScore,
    });
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(cleaned, null, 2), "utf-8");
  console.log(`Wrote ${cleaned.length} records to ${OUT_PATH}`);
}

main();
