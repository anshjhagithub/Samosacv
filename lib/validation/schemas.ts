/**
 * Zod schemas for all AI outputs and document structures.
 * No untyped AI responses — every API response is validated.
 */

import { z } from "zod";

// ─── Travel context ─────────────────────────────────────────────────────────
export const travelContextSchema = z.enum(["HOTEL", "FLIGHT", "COMBINED", "NONE"]);

// ─── Outline section (recursive for subsections) ───────────────────────────
export const outlineSectionSchema: z.ZodType<{
  id: string;
  title: string;
  description: string;
  locked?: boolean;
  order: number;
  subsections?: unknown[];
  complianceBlockId?: string;
}> = z.lazy(() =>
  z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    locked: z.boolean().optional(),
    order: z.number(),
    subsections: z.array(outlineSectionSchema).optional(),
    complianceBlockId: z.string().optional(),
  })
);

// ─── AI structural intelligence response ───────────────────────────────────
export const documentOutlineSchema = z.object({
  sections: z.array(outlineSectionSchema),
  travelContext: travelContextSchema.optional(),
  entities: z.record(z.string()).optional(),
  riskFlags: z.array(z.string()).optional(),
});

export type DocumentOutlineSchema = z.infer<typeof documentOutlineSchema>;

// ─── Draft section (from deep drafting) ────────────────────────────────────
export const draftSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  order: z.number(),
});

// Streamed draft is sent section-by-section; full draft assembled client-side
export const streamedDraftSectionSchema = draftSectionSchema;

// ─── Structural intelligence intent/entities (optional intermediate) ─────────
export const intentDetectionSchema = z.object({
  documentIntent: z.string(),
  suggestedCategory: z.enum(["corporate", "legal", "finance"]),
  suggestedType: z.string(),
  keyEntities: z.record(z.string()).optional(),
  risks: z.array(z.string()).optional(),
  travelContext: travelContextSchema.optional(),
});

export type IntentDetectionSchema = z.infer<typeof intentDetectionSchema>;
