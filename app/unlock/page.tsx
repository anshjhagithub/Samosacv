"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SamosaLogoFull } from "@/components/brand/SamosaLogo";
import { loadResume, getUnlockPreview, setUnlockPreview } from "@/lib/storage/resumeStorage";
import { ResumePreview } from "@/components/resume/ResumePreview";
import {
  getDefaultCart,
  toggleCartItem,
  getCartTotal,
  getAddonCount,
  getPrice,
  ADDON_SLUGS,
  BASE_PRODUCT,
} from "@/lib/cart";
import { FEATURE_PRICING, type FeatureSlug } from "@/lib/pricing";
import { openCashfreeCheckout } from "@/lib/cashfree";
import type { ResumeData } from "@/types/resume";

const ADDON_META: Record<string, { label: string; desc: string; color: string; icon: string; preview?: React.ReactNode }> = {
  ats_breakdown: {
    label: "Full ATS Breakdown",
    desc: "Line-by-line analysis of what to fix",
    color: "emerald",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  ats_improver: {
    label: "ATS Improver",
    desc: "Auto-rewrite bullets for 90+ ATS score",
    color: "emerald",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  skill_roadmap: {
    label: "Skill Roadmap",
    desc: "Personalized learning path for your role",
    color: "amber",
    icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  },
  linkedin_optimizer: {
    label: "LinkedIn Optimizer",
    desc: "Rewrite your LinkedIn for recruiters",
    color: "blue",
    icon: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z",
  },
  cover_letter: {
    label: "Cover Letter",
    desc: "Tailored cover letter matching your resume",
    color: "sky",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  interview_pack: {
    label: "Interview Pack",
    desc: "Role-specific questions + ideal answers + STAR frameworks",
    color: "violet",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  },
};

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600", badge: "bg-amber-100 text-amber-700" },
  blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600", badge: "bg-blue-100 text-blue-700" },
  sky: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-600", badge: "bg-sky-100 text-sky-700" },
  violet: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-600", badge: "bg-violet-100 text-violet-700" },
};

export default function UnlockPage() {
  const router = useRouter();
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [preview, setPreview] = useState<{ resumeId: string; atsScore: number; missingSkills: string[]; targetRole?: string } | null>(null);
  const [cart, setCart] = useState(() => getDefaultCart());
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [expandedAddon, setExpandedAddon] = useState<string | null>(null);

  useEffect(() => {
    const r = loadResume();
    const p = getUnlockPreview();
    if (!r) { router.replace("/create"); return; }
    setResume(r);
    if (p) { setPreview(p); }
    else {
      const fallback = { resumeId: crypto.randomUUID(), atsScore: 0, missingSkills: [] as string[], targetRole: undefined as string | undefined };
      setUnlockPreview(fallback);
      setPreview(fallback);
    }
  }, [router]);

  const handleCheckout = async () => {
    if (!preview?.resumeId || payLoading) return;
    setPayError(null);
    setPayLoading(true);
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, resumeId: preview.resumeId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setPayError(data.error ?? "Failed to create order"); return; }
      const sessionId = data.payment_session_id;
      if (!sessionId) { setPayError("No payment session received"); return; }
      await openCashfreeCheckout(sessionId);
      router.push("/payment-status?order_id=" + encodeURIComponent(data.order_id));
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "Payment failed");
    } finally { setPayLoading(false); }
  };

  const total = getCartTotal(cart);
  const addonCount = getAddonCount(cart);
  const atsScore = Math.min(100, preview?.atsScore ?? 0);
  const missingSkills = preview?.missingSkills ?? [];

  if (!resume) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <header className="border-b border-amber-900/5 sticky top-0 z-20 bg-gradient-to-b from-amber-50/98 to-white/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0">
            <SamosaLogoFull />
          </Link>
          <Link href="/builder" className="text-sm text-amber-700 hover:text-amber-800 font-medium transition-colors">Back to builder</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: resume preview + ATS insights */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-lg">
                <div className="p-3 overflow-auto max-h-[360px]">
                  <div className="transform scale-[0.6] origin-top-left w-[166%]">
                    <ResumePreview data={resume} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ATS Score card */}
            {atsScore > 0 && (
              <motion.div
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">ATS Score</h3>
                  <span className={`text-2xl font-black ${atsScore >= 90 ? "text-emerald-600" : atsScore >= 70 ? "text-amber-600" : "text-red-500"}`}>
                    {atsScore}<span className="text-sm font-medium text-stone-400">/100</span>
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${atsScore >= 90 ? "bg-emerald-500" : atsScore >= 70 ? "bg-amber-500" : "bg-red-400"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${atsScore}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
                {atsScore < 90 && (
                  <p className="text-xs text-stone-500 mt-2">
                    Resumes below 90 are often rejected by ATS.{" "}
                    <button type="button" onClick={() => setCart((c) => ({ ...c, ats_improver: true }))} className="text-amber-700 font-semibold hover:underline">
                      Add ATS Improver
                    </button>
                  </p>
                )}
                {missingSkills.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-stone-100">
                    <p className="text-xs font-semibold text-stone-700 mb-1.5">{missingSkills.length} high-demand skills missing:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {missingSkills.slice(0, 5).map((s) => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">{s}</span>
                      ))}
                      {missingSkills.length > 5 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-400">+{missingSkills.length - 5} more</span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Right: Placement Toolkit */}
          <div className="lg:col-span-3">
            <motion.div
              className="rounded-2xl border-2 border-amber-300/80 bg-white shadow-xl overflow-hidden"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 px-6 py-5 text-white">
                <h2 className="text-xl font-bold">Your Placement Toolkit</h2>
                <p className="text-amber-100 text-sm mt-0.5">Resume PDF included. Add power-ups to stand out.</p>
              </div>

              <div className="p-5 sm:p-6">
                {/* Base product */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center">
                      <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-900">Resume PDF</p>
                      <p className="text-xs text-stone-500">Clean, ATS-ready download</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-amber-700">&#x20B9;{getPrice(BASE_PRODUCT)}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">Included</span>
                  </div>
                </div>

                {/* Add-ons */}
                <div className="space-y-3 mb-6">
                  {ADDON_SLUGS.map((slug, i) => {
                    const meta = ADDON_META[slug];
                    if (!meta) return null;
                    const colors = COLOR_MAP[meta.color] || COLOR_MAP.amber;
                    const isSelected = !!cart[slug];
                    const isExpanded = expandedAddon === slug;

                    return (
                      <motion.div
                        key={slug}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.04 }}
                        className={`rounded-xl border-2 transition-all ${isSelected ? `${colors.border} ${colors.bg}/30 shadow-sm` : "border-stone-200 bg-white hover:border-stone-300"}`}
                      >
                        <div className="flex items-center gap-3 p-4">
                          <button
                            type="button"
                            onClick={() => setCart(toggleCartItem(cart, slug))}
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? `${colors.border} ${colors.bg} ${colors.text}` : "border-stone-300 bg-white"}`}
                          >
                            {isSelected && (
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            )}
                          </button>
                          <div className={`w-8 h-8 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center shrink-0`}>
                            <svg className={`w-4 h-4 ${colors.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={meta.icon} /></svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-stone-900">{meta.label}</p>
                            <p className="text-xs text-stone-500">{meta.desc}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-sm font-bold ${colors.text}`}>&#x20B9;{getPrice(slug as FeatureSlug)}</span>
                            <button
                              type="button"
                              onClick={() => setExpandedAddon(isExpanded ? null : slug)}
                              className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-200 transition-colors"
                              title="Preview"
                            >
                              <svg className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className={`mx-4 mb-4 rounded-lg ${colors.bg} border ${colors.border} p-3`}>
                                {slug === "ats_improver" && (
                                  <div className="space-y-2">
                                    <div className="flex items-start gap-2 text-xs">
                                      <span className="text-red-400 line-through shrink-0">Managed databases</span>
                                      <span className={`font-bold shrink-0 ${colors.text}`}>&#x2192;</span>
                                      <span className="text-stone-800 font-medium">Optimized <span className={`px-1 rounded ${colors.badge}`}>PostgreSQL</span> queries reducing latency by 40%</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="w-14 h-1.5 rounded-full bg-white"><span className="block w-[65%] h-full bg-amber-400 rounded-full" /></span>
                                      <span className="text-stone-400 text-[10px]">65</span>
                                      <span className={`font-bold ${colors.text}`}>&#x2192;</span>
                                      <span className="w-14 h-1.5 rounded-full bg-white"><span className="block w-[96%] h-full bg-emerald-500 rounded-full" /></span>
                                      <span className="text-emerald-600 font-bold text-[10px]">96</span>
                                    </div>
                                  </div>
                                )}
                                {slug === "ats_breakdown" && (
                                  <div className="space-y-1.5 text-xs">
                                    {["Keyword match: 72%", "Format structure: 90%", "Action verbs: 58%", "Quantification: 65%"].map((item) => (
                                      <div key={item} className="flex items-center justify-between">
                                        <span className="text-stone-600">{item.split(":")[0]}</span>
                                        <span className="font-semibold text-stone-800">{item.split(":")[1]}</span>
                                      </div>
                                    ))}
                                    <p className="text-[10px] text-emerald-600 font-semibold mt-1">+ Specific fix suggestions for each category</p>
                                  </div>
                                )}
                                {slug === "cover_letter" && (
                                  <p className="text-xs text-stone-600 italic leading-relaxed">&ldquo;Dear Hiring Manager, I&apos;m excited to apply for the {preview?.targetRole || "Software Developer"} position. With proven experience in...&rdquo; <span className="not-italic text-[10px] text-sky-600 font-semibold block mt-1">Full letter tailored to your resume content</span></p>
                                )}
                                {slug === "interview_pack" && (
                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-[10px] uppercase tracking-wider text-violet-500 font-bold">Q1</p>
                                      <p className="text-xs text-stone-800">&ldquo;Walk me through a challenging project...&rdquo;</p>
                                    </div>
                                    <p className="text-[10px] text-violet-600 font-semibold">15+ role-specific questions with STAR-format ideal answers</p>
                                  </div>
                                )}
                                {slug === "skill_roadmap" && (
                                  <div className="space-y-1 text-xs">
                                    <p className="font-semibold text-stone-800">3-month learning path:</p>
                                    <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-amber-200 text-[9px] font-bold text-amber-800 flex items-center justify-center">1</span><span className="text-stone-600">Core skills gap analysis</span></div>
                                    <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-amber-200 text-[9px] font-bold text-amber-800 flex items-center justify-center">2</span><span className="text-stone-600">Curated courses + projects</span></div>
                                    <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-amber-200 text-[9px] font-bold text-amber-800 flex items-center justify-center">3</span><span className="text-stone-600">Interview-ready checklist</span></div>
                                  </div>
                                )}
                                {slug === "linkedin_optimizer" && (
                                  <div className="space-y-1.5 text-xs">
                                    <div className="flex items-start gap-2">
                                      <span className="text-red-400 line-through shrink-0 text-[10px]">Experienced developer</span>
                                      <span className={`font-bold shrink-0 ${colors.text}`}>&#x2192;</span>
                                      <span className="text-stone-800 font-medium text-[10px]">Full-Stack Engineer | React &amp; Node.js | Building scalable systems</span>
                                    </div>
                                    <p className="text-[10px] text-blue-600 font-semibold">Headline + About + Experience rewritten for recruiter search</p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Savings nudge */}
                {addonCount >= 2 && (
                  <motion.div
                    className="rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 px-4 py-3 mb-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <p className="text-sm text-amber-800 font-semibold">
                      {addonCount >= 4 ? "Maximum value! You\u2019re building a complete placement kit." : `${addonCount} add-ons selected \u2014 great combo for landing interviews.`}
                    </p>
                  </motion.div>
                )}

                {/* Total + CTA */}
                <div className="border-t-2 border-amber-200/60 pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-sm text-stone-500">Total</span>
                      <p className="text-xs text-stone-400">Resume PDF + {addonCount} add-on{addonCount !== 1 ? "s" : ""}</p>
                    </div>
                    <span className="text-3xl font-black text-stone-900">&#x20B9;{total}</span>
                  </div>

                  {payError && <p className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{payError}</p>}

                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={payLoading}
                    className="w-full rounded-xl px-4 py-4 text-base font-bold bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-700 hover:to-amber-600 disabled:opacity-50 shadow-xl shadow-amber-900/15 transition-all hover:-translate-y-0.5"
                  >
                    {payLoading ? "Opening checkout\u2026" : `Pay \u20B9${total} & unlock`}
                  </button>

                  <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-stone-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      Secure payment
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      Instant delivery
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                      UPI / Cards / Wallets
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="mt-4 text-center">
              <Link href="/builder" className="text-sm text-stone-500 hover:text-amber-700 transition-colors">
                &#x2190; Back to builder
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
