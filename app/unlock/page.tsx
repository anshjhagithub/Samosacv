"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

const ADDON_LABELS: Record<string, string> = {
  resume_pdf: "Resume PDF (clean download)",
  ats_breakdown: "Full ATS breakdown",
  skill_roadmap: "Skill roadmap",
  linkedin_optimizer: "LinkedIn optimizer",
  cover_letter: "Cover letter",
  interview_pack: "Interview pack",
};

export default function UnlockPage() {
  const router = useRouter();
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [preview, setPreview] = useState<{ resumeId: string; atsScore: number; missingSkills: string[]; targetRole?: string } | null>(null);
  const [cart, setCart] = useState(() => getDefaultCart());
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    const r = loadResume();
    const p = getUnlockPreview();
    if (!r) {
      router.replace("/create");
      return;
    }
    setResume(r);
    if (p) {
      setPreview(p);
    } else {
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
      if (!res.ok) {
        setPayError(data.error ?? "Failed to create order");
        return;
      }
      const sessionId = data.payment_session_id;
      if (!sessionId) {
        setPayError("No payment session received");
        return;
      }
      await openCashfreeCheckout(sessionId);
      router.push("/payment-status?order_id=" + encodeURIComponent(data.order_id));
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setPayLoading(false);
    }
  };

  const total = getCartTotal(cart);
  const addonCount = getAddonCount(cart);
  const atsScore = preview?.atsScore ?? 0;
  const missingSkills = preview?.missingSkills ?? [];
  const visibleSkills = missingSkills.slice(0, 3);
  const hiddenCount = Math.max(0, missingSkills.length - 3);
  const highlightAts = atsScore > 0 && atsScore < 75;
  const highlightInterview = atsScore >= 75;

  if (!resume) {
    return (
      <div className="min-h-screen bg-[#0c0a12] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0a12] theme-dark">
      <header className="border-b border-white/5 sticky top-0 z-20 bg-[#0c0a12]/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white font-semibold">
            <span className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 text-sm font-bold">A</span>
            ARTICULATED
          </Link>
          <Link href="/templates" className="text-sm text-gray-400 hover:text-white transition-colors">Skip to templates</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        <section>
          <h1 className="text-xl font-semibold text-white mb-4">Your resume preview</h1>
          <div className="rounded-xl border border-white/10 bg-[#16121f] p-4 overflow-auto max-h-[420px]">
            <div className="inline-block min-w-0">
              <ResumePreview data={resume} />
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-400">
            Download clean PDF after purchase. You can also continue to builder to edit.
          </p>
        </section>

        {atsScore > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Your ATS Score: {atsScore}/100</h2>
            <p className="text-sm text-amber-400/90">Unlock full breakdown to reach 90+</p>
          </section>
        )}

        {missingSkills.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              {missingSkills.length} high-demand skills missing — Unlock full report
            </h2>
            <ul className="space-y-1.5">
              {visibleSkills.map((s, i) => (
                <li key={i} className="text-sm text-gray-300">• {s}</li>
              ))}
              {hiddenCount > 0 && (
                <li className="text-sm text-gray-500 blur-sm select-none">
                  • {missingSkills[3]} • {missingSkills[4]} • +{hiddenCount} more
                </li>
              )}
            </ul>
          </section>
        )}

        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
          <h2 className="text-xl font-semibold text-white mb-1">Unlock Your Placement Toolkit</h2>
          <p className="text-sm text-gray-400 mb-4">Resume PDF required to download. Add what you need.</p>
          <p className="text-xs text-amber-400/80 mb-4">Most students also add ATS Breakdown + LinkedIn</p>

          <ul className="space-y-3 mb-6">
            <li className="flex items-center justify-between text-sm">
              <span className="text-gray-300">{ADDON_LABELS[BASE_PRODUCT] ?? BASE_PRODUCT}</span>
              <span className="text-white font-medium">₹{getPrice(BASE_PRODUCT)}</span>
            </li>
            {ADDON_SLUGS.map((slug) => (
              <li key={slug} className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!cart[slug]}
                    onChange={() => setCart(toggleCartItem(cart, slug))}
                    className="rounded border-white/30 bg-white/5 text-amber-500 focus:ring-amber-500"
                  />
                  <span className={`text-sm ${(slug === "ats_breakdown" && highlightAts) || (slug === "interview_pack" && highlightInterview) ? "text-amber-400 font-medium" : "text-gray-300"}`}>
                    {ADDON_LABELS[slug] ?? slug}
                  </span>
                </label>
                <span className="text-gray-400">₹{getPrice(slug as FeatureSlug)}</span>
              </li>
            ))}
          </ul>

          {addonCount >= 3 && (
            <p className="text-sm text-amber-400/90 mb-4">You’re building a complete placement kit.</p>
          )}

          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-white font-semibold">Total</span>
            <span className="text-xl font-bold text-amber-400">₹{total}</span>
          </div>
          {payError && <p className="mt-2 text-sm text-red-400">{payError}</p>}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={payLoading}
            className="mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
          >
            {payLoading ? "Opening checkout…" : `Pay ₹${total} & unlock`}
          </button>
        </section>

        <div className="flex gap-3">
          <Link
            href="/templates"
            className="flex-1 text-center rounded-xl border border-white/20 py-3 text-sm font-medium text-white hover:bg-white/5 transition-colors"
          >
            Continue to builder
          </Link>
        </div>
      </main>
    </div>
  );
}
