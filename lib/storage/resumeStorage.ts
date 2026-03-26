const STORAGE_KEY = "resume_builder_data";
const STORAGE_BACKUP_KEY = "resume_builder_data_backup";
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
  customerPhone?: string;
  customerEmail?: string;
  purchasedAddons?: string[];
}

export function loadResume(): ResumeData | null {
  if (!isClient()) return null;
  try {
    // Try localStorage first
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as ResumeData;
    }
    
    // Fallback: try sessionStorage backup (survives payment gateway redirects)
    try {
      const backup = sessionStorage.getItem(STORAGE_BACKUP_KEY);
      if (backup) {
        const data = JSON.parse(backup) as ResumeData;
        // Restore to localStorage so subsequent loads work
        localStorage.setItem(STORAGE_KEY, backup);
        return data;
      }
    } catch {}
    
    return null;
  } catch {
    return null;
  }
}

export function saveResume(data: ResumeData): void {
  if (!isClient()) return;
  try {
    const json = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, json);
    // Also save to sessionStorage as backup for payment redirects
    try {
      sessionStorage.setItem(STORAGE_BACKUP_KEY, json);
    } catch {}
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
