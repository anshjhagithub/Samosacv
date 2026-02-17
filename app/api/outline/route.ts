import { NextResponse } from "next/server";
import { generateOutline } from "@/lib/ai/outline";
import type { DocumentTypeId } from "@/types";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawContent = body.rawContent as string | undefined;
    const documentType = body.documentType as DocumentTypeId | undefined;
    const modelOptions =
      body.apiKey != null && String(body.apiKey).trim()
        ? { apiKey: String(body.apiKey).trim() }
        : null;

    if (!rawContent || typeof rawContent !== "string") {
      return NextResponse.json(
        { error: "rawContent is required and must be a string" },
        { status: 400 }
      );
    }
    if (!documentType) {
      return NextResponse.json(
        { error: "documentType is required" },
        { status: 400 }
      );
    }

    const { outline } = await generateOutline({
      rawContent,
      documentType,
      modelOptions: modelOptions ?? undefined,
    });
    return NextResponse.json({ outline });
  } catch (err) {
    console.error("Outline API error:", err);
    const message = err instanceof Error ? err.message : "Outline generation failed";
    const isKeyError =
      message.toLowerCase().includes("api key") ||
      message.toLowerCase().includes("invalid") ||
      message.toLowerCase().includes("valid api key");
    const friendlyError = isKeyError
      ? "Mistral API key was rejected. Set MISTRAL_API_KEY in .env and restart the dev server, or open Settings and enter a valid Mistral key."
      : message;
    return NextResponse.json({ error: friendlyError }, { status: 500 });
  }
}
