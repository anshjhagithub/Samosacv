/**
 * Client-side persistence for document workflow state.
 * Prevents data loss; restores drafts on refresh.
 * Uses localStorage; key can be made configurable for multi-draft support.
 */

import type { DocumentWorkflowState } from "@/types";

const STORAGE_KEY = "corporate_doc_workflow";

function isClient(): boolean {
  return typeof window !== "undefined";
}

export function loadState(): DocumentWorkflowState | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DocumentWorkflowState;
    if (parsed && typeof parsed.step === "string" && parsed.input) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function saveState(state: DocumentWorkflowState): void {
  if (!isClient()) return;
  try {
    const toSave = {
      ...state,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn("Failed to persist workflow state:", e);
  }
}

export function clearState(): void {
  if (!isClient()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
