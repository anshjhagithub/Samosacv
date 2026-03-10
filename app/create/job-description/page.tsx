"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { saveResume, setUnlockPreview } from "@/lib/storage/resumeStorage";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { rolePresets, ROLE_IDS } from "@/lib/rolePresets";
import { type ExperienceLevel } from "@/lib/resumeFlowStorage";

const EXP_OPTIONS: { value: ExperienceLevel; label: string; icon: string }[] = [
  { value: "fresher", label: "Fresher", icon: "🎓" },
  { value: "1-3", label: "1-3 yrs", icon: "🚀" },
  { value: "3-6", label: "3-6 yrs", icon: "⚡" },
  { value: "6+", label: "6+ yrs", icon: "👑" },
];

const inputClass =
  "w-full rounded-xl border-2 border-amber-200/80 bg-white px-4 py-3.5 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all shadow-sm";

export default function CreateJobDescriptionPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("1-3");
  const [jobDescription, setJobDescription] = useState("");
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (submitError && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [submitError]);

  const roleOptions = useMemo(() => ROLE_IDS.map((id) => rolePresets[id].label), []);
  const query = targetRole.trim().toLowerCase();
  const suggestions = useMemo(() => {
    if (!query) return roleOptions;
    const filtered = roleOptions.filter((r) => r.toLowerCase().includes(query));
    return filtered.length ? filtered : roleOptions;
  }, [query, roleOptions]);

  const canSubmit = fullName.trim() && targetRole.trim() && jobDescription.trim().length >= 50;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!canSubmit) {
      setSubmitError("Please fill out your name, target role, and paste a job description (at least 50 characters).");
      return;
    }
    setLoading(true);
    try {
      const authHeaders: Record<string, string> = { "Content-Type": "application/json" };
      let generationToken: string | null = null;

      const payload = {
        fullName: fullName.trim(),
        targetRole: targetRole.trim(),
        experienceLevel,
        jobDescription: jobDescription.trim(),
        experiences: [],
        projects: []
      };

      const res = await fetch("/api/resume/generate-from-minimal", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      if (res.status === 402) {
         setSubmitError(data.message || data.error || "Payment required to generate.");
         return;
      }
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
      setUnlockPreview({
        resumeId: crypto.randomUUID?.() ?? `res-${Date.now()}`,
        atsScore: data.atsScore ?? 0,
        missingSkills: data.missingSkills ?? [],
        targetRole: data.targetRole,
      });
      router.push("/builder");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/90 via-orange-50/50 to-amber-100/80">
      <SiteHeader />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
            Create from job description
          </h1>
          <p className="text-stone-600 text-sm">
            Paste a job posting and your details. We&apos;ll generate a tailored resume — pay ₹15 when you download.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          onSubmit={handleSubmit}
          className="space-y-6"
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

          <div className="rounded-2xl border-2 border-amber-200/80 bg-white/95 p-5 sm:p-6 shadow-md space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-stone-800 mb-1.5">Your name</label>
              <input
                id="fullName"
                type="text"
                required
                className={inputClass}
                placeholder="Priya Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <label htmlFor="targetRole" className="block text-sm font-semibold text-stone-800 mb-1.5">Target role</label>
              <input
                id="targetRole"
                type="text"
                required
                autoComplete="off"
                className={inputClass}
                placeholder="Software Developer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                onFocus={() => setShowRoleSuggestions(true)}
                onBlur={() => setTimeout(() => setShowRoleSuggestions(false), 200)}
              />
              <AnimatePresence>
                {showRoleSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border-2 border-amber-200/80 bg-white/95 shadow-xl py-1.5 z-10 max-h-64 overflow-y-auto"
                  >
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="w-full px-4 py-2.5 text-left text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                        onMouseDown={() => {
                          setTargetRole(s);
                          setShowRoleSuggestions(false);
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-2">Experience</label>
              <div className="grid grid-cols-4 gap-2">
                {EXP_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setExperienceLevel(opt.value)}
                    className={`rounded-xl py-3 text-center transition-all text-sm font-medium border-2 ${
                      experienceLevel === opt.value
                        ? "border-amber-500 bg-amber-50 text-amber-800 shadow-md shadow-amber-900/10"
                        : "border-amber-200/80 bg-white/90 text-stone-600 hover:border-amber-400 hover:bg-amber-50/80"
                    }`}
                  >
                    <span className="block text-lg mb-0.5">{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="job-desc" className="block text-sm font-semibold text-stone-800 mb-2 pt-2 border-t border-stone-100">
                Job description
              </label>
              <textarea
                id="job-desc"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job posting here (at least 50 characters)…"
                rows={8}
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full rounded-2xl bg-amber-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-amber-900/20 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
          >
            {loading ? "Creating Full Resume…" : "Create resume"}
          </button>
        </motion.form>

        <p className="mt-8 text-center text-stone-500 text-sm">
          <Link href="/create" className="text-amber-700 hover:underline font-medium">
            Import from PDF or paste instead
          </Link>
          {" · "}
          <Link href="/resume/start" className="text-amber-700 hover:underline font-medium">
            Start from scratch
          </Link>
        </p>
      </main>
    </div>
  );
}
