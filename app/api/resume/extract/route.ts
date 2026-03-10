import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractResume } from "@/lib/ai/resume-extract";
import { validateToken, confirmGeneration } from "@/lib/supabase/edgeFunctions";
import { scoreResume, getTopMissingSkills, findRoleIntelligence, inferTargetRoleFromJobDescription } from "@/lib/ats/engine";

export const maxDuration = 60;

const ENFORCE_LIMITS = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.CONFIRM_GENERATION_SECRET
);

/** Mistral Large approximate: input ~17 paise/1K, output ~50 paise/1K (for audit). */
function apiCostPaise(promptTokens: number, completionTokens: number): number {
  const inputPaisePer1k = 17;
  const outputPaisePer1k = 50;
  return Math.ceil((promptTokens / 1000) * inputPaisePer1k + (completionTokens / 1000) * outputPaisePer1k);
}

const LINKEDIN_URL_RE = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?(\?.*)?$/i;

/** Extract text from a PDF buffer using pdf2json (Node-only, no client chunks). */
function getTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    import("pdf2json").then((mod) => {
      const PDFParser = (mod as { PDFParser?: typeof mod.default; default?: typeof mod.default }).PDFParser ?? (mod as { default: typeof mod.default }).default;
      if (!PDFParser) return reject(new Error("PDFParser not found"));
      const parser = new PDFParser(null, true);
      parser.on("pdfParser_dataError", (errMsg: { parserError?: Error } | Error) => {
        const msg = errMsg && typeof errMsg === "object" && "parserError" in errMsg ? errMsg.parserError?.message : (errMsg as Error)?.message;
        reject(new Error(msg ?? "Failed to parse PDF"));
      });
      parser.on("pdfParser_dataReady", () => {
        try {
          const text = parser.getRawTextContent()?.trim() ?? "";
          parser.destroy();
          resolve(text);
        } catch (e) {
          parser.destroy();
          reject(e);
        }
      });
      parser.parseBuffer(buffer);
    }).catch(reject);
  });
}

function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchLinkedInText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Upgrade-Insecure-Requests": "1",
    },
    redirect: "follow",
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    throw new Error(
      "LinkedIn blocks automated access. Please use “Or paste your profile text” below and copy your profile from LinkedIn in your browser."
    );
  }
  const html = await res.text();
  const text = stripHtml(html);
  const lower = text.toLowerCase();
  if (
    text.length < 100 ||
    lower.includes("sign in") ||
    lower.includes("log in") ||
    lower.includes("join linkedin") ||
    lower.includes("authwall") ||
    lower.includes("restrict")
  ) {
    throw new Error(
      "LinkedIn profile could not be read (private or login required). Paste your profile text in the box below instead."
    );
  }
  return text;
}

/**
 * Accepts:
 * - FormData: file (PDF), jobDescription?, apiKey?
 * - JSON: { content?, linkedInUrl?, jobDescription?, apiKey? }
 * When ENFORCE_LIMITS: requires either X-Generation-Token (allocate flow) or X-Resume-Order-Id (pay-first upload flow).
 */
export async function POST(request: Request) {
  const jwt = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "").trim();
  const generationToken = request.headers.get("X-Generation-Token")?.trim();
  const resumeOrderId = request.headers.get("X-Resume-Order-Id")?.trim();

  try {
    const contentType = request.headers.get("content-type") ?? "";
    let rawContent = "";
    let linkedInUrl = "";
    let jobDescription: string | undefined;
    let apiKey: string | null = null;
    let targetRoleParam: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const job = formData.get("jobDescription") as string | null;
      const key = formData.get("apiKey") as string | null;
      const role = formData.get("targetRole") as string | null;
      if (job?.trim()) jobDescription = job.trim();
      if (key?.trim()) apiKey = key.trim();
      if (role?.trim()) targetRoleParam = role.trim();
      if (!file || !(file instanceof Blob)) {
        return NextResponse.json({ error: "Upload a PDF file." }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      try {
        rawContent = await getTextFromPdfBuffer(buffer);
      } catch (e) {
        console.error("PDF parse error:", e);
        return NextResponse.json(
          { error: "Could not read PDF. Try pasting the text or use a different PDF." },
          { status: 400 }
        );
      }
      if (!rawContent || rawContent.length < 20) {
        return NextResponse.json(
          { error: "PDF appears empty or unreadable. Paste the text above instead." },
          { status: 400 }
        );
      }
    } else {
      const body = await request.json();
      rawContent = (body.content as string | undefined)?.trim() ?? "";
      linkedInUrl = (body.linkedInUrl as string | undefined)?.trim() ?? "";
      if (body.jobDescription?.trim()) jobDescription = body.jobDescription.trim();
      if (body.apiKey?.trim()) apiKey = body.apiKey.trim();
      if (typeof body.targetRole === "string" && body.targetRole.trim()) targetRoleParam = body.targetRole.trim();

      if (linkedInUrl && LINKEDIN_URL_RE.test(linkedInUrl) && rawContent.length < 50) {
        try {
          rawContent = await fetchLinkedInText(linkedInUrl);
        } catch (e) {
          console.error("LinkedIn fetch error:", e);
          return NextResponse.json(
            {
              error:
                e instanceof Error ? e.message : "We couldn't read that LinkedIn URL. Paste your profile text in the box above instead.",
            },
            { status: 400 }
          );
        }
      }

      const jobOnly = jobDescription && jobDescription.length >= 50 && (!rawContent || rawContent.length < 100);
      if (!jobOnly && (!rawContent || rawContent.length < 20)) {
        return NextResponse.json(
          {
            error: linkedInUrl
              ? "We couldn't read your LinkedIn from the URL. Paste your profile text above, or use a different source."
              : "Paste your resume text, upload a PDF, or add a job description to create a resume from a job posting.",
          },
          { status: 400 }
        );
      }
      if (jobOnly) rawContent = "";
    }

    const targetRole =
      targetRoleParam ||
      (jobDescription ? inferTargetRoleFromJobDescription(jobDescription) : null);
    let atsContext: import("@/lib/ai/resume-extract").ATSExtractContext | null = null;
    if (targetRole && (rawContent.length >= 50 || jobDescription)) {
      const textForScore = rawContent.length >= 50 ? rawContent : (jobDescription ?? "");
      const atsResult = scoreResume(textForScore, targetRole);
      const roleIntel = findRoleIntelligence(targetRole);
      atsContext = {
        targetRole,
        currentScore: atsResult.finalScore,
        breakdown: atsResult.breakdown,
        missingSkills: atsResult.missingSkills,
        roleTopSkills: roleIntel?.top_skills.map((s) => s.skill) ?? [],
        roleActionVerbs: roleIntel?.action_verbs ?? [],
      };
    }

    const { resume, usage } = await extractResume({
      content: rawContent,
      jobDescription,
      apiKey,
      atsContext: atsContext ?? undefined,
    });
    const tokens_used = (usage?.promptTokens ?? 0) + (usage?.completionTokens ?? 0);
    const api_cost_paise = usage ? apiCostPaise(usage.promptTokens, usage.completionTokens) : 0;
    if (ENFORCE_LIMITS && generationToken && generationToken !== "dev-bypass-no-limits") {
      await confirmGeneration(generationToken, {
        success: true,
        tokens_used,
        api_cost_paise,
      });
    }
    const payload: { resume: import("@/types/resume").ResumeData; atsScore?: number; missingSkills?: string[]; targetRole?: string } = { resume };
    if (atsContext) {
      payload.atsScore = atsContext.currentScore;
      payload.missingSkills = atsContext.missingSkills;
      payload.targetRole = atsContext.targetRole;
    }
    return NextResponse.json(payload);
  } catch (err) {
    if (ENFORCE_LIMITS && generationToken && generationToken !== "dev-bypass-no-limits") {
      await confirmGeneration(generationToken, { success: false });
    }
    console.error("Resume extract error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate resume" },
      { status: 500 }
    );
  }
}
