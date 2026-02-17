import { streamText } from "ai";
import { getDraftSystemPrompt, getDraftUserPrompt } from "@/lib/ai/prompts";
import { getModel, resolveModelOptions } from "@/lib/ai/model";
import type { DocumentTypeId } from "@/types";
import type { OutlineSection } from "@/types";

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const documentType = body.documentType as DocumentTypeId | undefined;
    const section = body.section as OutlineSection | undefined;
    const previousSectionSummaries = (body.previousSectionSummaries as string[]) ?? [];
    const entities = body.entities as Record<string, string> | undefined;
    const modelOptions =
      body.apiKey != null && String(body.apiKey).trim()
        ? { apiKey: String(body.apiKey).trim() }
        : null;

    if (!documentType || !section?.id || !section?.title || section?.description == null) {
      return new Response(
        JSON.stringify({ error: "documentType and section (id, title, description) are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const resolved = resolveModelOptions(modelOptions);
    const model = getModel(resolved);

    const systemPrompt = getDraftSystemPrompt(documentType, section.title, section.description, {
      previousSections: previousSectionSummaries,
      entities,
    });
    const userPrompt = getDraftUserPrompt(section.description);

    const result = await streamText({
      model: model as never,
      system: systemPrompt,
      prompt: userPrompt,
    });

    // Plain text stream so client can read with response.body.getReader() without SDK protocol
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(new TextEncoder().encode(chunk));
          }
        } finally {
          controller.close();
        }
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" },
    });
  } catch (err) {
    console.error("Draft API error:", err);
    const message = err instanceof Error ? err.message : "Draft streaming failed";
    const isKeyError =
      message.toLowerCase().includes("api key") ||
      message.toLowerCase().includes("invalid") ||
      message.toLowerCase().includes("valid api key");
    const friendlyError = isKeyError
      ? "Mistral API key was rejected. Check .env (MISTRAL_API_KEY) or Settings."
      : message;
    return new Response(JSON.stringify({ error: friendlyError }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
