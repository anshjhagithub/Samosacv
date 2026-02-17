import { generateText } from "ai";
import { getModel, resolveModelOptions } from "./model";

export async function improveResumeText(params: {
  text: string;
  prompt: "improve_bullet" | "improve_summary" | "suggest_bullets";
  context?: string;
  apiKey?: string | null;
}): Promise<string> {
  const { text, prompt, context, apiKey } = params;
  const resolved = resolveModelOptions(apiKey ? { apiKey } : null);
  const model = getModel(resolved);

  const instructions: Record<string, string> = {
    improve_bullet:
      "Rewrite this resume bullet point to be more impactful. Use strong action verbs and quantify where possible. Keep it to one clear sentence. Return only the rewritten bullet, no explanation.",
    improve_summary:
      "Rewrite this professional summary to be more compelling and concise (2-4 sentences). Return only the new summary, no explanation.",
    suggest_bullets:
      "Suggest 3 resume bullet points for this role/company. Each on a new line, starting with a strong action verb. Return only the 3 bullets, one per line, no numbering or explanation.",
  };

  const userMessage = context
    ? `${instructions[prompt]}\n\nText: ${text}\n\nContext: ${context}`
    : `${instructions[prompt]}\n\nText: ${text}`;

  const { text: result } = await generateText({
    model: model as never,
    system: "You are a professional resume writer. Be concise. Return only the requested text.",
    prompt: userMessage,
  });

  return result?.trim() ?? text;
}
