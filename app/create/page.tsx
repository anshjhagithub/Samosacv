"use client";
// Create page: Get started → first screen: Start from scratch, Import resume, Create from JD. No limits fetch.

import { Suspense, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { saveResume, setUnlockPreview } from "@/lib/storage/resumeStorage";
import { SiteHeader } from "@/components/layout/SiteHeader";

type View = "choice" | "upload";

function CreatePageContent() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<View>("choice");
  const [content, setContent] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showJobDesc, setShowJobDesc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const canSubmit = content.trim().length > 0 || !!file;

  useEffect(() => {
    if (submitError && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [submitError]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!canSubmit) {
      setSubmitError("Paste your resume text or upload a PDF.");
      return;
    }
    setLoading(true);
    try {
      let res: Response;
      if (file && !content.trim()) {
        const formData = new FormData();
        formData.append("file", file);
        if (jobDescription.trim()) formData.append("jobDescription", jobDescription.trim());
        res = await fetch("/api/resume/extract", { method: "POST", body: formData });
      } else {
        res = await fetch("/api/resume/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: content.trim() || "", jobDescription: jobDescription.trim() || undefined }),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        const raw = data.error ?? "Failed to generate resume";
        const friendly =
          typeof raw === "string" && /edge function|failed to send/i.test(raw)
            ? "Something went wrong. Please try again."
            : raw;
        setSubmitError(friendly);
        return;
      }
      saveResume(data.resume);
      const resumeId = crypto.randomUUID?.() ?? `res-${Date.now()}`;
      setUnlockPreview({
        resumeId,
        atsScore: data.atsScore ?? 0,
        missingSkills: data.missingSkills ?? [],
        targetRole: data.targetRole,
      });
      router.push("/builder");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setSubmitError(/edge function|failed to send/i.test(msg) ? "Something went wrong. Please try again." : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/90 via-orange-50/50 to-amber-100/80" data-create-page="choice-upload" data-create-version="no-limits">
      <SiteHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
        {!mounted ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-stone-500 text-sm">Loading…</p>
          </div>
        ) : (
        <AnimatePresence mode="wait">
          {view === "choice" ? (
            <motion.div
              key="choice"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
                Get started
              </h1>
              <p className="text-stone-600 text-sm mb-10">
                Choose how you want to build your resume
              </p>

              <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
                {/* 1. Start from scratch — first */}
                <motion.a
                  href="/resume/start"
                  className="group relative rounded-2xl border-2 border-amber-200 bg-white/90 backdrop-blur p-5 sm:p-6 text-left shadow-md hover:border-amber-400 hover:shadow-lg hover:bg-amber-50/80 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-amber-50 no-underline"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-stone-100 text-stone-600 mb-3 group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </span>
                  <h2 className="text-base font-semibold text-stone-900 mb-1">Start from scratch</h2>
                  <p className="text-stone-500 text-xs">
                    Name + target role. We&apos;ll guide you step by step.
                  </p>
                  <span className="inline-flex items-center gap-1 mt-3 text-amber-600 font-medium text-sm group-hover:gap-2 transition-all">
                    Continue
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </span>
                </motion.a>

                {/* 2. Import resume */}
                <motion.button
                  type="button"
                  onClick={() => setView("upload")}
                  className="group relative rounded-2xl border-2 border-amber-200 bg-white/90 backdrop-blur p-5 sm:p-6 text-left shadow-md hover:border-amber-400 hover:shadow-lg hover:bg-amber-50/80 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-amber-50"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-100 text-amber-700 mb-3 group-hover:bg-amber-200 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </span>
                  <h2 className="text-base font-semibold text-stone-900 mb-1">Import your resume</h2>
                  <p className="text-stone-500 text-xs">
                    Paste text or upload a PDF. We&apos;ll open the builder.
                  </p>
                  <span className="inline-flex items-center gap-1 mt-3 text-amber-600 font-medium text-sm group-hover:gap-2 transition-all">
                    Continue
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </span>
                </motion.button>

                {/* 3. Create from job description */}
                <motion.a
                  href="/create/job-description"
                  className="group relative rounded-2xl border-2 border-amber-200 bg-white/90 backdrop-blur p-5 sm:p-6 text-left shadow-md hover:border-amber-400 hover:shadow-lg hover:bg-amber-50/80 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-amber-50 no-underline block"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-stone-100 text-stone-600 mb-3 group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </span>
                  <h2 className="text-base font-semibold text-stone-900 mb-1">Create from job description</h2>
                  <p className="text-stone-500 text-xs">
                    Paste a job posting. We&apos;ll generate a tailored resume.
                  </p>
                  <span className="inline-flex items-center gap-1 mt-3 text-amber-600 font-medium text-sm group-hover:gap-2 transition-all">
                    Continue
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </span>
                </motion.a>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <button
                type="button"
                onClick={() => { setView("choice"); setSubmitError(null); setContent(""); setFile(null); setJobDescription(""); setShowJobDesc(false); }}
                className="mb-6 flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to options
              </button>

              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 mb-1">
                Import your resume
              </h1>
              <p className="text-stone-500 text-sm mb-6">
                Paste text or upload a PDF. We&apos;ll open the builder when ready.
              </p>

              <form
                onSubmit={handleGenerate}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") e.preventDefault();
                }}
                className="space-y-4 max-w-xl"
                noValidate
              >
                {submitError && (
                  <div
                    ref={errorRef}
                    className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm"
                    role="alert"
                  >
                    {submitError}
                  </div>
                )}

                <div className="rounded-xl border-2 border-amber-200/80 bg-white/95 shadow-md p-4 sm:p-5">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your resume or career info here…"
                    rows={6}
                    className="w-full rounded-lg border-2 border-amber-200/80 bg-white px-3 py-3 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-sm resize-y min-h-[120px]"
                  />
                  <p className="text-stone-400 text-xs mt-3 text-center">or</p>
                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => {
                        setFile(e.target.files?.[0] ?? null);
                        setSubmitError(null);
                      }}
                      className="sr-only"
                      aria-label="Upload PDF"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-amber-200 bg-amber-50/70 px-4 py-2.5 text-sm font-medium text-stone-600 hover:border-amber-400 hover:bg-amber-100/80 transition-all"
                    >
                      <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      {file ? file.name : "Upload PDF"}
                    </button>
                    {file && (
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-xs text-stone-500 hover:text-red-600 sm:ml-1"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {showJobDesc ? (
                  <div className="rounded-xl border-2 border-amber-200/80 bg-white/95 shadow-md p-4">
                    <label className="block text-xs font-medium text-stone-500 mb-1.5">Job description (optional)</label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste a job description to tailor your resume…"
                      rows={2}
                      className="w-full rounded-lg border-2 border-amber-200/80 bg-white px-3 py-2.5 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm"
                    />
                    <button type="button" onClick={() => setShowJobDesc(false)} className="mt-2 text-xs text-stone-500 hover:text-stone-700">
                      Hide
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowJobDesc(true)}
                    className="text-sm text-stone-500 hover:text-amber-700"
                  >
                    + Add job description (optional)
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading || !canSubmit}
                  className="w-full rounded-xl bg-amber-600 px-5 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? "Generating…" : "Generate & open builder"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </main>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <CreatePageContent />
    </Suspense>
  );
}
