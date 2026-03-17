"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { loadResume, saveResume, getUnlockPreview } from "@/lib/storage/resumeStorage";
import { getGeneratedResult } from "@/lib/resumeFlowStorage";
import type { ResumeData, ExperienceEntry, ProjectEntry } from "@/types/resume";
import { createEmptyProject } from "@/types/resume";

const ResumePreviewPanel = dynamic(
  () =>
    import("@/components/builder/ResumePreviewPanel").then((m) => ({
      default: m.ResumePreviewPanel,
    })),
  { ssr: false }
);

// ✅ SAFE UUID (fix mobile crash)
const safeUUID = () => {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {}
  return "id-" + Math.random().toString(36).slice(2);
};

// ✅ MOBILE DETECT
const isMobile = () => {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
};

// ✅ SAFE PROJECT ENSURE
function ensureProjects(data: ResumeData): ResumeData {
  if (!data.projects || data.projects.length === 0) {
    return { ...data, projects: [createEmptyProject(safeUUID())] };
  }
  return data;
}

export default function ResumeReviewPage() {
  const [data, setData] = useState<ResumeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ LOAD DATA SAFELY
  useEffect(() => {
    try {
      const raw = loadResume();
      if (!raw) return;

      setData(ensureProjects(raw));
    } catch (e: any) {
      console.error("INIT ERROR:", e);
      setError(e?.message || "Unknown error");
    }
  }, []);

  // ✅ SAFE SAVE
  useEffect(() => {
    try {
      if (data) saveResume(data);
    } catch (e) {
      console.error("SAVE ERROR:", e);
    }
  }, [data]);

  // ✅ SAFE UPDATE FUNCTIONS
  const updateExperience = (i: number, upd: Partial<ExperienceEntry>) => {
    setData((d) => {
      if (!d?.experience) return d;
      const next = [...d.experience];
      if (!next[i]) return d;
      next[i] = { ...next[i], ...upd };
      return { ...d, experience: next };
    });
  };

  const updateProject = (i: number, upd: Partial<ProjectEntry>) => {
    setData((d) => {
      if (!d?.projects) return d;
      const next = [...d.projects];
      if (!next[i]) return d;
      next[i] = { ...next[i], ...upd };
      return { ...d, projects: next };
    });
  };

  // ✅ SAFE DOWNLOAD (NO CRASH MOBILE)
  const handleDownload = async () => {
    if (!data) return;

    try {
      if (isMobile()) {
        // 👉 MOBILE SAFE FALLBACK
        const text = JSON.stringify(data, null, 2);
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "resume.txt";
        a.click();

        URL.revokeObjectURL(url);
        alert("Mobile mode: downloaded text version.");
        return;
      }

      // 👉 DESKTOP ONLY HEAVY CODE
      const { ResumePreview } = await import("@/components/resume/ResumePreview");
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const container = document.createElement("div");
      document.body.appendChild(container);

      const { createRoot } = await import("react-dom/client");
      const root = createRoot(container);
      root.render(<ResumePreview data={data} />);

      await new Promise((r) => setTimeout(r, 200));

      const canvas = await html2canvas(container);
      const img = canvas.toDataURL("image/png");

      const pdf = new jsPDF();
      pdf.addImage(img, "PNG", 0, 0, 210, 297);
      pdf.save("resume.pdf");

      root.unmount();
      document.body.removeChild(container);
    } catch (e: any) {
      console.error("DOWNLOAD ERROR:", e);
      alert("Download failed");
    }
  };

  // ❌ SHOW ERROR IN UI (critical for mobile debugging)
  if (error) {
    return (
      <div className="p-6 text-red-600">
        <h2 className="font-bold">Error:</h2>
        <pre>{error}</pre>
      </div>
    );
  }

  if (!data) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-4">
      <button
        onClick={handleDownload}
        className="mb-4 px-4 py-2 bg-black text-white rounded"
      >
        Download Resume
      </button>

      <ResumePreviewPanel data={data} />
    </div>
  );
}
