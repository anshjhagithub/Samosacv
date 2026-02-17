/**
 * AI prompts for structural intelligence and deep drafting.
 * Domain-specific instructions; no hallucinated structure.
 */

import type { DocumentTypeId } from "@/types";
import { documentRegistry } from "@/engine/registry";

const TRAVEL_INSTRUCTION = `
If the user's content clearly relates to travel (bookings, itineraries, accommodations, flights), classify travel context as one of: HOTEL, FLIGHT, or COMBINED.
Otherwise use NONE.
When HOTEL, FLIGHT, or COMBINED, generate structured subsections under relevant sections (e.g. accommodation details, flight details).
`;

export function getOutlineSystemPrompt(documentType: DocumentTypeId): string {
  const descriptor = documentRegistry.getDescriptor(documentType);
  const hints = descriptor?.defaultSectionHints?.length
    ? `Suggested section titles (adapt to content): ${descriptor.defaultSectionHints.join(", ")}.`
    : "";

  return `You are an enterprise document analyst. Your task is to analyze raw input and produce a structured outline suitable for the selected document type.

Document type: ${documentType}
${hints}

Rules:
1. Detect document intent and extract key entities (parties, dates, amounts, deliverables) where present.
2. Identify risks or ambiguities and list them as riskFlags.
3. Output a valid JSON object with: sections (array), optional travelContext, optional entities (object), optional riskFlags (string array).
4. Each section must have: id (short unique string, e.g. "sec_1"), title, description, order (number). Optional: locked (boolean), subsections (array of same shape for travel), complianceBlockId (string).
5. Section order must be logical for the document type. Do not invent sections that are not suggested by the content.
6. ${TRAVEL_INSTRUCTION}
7. Return ONLY valid JSON, no markdown code fence or extra text.`;
}

export function getOutlineUserPrompt(rawContent: string): string {
  return `Analyze the following raw input and generate a structured outline as specified. Return only the JSON object.\n\n---\n\n${rawContent.slice(0, 30000)}`;
}

// ─── Deep drafting ─────────────────────────────────────────────────────────

export function getDraftSystemPrompt(
  documentType: DocumentTypeId,
  sectionTitle: string,
  sectionDescription: string,
  context: { previousSections?: string[]; entities?: Record<string, string> }
): string {
  const descriptor = documentRegistry.getDescriptor(documentType);
  const isLegal = descriptor?.requiresLegalLayer ?? false;
  const isFinance = descriptor?.requiresFinanceLayer ?? false;

  let domain = "Use a professional, corporate tone. Be precise and structured.";
  if (isLegal) {
    domain += " Use formal legal language. Do not state binding legal conclusions; frame as contractual provisions. Flag any ambiguous clauses in a short 'AmbiguousClauses' line if needed.";
  }
  if (isFinance) {
    domain += " Present numbers in clear tables where applicable. Use INR unless otherwise specified. Include an assumptions subsection if making projections. Flag unrealistic projections if any.";
  }

  return `You are an expert document drafter. Expand the following section into full professional prose for a ${documentType} document.

Section to expand:
Title: ${sectionTitle}
Description: ${sectionDescription}

${context.previousSections?.length ? `Previous section summaries (for continuity):\n${context.previousSections.join("\n")}` : ""}
${context.entities && Object.keys(context.entities).length ? `Key entities to use consistently:\n${JSON.stringify(context.entities)}` : ""}

Rules:
1. ${domain}
2. Do not invent new sections or headings beyond this one section.
3. Output only the drafted content for this section (no JSON, no meta). Use markdown for lists and tables if needed.`;
}

export function getDraftUserPrompt(sectionDescription: string): string {
  return `Expand this section into full professional content:\n\n${sectionDescription}`;
}
