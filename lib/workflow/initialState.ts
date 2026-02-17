import type { DocumentWorkflowState, DocumentCategory } from "@/types";

export function createInitialState(
  overrides?: Partial<{
    documentType: string;
    category: DocumentCategory;
  }>
): DocumentWorkflowState {
  return {
    step: "input",
    input: {
      rawContent: "",
      source: "notes",
      documentType: (overrides?.documentType as any) ?? "prd",
      category: overrides?.category ?? "corporate",
      lastSavedAt: new Date().toISOString(),
    },
    outline: null,
    draft: null,
    version: 1,
    updatedAt: new Date().toISOString(),
  };
}
