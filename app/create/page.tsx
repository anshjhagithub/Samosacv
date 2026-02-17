"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { saveResume, setUnlockPreview } from "@/lib/storage/resumeStorage";
import { useUserLimits } from "@/lib/hooks/useUserLimits";
import { useResumeGeneration } from "@/lib/hooks/useResumeGeneration";
import { UserLimitsDisplay } from "@/components/limits/UserLimitsDisplay";
import { PaymentRequiredModal } from "@/components/limits/PaymentRequiredModal";

const inputClass =
  "w-full rounded-xl border border-[#2d2640] bg-[#16121f] px-4 py-3 text-white placeholder-gray-500 focus:border-accent focus:ring-1 focus:ring-accent/50 outline-none transition-colors";

function CreatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [method, setMethod] = useState<string | null>(null);

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

  const [content, setContent] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [model, setModel] = useState<"basic" | "premium">("basic");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fromUrl = searchParams.get("method");
    if (fromUrl) setMethod(fromUrl);
    else {
      const fromStorage = typeof window !== "undefined" ? window.sessionStorage.getItem("createMethod") : null;
      if (fromStorage) {
        setMethod(fromStorage);
        window.sessionStorage.removeItem("createMethod");
      }
    }
  }, [searchParams]);

  const canSubmit = content.trim().length > 0 || !!file;
  const loading = allocateLoading;

  useEffect(() => {
    if ((submitError || allocateError) && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [submitError, allocateError]);

  const handleFileButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0] ?? null;
    setFile(chosen);
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!canSubmit) {
      setSubmitError("Paste your resume text or upload a PDF.");
      return;
    }
    const result = await allocate(model);
    if ("token" in result) {
      const authHeaders = {
        Authorization: `Bearer ${result.jwt}`,
        "X-Generation-Token": result.token,
      };
      try {
        let res: Response;
        if (file && !content.trim()) {
          const formData = new FormData();
          formData.append("file", file);
          if (jobDescription.trim()) formData.append("jobDescription", jobDescription.trim());
          res = await fetch("/api/resume/extract", {
            method: "POST",
            headers: authHeaders,
            body: formData,
          });
        } else {
          res = await fetch("/api/resume/extract", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders },
            body: JSON.stringify({
              content: content.trim() || "",
              jobDescription: jobDescription.trim() || undefined,
            }),
          });
        }
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
    <div className="min-h-screen bg-[#0c0a12] theme-dark">
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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-2xl sm:text-3xl font-serif text-white mb-2">
          Import your resume
        </h1>
        <p className="text-gray-400 text-sm sm:text-base mb-8">
          {method === "pdf"
            ? "Upload your PDF below. We’ll extract the text and build an editable resume."
            : "Paste your resume text or upload a PDF. We’ll structure it and send you to the editor."}
        </p>
        {method === "pdf" && (
          <div className="mb-6 rounded-xl bg-accent/10 border border-accent/30 px-4 py-3 text-sm text-accent">
            Click “Choose PDF file” to open the file picker, then “Generate my resume with AI”.
          </div>
        )}

        <div className="mb-6">
          <UserLimitsDisplay
            limits={limits}
            loading={limitsLoading}
            error={limitsError}
            isAuthenticated={isAuthenticated}
          />
        </div>

        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
              e.preventDefault();
            }
          }}
          className="space-y-6"
          noValidate
        >
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
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Model
            </label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="model"
                  value="basic"
                  checked={model === "basic"}
                  onChange={() => setModel("basic")}
                  className="rounded-full border-[#2d2640] bg-[#16121f] text-accent focus:ring-accent"
                />
                <span className="text-white">Basic</span>
              </label>
              <label
                className={`flex items-center gap-2 ${!limits?.premium_unlocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
              >
                <input
                  type="radio"
                  name="model"
                  value="premium"
                  checked={model === "premium"}
                  onChange={() => limits?.premium_unlocked && setModel("premium")}
                  disabled={!limits?.premium_unlocked}
                  className="rounded-full border-[#2d2640] bg-[#16121f] text-accent focus:ring-accent disabled:cursor-not-allowed"
                />
                <span className="text-white">Premium</span>
                {!limits?.premium_unlocked && (
                  <span className="text-xs text-gray-500">(Unlock for ₹49)</span>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Paste resume text
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your resume or any career info…"
              rows={4}
              className={inputClass}
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-sm">or</span>
            <hr className="flex-1 border-gray-700" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Upload PDF resume
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="sr-only"
              aria-label="Choose PDF file"
            />
            <button
              type="button"
              onClick={handleFileButtonClick}
              className="rounded-xl border border-[#2d2640] bg-[#16121f] px-4 py-2.5 text-sm font-medium text-white hover:border-accent/50 hover:bg-accent/10 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-[#0F1117]"
            >
              {file ? file.name : "Choose PDF file"}
            </button>
            {file && (
              <button
                type="button"
                onClick={() => setFile(null)}
                className="ml-2 text-xs text-gray-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Optional: Job description to tailor your resume
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste a job description to emphasize relevant skills…"
              rows={2}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full rounded-2xl bg-accent px-6 py-4 text-lg font-semibold text-white shadow-glow hover:shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-glow transition-all"
          >
            {loading ? "Generating your resume…" : "Generate my resume with AI"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 text-sm">
          <Link href="/create/job-description" className="text-accent hover:underline">
            Create from job description
          </Link>
          {" · "}
          <Link href="/onboarding" className="text-accent hover:underline">
            Start from scratch
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

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0c0a12] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      }
    >
      <CreatePageContent />
    </Suspense>
  );
}
