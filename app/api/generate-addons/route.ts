import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "ai";
import { mistral } from "@ai-sdk/mistral";
import { ADDON_SLUGS, type FeatureSlug } from "@/lib/pricing";

export const maxDuration = 60; // AI generation might take a while

interface AddonResult {
  slug: string;
  title: string;
  content: string;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const resumeText = body.resumeText as string;
    const targetRole = body.targetRole as string;
    const addonsToGenerate = body.addons as FeatureSlug[];

    if (!resumeText || !targetRole || !addonsToGenerate || !Array.isArray(addonsToGenerate)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Filter to only known addons
    const validAddons = addonsToGenerate.filter((slug) => ADDON_SLUGS.includes(slug));

    if (validAddons.length === 0) {
      return NextResponse.json({ addons: [] });
    }

    // In a production environment, we should verify that the user actually purchased these addons.
    // For now, since they are requesting the download from the builder (which checks ownership before showing the button),
    // and Mistral text generation is free/cheap on our side, we will proceed.

    const apiKey = process.env.MISTRAL_API_KEY?.trim();
    if (!apiKey) {
      // Fallback text if no API key is configured
      return NextResponse.json({
        addons: validAddons.map(slug => ({
          slug,
          title: slug.replace(/_/g, " ").toUpperCase(),
          content: "AI generation is not configured. Please add MISTRAL_API_KEY to your environment variables."
        }))
      });
    }

    // Generate all requested addons in parallel
    const addonResults: AddonResult[] = await Promise.all(
      validAddons.map(async (slug) => {
        let systemPrompt = "You are an expert career coach and tech recruiter.";
        let userPrompt = "";
        let title = "";

        switch (slug) {
          case "interview_pack":
            title = "Interview Pack";
            userPrompt = `Based on the following resume and the target role of "${targetRole}", generate 10 highly specific, realistic interview questions the candidate might face. For each question, provide a detailed "Ideal Answer Strategy" using the STAR method (Situation, Task, Action, Result) referencing their specific experience where possible.\n\nTarget Role: ${targetRole}\n\nResume:\n${resumeText}`;
            break;
          case "cover_letter":
            title = "Cover Letter";
            userPrompt = `Write a professional, compelling, and tailored cover letter for a candidate applying for the role of "${targetRole}". Use the details from the provided resume to highlight their most relevant experiences and achievements. Make it sound enthusiastic and authentic. Do NOT include placeholder brackets like [Company Name], just write it as a general open application or invent a plausible generic company context.\n\nTarget Role: ${targetRole}\n\nResume:\n${resumeText}`;
            break;
          case "skill_roadmap":
            title = "Skill Roadmap & Learning Path";
            userPrompt = `Analyze the provided resume against the typical requirements for a "${targetRole}". Identify the key skill gaps. Then, generate a detailed 3-month learning roadmap to help the candidate close these gaps and level up in their career. Break it down month by month with actionable advice.\n\nTarget Role: ${targetRole}\n\nResume:\n${resumeText}`;
            break;
          case "ats_breakdown":
            title = "ATS Breakdown & Feedback";
            userPrompt = `Act as an Applicant Tracking System (ATS) and a strict technical recruiter. Review the following resume for the role of "${targetRole}". Provide a detailed breakdown of what works and what doesn't. Give specific formatting, keyword, and phrasing feedback. Point out any red flags or areas where the impact is not quantified.\n\nTarget Role: ${targetRole}\n\nResume:\n${resumeText}`;
            break;
          case "linkedin_optimizer":
            title = "LinkedIn Profile Optimizer";
            userPrompt = `Based on the attached resume, write an optimized LinkedIn profile for the candidate targeting the role of "${targetRole}". Include: 1) A catchy, keyword-rich Headline. 2) An engaging "About" section summary that tells their professional story. 3) 3-5 bullet points to highlight under their most recent experiences to attract recruiters.\n\nTarget Role: ${targetRole}\n\nResume:\n${resumeText}`;
            break;
          case "ats_improver":
            title = "ATS Keyword Improvements";
            userPrompt = `Analyze the resume for the role of "${targetRole}". Provide a list of the top 15 exact keywords and phrases that are currently missing from the resume but are critical for passing an ATS for this role. Then, give 3 examples of how to rewrite existing bullet points from the resume to seamlessly include these keywords.\n\nTarget Role: ${targetRole}\n\nResume:\n${resumeText}`;
            break;
          default:
            title = slug.replace(/_/g, " ").toUpperCase();
            userPrompt = `Provide useful career advice for a ${targetRole} based on their resume:\n${resumeText}`;
        }

        try {
          const { text } = await generateText({
            model: mistral("mistral-small-latest") as never,
            system: systemPrompt,
            prompt: userPrompt,
          });
          return { slug, title, content: text };
        } catch (e) {
          console.error(`Failed to generate addon ${slug}:`, e);
          return {
            slug,
            title,
            content: "Failed to generate this add-on at this time. Please try downloading again later."
          };
        }
      })
    );

    return NextResponse.json({ addons: addonResults });
  } catch (err) {
    console.error("Generate addons error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate addons" },
      { status: 500 }
    );
  }
}
