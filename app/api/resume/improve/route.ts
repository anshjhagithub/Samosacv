import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { improveResumeText } from "@/lib/ai/resume-improve";
import {
  hasUnlimitedImproves,
  consumeImproveCredit,
  type ImproveFeatureType,
} from "@/lib/improveCredits";
import { FEATURE_PRICING } from "@/lib/pricing";

export const maxDuration = 30;

const IMPROVE_PROMPT_TO_FEATURE: Record<string, ImproveFeatureType> = {
  improve_summary: "summary_improve",
  improve_project: "project_improve",
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to use AI improve" }, { status: 401 });
    }

    const body = await request.json();
    const text = body.text as string | undefined;
    const prompt = body.prompt as "improve_bullet" | "improve_summary" | "suggest_bullets" | "improve_project" | undefined;
    const context = body.context as string | undefined;
    const apiKey = body.apiKey as string | undefined;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }
    const allowedPrompts = ["improve_bullet", "improve_summary", "suggest_bullets", "improve_project"];
    if (!prompt || !allowedPrompts.includes(prompt)) {
      return NextResponse.json({ error: "prompt must be improve_bullet, improve_summary, suggest_bullets, or improve_project" }, { status: 400 });
    }

    const featureType = IMPROVE_PROMPT_TO_FEATURE[prompt];
    const requiresPayment = !!featureType;

    if (requiresPayment) {
      if (hasUnlimitedImproves(user.email)) {
        // no-op: run AI below without consuming
      } else {
        const consumed = await consumeImproveCredit(user.id, featureType);
        if (!consumed) {
          const amount = FEATURE_PRICING[featureType];
          return NextResponse.json(
            {
              error: `Pay ₹${amount} to unlock this improvement`,
              code: "PAYMENT_REQUIRED",
              amount,
              feature: featureType,
              preview: "Stronger verbs, ATS-friendly. Pay ₹5 to see full result.",
            },
            { status: 402 }
          );
        }
      }
    }

    const result = await improveResumeText({
      text,
      prompt,
      context,
      apiKey: apiKey?.trim() || null,
    });
    return NextResponse.json({ text: result });
  } catch (err) {
    console.error("Resume improve error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to improve text" },
      { status: 500 }
    );
  }
}
