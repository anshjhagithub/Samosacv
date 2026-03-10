"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { openCashfreeCheckout } from "@/lib/cashfree";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const ADDONS = [
  { name: "Resume Generation", price: 15, desc: "AI builds your resume from scratch", popular: true },
  { name: "ATS Optimizer", price: 5, desc: "Score 90+ and pass every filter", popular: true },
  { name: "Mock Interview Qs", price: 6, desc: "Role-specific questions + ideal answers" },
  { name: "Cover Letter", price: 5, desc: "Tailored cover letter for any job" },
  { name: "LinkedIn Optimizer", price: 3, desc: "Rewrite your LinkedIn for recruiters" },
  { name: "Skill Roadmap", price: 4, desc: "Personalized learning path for your role" },
  { name: "ATS Breakdown", price: 3, desc: "Detailed score + what to fix" },
  { name: "Resume Regeneration", price: 2, desc: "Re-generate with a different style" },
];

const PREMIUM_AMOUNT = 49;

export default function PricingPage() {
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const handlePayNow = async () => {
    setPayError(null);
    setPayLoading(true);
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: PREMIUM_AMOUNT }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setPayError(data.error ?? "Failed to create order"); return; }
      const sessionId = data.payment_session_id;
      if (!sessionId) { setPayError("No payment session received"); return; }
      await openCashfreeCheckout(sessionId);
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "Payment failed");
    } finally { setPayLoading(false); }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900">Simple, transparent pricing</h1>
          <p className="mt-2 text-stone-500 text-sm max-w-lg mx-auto">No subscription. No hidden fees. Pay only when you need it.</p>
        </motion.div>

        {payError && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm text-center">{payError}</div>
        )}

        {/* Hero card - ₹15 per resume */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 via-amber-50/60 to-white p-8 sm:p-10 text-center relative overflow-hidden shadow-lg shadow-amber-200/30">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-200/20 rounded-full blur-3xl" aria-hidden />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700 mb-3">Our core promise</p>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-6xl sm:text-7xl font-black text-stone-900">₹15</span>
              <span className="text-lg text-stone-500 font-medium">/ resume</span>
            </div>
            <p className="text-stone-600 text-base max-w-md mx-auto mb-6">One AI-generated, ATS-ready resume. Professional templates. Role-specific content. That&apos;s it.</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-stone-600 mb-8">
              {["AI-written bullets", "35+ templates", "ATS optimized", "Instant PDF"].map((f) => (
                <span key={f} className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  {f}
                </span>
              ))}
            </div>
            <Link href="/create" className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-amber-900/20 hover:bg-amber-700 transition-all hover:-translate-y-0.5">
              Start building — first 2 free
            </Link>
            <p className="mt-3 text-xs text-stone-400">No credit card required for free generations</p>
          </div>
        </motion.section>

        {/* Add-on features */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-stone-900 mb-1">Add-on features</h2>
          <p className="text-stone-500 text-sm mb-6">Supercharge your job search. Pay per feature.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ADDONS.filter((a) => a.name !== "Resume Generation").map((addon, i) => (
              <motion.div
                key={addon.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.04 }}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-amber-200 transition-all relative"
              >
                {addon.popular && (
                  <span className="absolute -top-2 right-3 text-[9px] font-bold uppercase tracking-widest text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Popular</span>
                )}
                <div className="flex items-baseline justify-between mb-1">
                  <h3 className="text-stone-900 font-semibold text-sm">{addon.name}</h3>
                  <span className="text-amber-700 font-bold">₹{addon.price}</span>
                </div>
                <p className="text-stone-500 text-xs leading-relaxed">{addon.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Bundle deal */}
        <section className="mb-12">
          <motion.div
            className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50/80 to-white p-6 sm:p-8 relative overflow-hidden"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="absolute top-0 right-0 bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-bl-xl">Best Value</div>
            <div className="grid sm:grid-cols-2 gap-6 items-center">
              <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-2">Premium Bundle — ₹49</h2>
                <p className="text-stone-600 text-sm mb-4">5 resume generations + ATS optimizer included with every generation. One-time payment.</p>
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <span className="text-amber-600">✓</span> 5 premium AI generations
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <span className="text-amber-600">✓</span> ATS optimizer included (worth ₹55)
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <span className="text-amber-600">✓</span> Higher-quality AI model
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <span className="text-amber-600">✓</span> After 5: just ₹15 per generation
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-500 mb-4">
                  <span className="line-through">5 × ₹15 gen + 5 × ₹5 ATS = ₹100</span>
                  <span className="text-amber-700 font-bold text-sm">You pay ₹49 — save 51%</span>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <div className="inline-block">
                  <div className="text-4xl font-bold text-stone-900 mb-1">₹49</div>
                  <p className="text-stone-500 text-xs mb-4">one-time payment</p>
                  <button
                    type="button"
                    onClick={handlePayNow}
                    disabled={payLoading}
                    className="w-full rounded-xl px-6 py-3.5 text-sm font-semibold bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-900/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                  >
                    {payLoading ? "Opening checkout…" : "Unlock Premium Bundle"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Free tier */}
        <section className="mb-10">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-stone-900">Free tier</h2>
                <p className="text-stone-500 text-sm mt-1">2 free AI resume generations. All 35+ templates. PDF export.</p>
              </div>
              <Link href="/create" className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-700 transition-all shrink-0">
                Start free
              </Link>
            </div>
          </div>
        </section>

        <p className="text-center text-stone-400 text-xs">
          Sign-up required for payment tracking and generation history. All pricing in INR.
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
