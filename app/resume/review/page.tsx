"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { loadResume, saveResume, getUnlockPreview } from "@/lib/storage/resumeStorage";
import { getGeneratedResult } from "@/lib/resumeFlowStorage";
import type { ResumeData, ExperienceEntry, ProjectEntry } from "@/types/resume";
import { createEmptyProject } from "@/types/resume";
import { UnlockPdfModal } from "@/components/resume-flow/UnlockPdfModal";
import type { ResumeModifier } from "@/lib/ai/resume-modify";

const ResumePreviewPanel = dynamic(
  () => import("@/components/builder/ResumePreviewPanel").then((m) => ({ default: m.ResumePreviewPanel })),
  { ssr: false, loading: () => <div className="rounded-2xl border border-stone-200 bg-stone-50 min-h-[500px] animate-pulse" /> }
);

const inputClass =
  "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none text-sm";

const MODIFIERS: { id: ResumeModifier; label: string }[] = [
  { id: "impactful", label: "Make More Impactful" },
  { id: "technical", label: "Make More Technical" },
  { id: "leadership", label: "Make Leadership Focused" },
  { id: "ats", label: "Optimize for ATS" },
];

function ensureProjects(data: ResumeData): ResumeData {
  if (data.projects && data.projects.length > 0) return data;
  return { ...data, projects: [createEmptyProject(crypto.randomUUID?.() ?? "proj-1")] };
}

export default function ResumeReviewPage() {
  const router = useRouter();
  const [data, setData] = useState<ResumeData | null>(null);
  const [generated, setGenerated] = useState<ReturnType<typeof getGeneratedResult>>(null);
  const [modifierLoading, setModifierLoading] = useState<ResumeModifier | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [hasPaymentSuccess, setHasPaymentSuccess] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);

  useEffect(() => {
    const raw = loadResume();
    setGenerated(getGeneratedResult());
    setData(raw ? ensureProjects(raw) : null);
    
    // Get resume ID from unlock preview
    const preview = getUnlockPreview();
    if (preview) {
      setResumeId(preview.resumeId);
    }
    
    // Check if user has successful payment for download access
    if (preview?.resumeId) {
      checkPaymentStatus(preview.resumeId);
    }
  }, []);

  const checkPaymentStatus = async (resumeId: string) => {
    try {
      const res = await fetch(`/api/resume/download?resume_id=${resumeId}`);
      if (res.ok) {
        setHasPaymentSuccess(true);
      } else if (res.status === 402) {
        setHasPaymentSuccess(false);
      }
    } catch (error) {
      console.error("Payment status check failed:", error);
      setHasPaymentSuccess(false);
    }
  };

  const persist = useCallback((next: ResumeData) => {
    setData(next);
    saveResume(next);
  }, []);

  useEffect(() => {
    if (data) saveResume(data);
  }, [data]);

  const applyModifier = async (modifier: ResumeModifier) => {
    if (!data) return;
    setModifierLoading(modifier);
    try {
      const res = await fetch("/api/resume/modify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: data, modifier }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      persist(json.resume);
    } catch (e) {
      console.error(e);
    } finally {
      setModifierLoading(null);
    }
  };

  const updateSummary = (v: string) => setData((d) => (d ? { ...d, summary: v } : d));
  const updateExperience = (i: number, upd: Partial<ExperienceEntry>) => {
    setData((d) => {
      if (!d?.experience) return d;
      const next = [...d.experience];
      next[i] = { ...next[i], ...upd };
      return { ...d, experience: next };
    });
  };
  const updateProject = (i: number, upd: Partial<ProjectEntry>) => {
    setData((d) => {
      if (!d?.projects) return d;
      const next = [...d.projects];
      next[i] = { ...next[i], ...upd };
      return { ...d, projects: next };
    });
  };
  const updateSkills = (skills: string[]) => setData((d) => (d ? { ...d, skills } : d));

  const handleMaybeLaterDownload = async () => {
    if (!data) return;
    
    try {
      // Create HTML content for PDF
      const htmlContent = createResumeHtml(data);
      
      // Download PDF (as HTML for now)
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      const htmlUrl = URL.createObjectURL(htmlBlob);
      const htmlLink = document.createElement('a');
      htmlLink.href = htmlUrl;
      htmlLink.download = `resume-${data.personal?.fullName || 'document'}-${Date.now()}.html`;
      document.body.appendChild(htmlLink);
      htmlLink.click();
      document.body.removeChild(htmlLink);
      URL.revokeObjectURL(htmlUrl);
      
      // Create DOC content
      const docContent = createResumeDoc(data);
      const docBlob = new Blob([docContent], { type: 'application/msword' });
      const docUrl = URL.createObjectURL(docBlob);
      const docLink = document.createElement('a');
      docLink.href = docUrl;
      docLink.download = `resume-${data.personal?.fullName || 'document'}-${Date.now()}.doc`;
      document.body.appendChild(docLink);
      docLink.click();
      document.body.removeChild(docLink);
      URL.revokeObjectURL(docUrl);
      
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again.');
    }
  };

  const createResumeHtml = (resumeData: ResumeData) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Resume</title>
        <style>
          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
          .resume-container { max-width: 21cm; margin: 0 auto; }
          h1 { color: #333; }
          h2 { color: #555; border-bottom: 2px solid #eee; padding-bottom: 5px; }
          h3 { color: #666; }
          .contact { color: #666; margin-bottom: 20px; }
          ul { padding-left: 20px; }
          li { margin-bottom: 5px; }
        </style>
      </head>
      <body>
        <div class="resume-container">
          <h1>${resumeData.personal?.fullName || 'Resume'}</h1>
          <p class="contact">${resumeData.personal?.title || ''}</p>
          <p class="contact">${resumeData.personal?.email || ''} | ${resumeData.personal?.phone || ''}</p>
          
          <h2>Summary</h2>
          <p>${resumeData.summary || ''}</p>
          
          <h2>Experience</h2>
          ${resumeData.experience.map(exp => `
            <div style="margin-bottom: 20px;">
              <h3>${exp.jobTitle} at ${exp.company}</h3>
              <p style="color: #666;">${exp.startDate} - ${exp.endDate}</p>
              <ul>
                ${exp.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
          
          <h2>Education</h2>
          ${resumeData.education.map(edu => `
            <div style="margin-bottom: 15px;">
              <h3>${edu.degree} in ${edu.field}</h3>
              <p style="color: #666;">${edu.school}</p>
              <p style="color: #666;">${edu.startDate} - ${edu.endDate}</p>
            </div>
          `).join('')}
          
          <h2>Skills</h2>
          <p>${(resumeData.skills || []).join(', ')}</p>
        </div>
      </body>
      </html>
    `;
  };

  const createResumeDoc = (resumeData: ResumeData) => {
    return `
      Resume - ${resumeData.personal?.fullName || 'Document'}
      
      ${resumeData.personal?.fullName || ''}
      ${resumeData.personal?.title || ''}
      ${resumeData.personal?.email || ''} | ${resumeData.personal?.phone || ''}
      
      SUMMARY
      ${resumeData.summary || ''}
      
      EXPERIENCE
      ${resumeData.experience.map(exp => `
      ${exp.jobTitle} at ${exp.company}
      ${exp.startDate} - ${exp.endDate}
      ${exp.bullets.map(bullet => `• ${bullet}`).join('\n      ')}
      `).join('\n')}
      
      EDUCATION
      ${resumeData.education.map(edu => `
      ${edu.degree} in ${edu.field}
      ${edu.school}
      ${edu.startDate} - ${edu.endDate}
      `).join('\n')}
      
      SKILLS
      ${(resumeData.skills || []).join(', ')}
    `;
  };

  if (data === null) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500 mb-4">No resume found. Build one first.</p>
        <Link href="/create" className="text-amber-600 font-medium hover:underline">
          Start from scratch
        </Link>
      </div>
    );
  }

  const atsScore = Math.min(100, generated?.atsScore ?? 0);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-stone-100 px-4 py-2">
            <span className="text-xs text-stone-500 uppercase tracking-wider">ATS Score</span>
            <p className="text-xl font-bold text-stone-900">{atsScore}</p>
          </div>
          <div className="rounded-xl bg-amber-50 px-4 py-2">
            <span className="text-xs text-stone-500 uppercase tracking-wider">Resume Strength</span>
            <p className="text-lg font-semibold text-amber-800">
              {atsScore >= 90 ? "Strong" : atsScore >= 70 ? "Good" : "Needs work"}
            </p>
          </div>
        </div>
        {atsScore < 90 && (
          <p className="text-sm text-stone-500">
            Scores below 90 are often rejected by ATS. Use &ldquo;Optimize for ATS&rdquo; or unlock ATS Improver (&#8377;15).
          </p>
        )}
      </div>

      {/* Actions bar - visible at top for mobile */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Link
          href="/builder"
          className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-all shadow-md shadow-amber-900/10"
        >
          Open Full Builder
        </Link>
        {hasPaymentSuccess && resumeId ? (
          <button
            type="button"
            onClick={async () => {
              // Trigger actual download since payment was successful
              try {
                const response = await fetch(`/api/resume/download?resume_id=${resumeId}`);
                if (response.ok) {
                  const html = await response.text();
                  const blob = new Blob([html], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `resume-${Date.now()}.html`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                } else {
                  alert('Download failed. Please try again.');
                }
              } catch (error) {
                console.error('Download error:', error);
                alert('Download failed. Please try again.');
              }
            }}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-all shadow-md shadow-emerald-900/10"
          >
            Download Resume
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowUnlockModal(true)}
            className="rounded-xl border-2 border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-100 transition-all"
          >
            Download PDF
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Summary</label>
            <textarea
              className={inputClass}
              rows={4}
              value={data.summary}
              onChange={(e) => updateSummary(e.target.value)}
              placeholder="Professional summary"
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-stone-700 mb-2">Experience</h3>
            {data.experience.map((exp, i) => (
              <div key={exp.id} className="mb-4 rounded-xl border border-stone-200 p-4 space-y-2">
                <input
                  className={inputClass}
                  value={exp.jobTitle}
                  onChange={(e) => updateExperience(i, { jobTitle: e.target.value })}
                  placeholder="Job title"
                />
                <input
                  className={inputClass}
                  value={exp.company}
                  onChange={(e) => updateExperience(i, { company: e.target.value })}
                  placeholder="Company"
                />
                {(exp.bullets ?? [""]).map((b, j) => (
                  <input
                    key={j}
                    className={inputClass}
                    value={b}
                    onChange={(e) => {
                      const bullets = [...(exp.bullets ?? [""])];
                      bullets[j] = e.target.value;
                      updateExperience(i, { bullets });
                    }}
                    placeholder="Bullet point"
                  />
                ))}
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-sm font-medium text-stone-700 mb-2">Projects</h3>
            {(data.projects ?? []).map((proj, i) => (
              <div key={proj.id} className="mb-4 rounded-xl border border-stone-200 p-4 space-y-2">
                <input
                  className={inputClass}
                  value={proj.title}
                  onChange={(e) => updateProject(i, { title: e.target.value })}
                  placeholder="Project title"
                />
                <textarea
                  className={inputClass}
                  rows={2}
                  value={proj.description}
                  onChange={(e) => updateProject(i, { description: e.target.value })}
                  placeholder="Description"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Skills (comma-separated)</label>
            <input
              className={inputClass}
              value={(data.skills ?? []).join(", ")}
              onChange={(e) => updateSkills(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              placeholder="Python, SQL, React, ..."
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {MODIFIERS.map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={!!modifierLoading}
                onClick={() => applyModifier(m.id)}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-amber-50 hover:border-amber-200 disabled:opacity-60"
              >
                {modifierLoading === m.id ? "Applying…" : m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-24 self-start">
          <ResumePreviewPanel
            data={data}
            onTemplateChange={(tid) => setData((d) => (d ? { ...d, templateId: tid } : d))}
            onDownload={() => setShowUnlockModal(true)}
          />
          <div className="mt-4 hidden lg:flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowUnlockModal(true)}
              className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
            >
              Download PDF
            </button>
            <Link
              href="/builder"
              className="rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Open full builder
            </Link>
          </div>
        </div>
      </div>

      <UnlockPdfModal
        open={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        onUnlock={() => router.push("/unlock")}
        onMaybeLater={handleMaybeLaterDownload}
        atsScore={atsScore}
      />
    </div>
  );
}