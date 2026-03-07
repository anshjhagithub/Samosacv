"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { saveResume, setUnlockPreview } from "@/lib/storage/resumeStorage";
import { LoginModal } from "@/components/auth/LoginModal";
import { SiteHeader } from "@/components/layout/SiteHeader";

const inputClass =
  "w-full rounded-xl border-2 border-amber-200/80 bg-white px-4 py-3.5 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all shadow-sm";

export default function CreateJobDescriptionPage() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (submitError && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [submitError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const trimmed = jobDescription.trim();
    if (!trimmed || trimmed.length < 50) {
      setSubmitError("Paste a job description (at least 50 characters).");
      return;
    }
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setShowLogin(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/resume/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ content: "", jobDescription: trimmed }),
      });
      const data = await res.json();
      if (res.status === 401) {
        setSubmitError("Please sign in again.");
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
            Paste a job posting. We&apos;ll generate a tailored resume — pay ₹15 when you download.
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

          <div className="rounded-2xl border-2 border-amber-200/80 bg-white/95 p-5 sm:p-6 shadow-md">
            <label htmlFor="job-desc" className="block text-sm font-semibold text-stone-800 mb-2">
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

          <button
            type="submit"
            disabled={loading || jobDescription.trim().length < 50}
            className="w-full rounded-2xl bg-amber-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-amber-900/20 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
          >
            {loading ? "Creating…" : "Create resume"}
          </button>
        </motion.form>

        <p className="mt-8 text-center text-stone-500 text-sm">
          <Link href="/create" className="text-amber-700 hover:underline font-medium">
            Import from PDF or paste instead
          </Link>
          {" · "}
          <Link href="/create" className="text-amber-700 hover:underline font-medium">
            Start from scratch
          </Link>
        </p>
      </main>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} redirectAfterLogin="/create/job-description" />
    </div>
  );
}
