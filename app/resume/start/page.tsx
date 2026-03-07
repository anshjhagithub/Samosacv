"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getBasicInfo, setBasicInfo, type BasicInfo, type ExperienceLevel } from "@/lib/resumeFlowStorage";
import { rolePresets, ROLE_IDS } from "@/lib/rolePresets";
import { SamosaLogoFull } from "@/components/brand/SamosaLogo";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const EXP_OPTIONS: { value: ExperienceLevel; label: string; icon: string }[] = [
  { value: "fresher", label: "Fresher", icon: "🎓" },
  { value: "1-3", label: "1-3 yrs", icon: "🚀" },
  { value: "3-6", label: "3-6 yrs", icon: "⚡" },
  { value: "6+", label: "6+ yrs", icon: "👑" },
];

export default function ResumeStartPage() {
  const router = useRouter();
  const [form, setForm] = useState<BasicInfo>({
    fullName: "",
    targetRole: "",
    experienceLevel: "1-3",
    location: "",
    jobDescription: "",
  });
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, session) => {
      setAuthUser(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/resume/start` },
    });
  };

  useEffect(() => { setForm(getBasicInfo()); }, []);
  useEffect(() => { setBasicInfo(form); }, [form]);

  const roleOptions = useMemo(() => ROLE_IDS.map((id) => rolePresets[id].label), []);
  const query = form.targetRole.trim().toLowerCase();
  const suggestions = useMemo(() => {
    if (!query) return roleOptions;
    const filtered = roleOptions.filter((r) => r.toLowerCase().includes(query));
    return filtered.length ? filtered : roleOptions;
  }, [query, roleOptions]);

  const canSubmit = form.fullName.trim() && form.targetRole.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBasicInfo(form);
    router.push("/resume/experience");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50/95 via-orange-50/60 to-amber-100/90">
      {/* Minimal header */}
      <header className="border-b border-amber-200/60 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0">
            <SamosaLogoFull />
          </Link>
          <div className="flex items-center gap-2 text-xs text-stone-400">
            {["Basics", "Experience", "Template", "Projects"].map((label, i) => (
              <span key={label} className="flex items-center gap-1.5">
                {i > 0 && <span className="w-4 h-px bg-stone-300 opacity-40" />}
                <span className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${i === 0 ? "bg-amber-500 text-white" : "bg-stone-200 text-stone-500"}`}>{i + 1}</span>
                <span className={`hidden sm:inline ${i === 0 ? "text-stone-800" : "opacity-40"}`}>{label}</span>
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <motion.div
          className="w-full max-w-md rounded-3xl border-2 border-amber-200/70 bg-white/90 shadow-xl shadow-amber-900/5 p-6 sm:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-8">
            <motion.h1
              className="text-2xl sm:text-3xl font-bold text-stone-900"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Let&apos;s build your resume
            </motion.h1>
            <motion.p
              className="text-stone-500 text-sm mt-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Two fields. AI handles the rest. ₹15 per resume.
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name field */}
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
              <label htmlFor="fullName" className="block text-sm font-semibold text-stone-800 mb-1.5">Your name</label>
              <input
                id="fullName"
                type="text"
                required
                autoFocus
                className="w-full rounded-2xl border-2 border-amber-200/80 bg-white px-4 py-4 text-stone-900 text-base placeholder-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all shadow-sm hover:border-amber-300"
                placeholder="Priya Sharma"
                value={form.fullName}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              />
            </motion.div>

            {/* Role field */}
            <motion.div className="relative" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
              <label htmlFor="targetRole" className="block text-sm font-semibold text-stone-800 mb-1.5">Target role</label>
              <input
                id="targetRole"
                type="text"
                required
                autoComplete="off"
                className="w-full rounded-2xl border-2 border-amber-200/80 bg-white px-4 py-4 text-stone-900 text-base placeholder-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all shadow-sm hover:border-amber-300"
                placeholder="Software Developer"
                value={form.targetRole}
                onChange={(e) => setForm((p) => ({ ...p, targetRole: e.target.value }))}
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
                          setForm((p) => ({ ...p, targetRole: s }));
                          setShowRoleSuggestions(false);
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Experience level — interactive pills */}
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
              <label className="block text-sm font-semibold text-stone-800 mb-2">Experience</label>
              <div className="grid grid-cols-4 gap-2">
                {EXP_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, experienceLevel: opt.value }))}
                    className={`rounded-xl py-3 text-center transition-all text-sm font-medium border-2 ${
                      form.experienceLevel === opt.value
                        ? "border-amber-500 bg-amber-50 text-amber-800 shadow-md shadow-amber-900/10"
                        : "border-amber-200/80 bg-white/90 text-stone-600 hover:border-amber-400 hover:bg-amber-50/80"
                    }`}
                  >
                    <span className="block text-lg mb-0.5">{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Optional extras toggle */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
              <button
                type="button"
                onClick={() => setShowOptional(!showOptional)}
                className="flex items-center gap-2 text-sm text-stone-500 hover:text-amber-700 transition-colors"
              >
                <motion.svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  animate={{ rotate: showOptional ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
                {showOptional ? "Hide" : "Add"} optional details (location, job description)
              </button>
              <AnimatePresence>
                {showOptional && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 pt-4">
                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-stone-700 mb-1">Location</label>
                        <input
                          id="location"
                          type="text"
                          className="w-full rounded-xl border border-amber-200/80 bg-white px-4 py-3 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-sm"
                          placeholder="Bangalore, India"
                          value={form.location}
                          onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label htmlFor="jobDescription" className="block text-sm font-medium text-stone-700 mb-1">Job description</label>
                        <textarea
                          id="jobDescription"
                          rows={3}
                          className="w-full rounded-xl border border-amber-200/80 bg-white px-4 py-3 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-sm resize-none"
                          placeholder="Paste job description for a tailored resume..."
                          value={form.jobDescription}
                          onChange={(e) => setForm((p) => ({ ...p, jobDescription: e.target.value }))}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Auth gate + Submit */}
            {!authLoading && !authUser ? (
              <motion.button
                type="button"
                onClick={signInWithGoogle}
                className="relative w-full rounded-2xl bg-stone-900 px-6 py-4 text-base font-semibold text-white shadow-lg hover:bg-stone-800 transition-all hover:-translate-y-0.5 overflow-hidden flex items-center justify-center gap-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Sign in with Google to continue
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                disabled={!canSubmit || authLoading}
                className="relative w-full rounded-2xl bg-amber-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-amber-900/20 hover:bg-amber-700 transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0 btn-shine overflow-hidden"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileTap={{ scale: 0.98 }}
              >
                {authLoading ? "Loading…" : "Generate My Resume →"}
              </motion.button>
            )}
          </form>

          <motion.p
            className="mt-6 text-center text-stone-400 text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Have a resume?{" "}
            <Link href="/create" className="text-amber-700 hover:underline font-medium">Upload or paste it</Link>
          </motion.p>
        </motion.div>
      </main>
    </div>
  );
}
