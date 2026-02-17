/**
 * AI orchestration: structural intelligence (outline generation).
 * Uses Mistral (MISTRAL_API_KEY or user key from Settings).
 */

import { generateObject } from "ai";
import { documentOutlineSchema, type DocumentOutlineSchema } from "@/lib/validation/schemas";
import { getOutlineSystemPrompt, getOutlineUserPrompt } from "./prompts";
import { getModel, resolveModelOptions, type ModelOptions } from "./model";
import type { DocumentTypeId } from "@/types";

export interface GenerateOutlineParams {
  rawContent: string;
  documentType: DocumentTypeId;
  /** Optional: use this Mistral API key; else server uses MISTRAL_API_KEY. */
  modelOptions?: ModelOptions | null;
}

export async function generateOutline(
  params: GenerateOutlineParams
): Promise<{ outline: DocumentOutlineSchema; raw: string }> {
  const { rawContent, documentType, modelOptions } = params;
  const resolved = resolveModelOptions(modelOptions ?? null);
  const model = getModel(resolved);

  const systemPrompt = getOutlineSystemPrompt(documentType);
  const userPrompt = getOutlineUserPrompt(rawContent);

  const { object } = await generateObject({
    model: model as never,
    schema: documentOutlineSchema,
    system: systemPrompt,
    prompt: userPrompt,
  });

  return { outline: object, raw: JSON.stringify(object) };
}
