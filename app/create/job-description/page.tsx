"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveResume, setUnlockPreview } from "@/lib/storage/resumeStorage";
import { useUserLimits } from "@/lib/hooks/useUserLimits";
import { useResumeGeneration } from "@/lib/hooks/useResumeGeneration";
import { UserLimitsDisplay } from "@/components/limits/UserLimitsDisplay";
import { PaymentRequiredModal } from "@/components/limits/PaymentRequiredModal";
import { motion } from "framer-motion";

const inputClass =
  "w-full rounded-xl border border-[#2d2640] bg-[#16121f] px-4 py-3 text-white placeholder-gray-500 focus:border-accent focus:ring-1 focus:ring-accent/50 outline-none transition-colors";

export default function CreateJobDescriptionPage() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const { limits, loading: limitsLoading, error: limitsError, refresh, isAuthenticated } = useUserLimits();
  const {
    allocate,
    loading: allocateLoading,
    error: allocateError,
    paymentRequiredCode,
    clearPaymentRequired,
  } = useResumeGeneration({
    limits,
    onSuccess: refresh,
  });

  const loading = allocateLoading;

  useEffect(() => {
    if ((submitError || allocateError) && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [submitError, allocateError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const trimmed = jobDescription.trim();
    if (!trimmed || trimmed.length < 50) {
      setSubmitError("Please paste a job description (at least 50 characters) so we can build a tailored resume template.");
      return;
    }
    const result = await allocate("basic");
    if ("token" in result) {
      try {
        const res = await fetch("/api/resume/extract", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${result.jwt}`,
            "X-Generation-Token": result.token,
          },
          body: JSON.stringify({
            content: "",
            jobDescription: trimmed,
          }),
        });
        const data = await res.json();
        if (res.status === 401) {
          setSubmitError("Please sign in to generate a resume.");
          return;
        }
        if (res.status === 402) {
          setSubmitError("Payment required.");
          return;
        }
        if (!res.ok) throw new Error(data.error ?? "Failed to generate resume");
        saveResume(data.resume);
        const resumeId = crypto.randomUUID?.() ?? `res-${Date.now()}`;
        setUnlockPreview({
          resumeId,
          atsScore: data.atsScore ?? 0,
          missingSkills: data.missingSkills ?? [],
          targetRole: data.targetRole,
        });
        await refresh();
        await router.push("/unlock");
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Something went wrong");
      }
      return;
    }
    if (result.code === "UNAUTHORIZED") {
      setSubmitError(result.message);
    }
  };

  return (
    <div className="min-h-screen theme-dark bg-[#0c0a12]">
      <header className="border-b border-white/5 sticky top-0 z-20 bg-[#0c0a12]/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white font-semibold">
            <span className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-sm font-bold">
              A
            </span>
            ARTICULATED
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link
              href="/onboarding"
              className="text-sm px-4 py-2 rounded-xl bg-accent/20 text-accent border border-accent/40 hover:bg-accent/30 transition-colors font-medium"
            >
              Create from scratch
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <motion.h1
          className="text-2xl sm:text-3xl font-serif text-white mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Create resume from job description
        </motion.h1>
        <motion.p
          className="text-gray-400 text-sm sm:text-base mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          Paste a job posting below. We’ll generate a tailored resume template with the right skills, summary, and structure so you can fill in your details.
        </motion.p>

        <div className="mb-6">
          <UserLimitsDisplay
            limits={limits}
            loading={limitsLoading}
            error={limitsError}
            isAuthenticated={isAuthenticated}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {(submitError || allocateError) && (
            <div
              ref={errorRef}
              className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm"
              role="alert"
            >
              {submitError ?? allocateError}
            </div>
          )}

          <div>
            <label htmlFor="job-desc" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Job description
            </label>
            <textarea
              id="job-desc"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job posting here (role, requirements, responsibilities)…"
              rows={12}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading || jobDescription.trim().length < 50}
            className="w-full rounded-2xl bg-accent px-6 py-4 text-lg font-semibold text-white shadow-glow hover:shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5"
          >
            {loading ? "Creating your resume template…" : "Create resume from job description"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 text-sm">
          <Link href="/create" className="text-accent hover:underline">
            Import from PDF or paste resume text instead
          </Link>
        </p>
      </main>

      {paymentRequiredCode && (
        <PaymentRequiredModal
          code={paymentRequiredCode}
          open
          onClose={clearPaymentRequired}
          onUpgrade={() => router.push("/pricing")}
          onUnlockPremium={() => router.push("/pricing")}
          onRechargeWallet={() => router.push("/pricing")}
        />
      )}
    </div>
  );
}
