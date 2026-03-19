"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { openCashfreeCheckout } from "@/lib/cashfree";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileNumberModal } from "@/components/pricing/MobileNumberModal";

const RESUME_PRICE = 15;

export default function PricingPage() {
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");

  const handlePayNow = () => {
    setPayError(null);
    setShowMobileModal(true);
  };

  const handleMobileNumberSubmit = async (mobile: string) => {
    setMobileNumber(mobile);
    setShowMobileModal(false);
    setPayLoading(true);
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: RESUME_PRICE,
          mobileNumber: mobile 
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setPayError(data.error ?? "Failed to create order"); return; }
      const sessionId = data.payment_session_id;
      if (!sessionId) { setPayError("No payment session received"); return; }
      await openCashfreeCheckout(sessionId);
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "Payment failed");
    } finally { 
      setPayLoading(false);
    }
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
              Start building
            </Link>
            <p className="mt-3 text-xs text-stone-400">Pay per generation. No subscription required.</p>
          </div>
        </motion.section>

        {/* Simple features */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-stone-900 mb-1">What's included</h2>
          <p className="text-stone-500 text-sm mb-6">Everything you need for a professional resume.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { name: "AI Content", desc: "Professional bullet points", icon: "✨" },
              { name: "35+ Templates", desc: "Modern, clean designs", icon: "📄" },
              { name: "ATS Optimized", desc: "Pass recruiter filters", icon: "🎯" },
              { name: "Instant PDF", desc: "Download immediately", icon: "⚡" }
            ].map((feature, i) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.04 }}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-amber-200 transition-all"
              >
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h3 className="text-stone-900 font-semibold text-sm mb-1">{feature.name}</h3>
                <p className="text-stone-500 text-xs leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Free Tools Banner */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50/80 to-white p-6 text-center">
            <motion.div 
              className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold mb-3"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎉 AMAZING VALUE
            </motion.div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">
              All 6 Career Tools Included 
              <motion.span 
                className="text-emerald-600 ml-2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >100% FREE</motion.span>
            </h3>
            <p className="text-stone-600 mb-4">
              Interview Prep • ATS Optimizer • LinkedIn Tools • Cover Letter • Skill Roadmap • ATS Breakdown
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {["🎯 Interview Prep", "🤖 ATS Optimizer", "💼 LinkedIn Tools", "📄 Cover Letter", "🗺️ Skill Roadmap", "📊 ATS Breakdown"].map((tool, i) => (
                <motion.div
                  key={tool}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                  className="px-3 py-1 bg-white border border-emerald-200 rounded-lg text-xs text-stone-700"
                >
                  {tool}
                </motion.div>
              ))}
            </div>
            <Link 
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Start Using Free Tools
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >→</motion.span>
            </Link>
          </div>
        </motion.section>

        <p className="text-center text-stone-400 text-xs">
          Sign-up required for payment tracking and generation history. All pricing in INR.
        </p>
      </main>

      <MobileNumberModal
        isOpen={showMobileModal}
        onClose={() => setShowMobileModal(false)}
        onConfirm={handleMobileNumberSubmit}
        isLoading={payLoading}
      />

      <SiteFooter />
    </div>
  );
}
