import { NextResponse } from "next/server";
import { improveResumeText } from "@/lib/ai/resume-improve";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = body.text as string | undefined;
    const prompt = body.prompt as "improve_bullet" | "improve_summary" | "suggest_bullets" | undefined;
    const context = body.context as string | undefined;
    const apiKey = body.apiKey as string | undefined;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }
    if (!prompt || !["improve_bullet", "improve_summary", "suggest_bullets"].includes(prompt)) {
      return NextResponse.json({ error: "prompt must be improve_bullet, improve_summary, or suggest_bullets" }, { status: 400 });
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
