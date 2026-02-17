const STORAGE_KEY = "resume_builder_data";
const UNLOCK_PREVIEW_KEY = "resume_unlock_preview";

function isClient(): boolean {
  return typeof window !== "undefined";
}

import type { ResumeData } from "@/types/resume";

export interface UnlockPreview {
  resumeId: string;
  atsScore: number;
  missingSkills: string[];
  targetRole?: string;
}

export function loadResume(): ResumeData | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ResumeData;
  } catch {
    return null;
  }
}

export function saveResume(data: ResumeData): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save resume", e);
  }
}

export function getUnlockPreview(): UnlockPreview | null {
  if (!isClient()) return null;
  try {
    const raw = sessionStorage.getItem(UNLOCK_PREVIEW_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UnlockPreview;
  } catch {
    return null;
  }
}

export function setUnlockPreview(preview: UnlockPreview): void {
  if (!isClient()) return;
  try {
    sessionStorage.setItem(UNLOCK_PREVIEW_KEY, JSON.stringify(preview));
  } catch (e) {
    console.warn("Failed to save unlock preview", e);
  }
}

export function clearUnlockPreview(): void {
  if (!isClient()) return;
  try {
    sessionStorage.removeItem(UNLOCK_PREVIEW_KEY);
  } catch {}
}
