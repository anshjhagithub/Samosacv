/**
 * AI orchestration: deep drafting (section expansion).
 * Streams one section at a time. Uses Mistral via getModel().
 */

import { streamText } from "ai";
import { getModel, resolveModelOptions, type ModelOptions } from "./model";
import { getDraftSystemPrompt, getDraftUserPrompt } from "./prompts";
import type { DocumentTypeId } from "@/types";
import type { OutlineSection } from "@/types";

export interface DraftSectionParams {
  documentType: DocumentTypeId;
  section: OutlineSection;
  previousSectionSummaries: string[];
  entities?: Record<string, string>;
  modelOptions?: ModelOptions | null;
}

export async function streamDraftSection(params: DraftSectionParams) {
  const { documentType, section, previousSectionSummaries, entities, modelOptions } = params;
  const resolved = resolveModelOptions(modelOptions ?? null);
  const model = getModel(resolved);

  const systemPrompt = getDraftSystemPrompt(documentType, section.title, section.description, {
    previousSections: previousSectionSummaries,
    entities,
  });
  const userPrompt = getDraftUserPrompt(section.description);

  return streamText({
    model: model as never,
    system: systemPrompt,
    prompt: userPrompt,
  });
}
