"use client";

import { useState } from "react";
import Link from "next/link";
import { useUserLimits } from "@/lib/hooks/useUserLimits";
import { openCashfreeCheckout } from "@/lib/cashfree";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Get started with AI resume extraction and the builder.",
    features: [
      "2 free resume generations (Basic model)",
      "PDF & text import",
      "Job description tailoring",
      "All 35+ templates",
      "Export to PDF/PNG",
    ],
    cta: "Start free",
    href: "/create",
    accent: false,
  },
  {
    name: "Premium pack",
    price: "₹49",
    period: "one-time",
    description: "Unlock premium model and get 6 premium generations.",
    features: [
      "Unlock Premium AI model",
      "6 premium generations included",
      "Higher-quality, ATS-optimized output",
      "Pay-per-use after 6: ₹5 + API cost per generation",
    ],
    cta: "Unlock for ₹49",
    href: "#",
    accent: true,
    isPayButton: true,
  },
  {
    name: "Wallet (pay-per-use)",
    price: "₹5",
    period: "+ API cost per gen",
    description: "Add balance and use Premium without the pack.",
    features: [
      "Recharge wallet anytime",
      "₹5 platform fee + actual API cost per generation",
      "Use when you've used pack generations",
      "No subscription",
    ],
    cta: "Recharge wallet",
    href: "/create",
    accent: false,
  },
];

const PREMIUM_AMOUNT = 49;

export default function PricingPage() {
  const { limits, isAuthenticated, refresh } = useUserLimits();
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const handlePayNow = async () => {
    if (!isAuthenticated) return;
    setPayError(null);
    setPayLoading(true);
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: PREMIUM_AMOUNT }),
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
      await refresh();
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setPayLoading(false);
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
            <Link href="/create" className="text-sm text-gray-400 hover:text-white transition-colors">
              Create resume
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-serif text-white">
            Simple, transparent pricing
          </h1>
          <p className="mt-3 text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
            Start free. Unlock Premium for higher-quality, ATS-optimized resumes when you need them.
          </p>
          {isAuthenticated && limits && (
            <div className="mt-4 inline-flex items-center gap-4 rounded-xl border border-[#2d2640] bg-[#16121f] px-4 py-2 text-sm text-gray-300">
              <span>Free: <strong className="text-white">{limits.free_generations_remaining}</strong> left</span>
              <span>Premium: <strong className={limits.premium_unlocked ? "text-accent" : "text-gray-500"}>{limits.premium_unlocked ? "Unlocked" : "Locked"}</strong></span>
              <span>Wallet: <strong className="text-white">₹{limits.wallet_balance_rupees}</strong></span>
            </div>
          )}
        </div>

        {payError && (
          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm text-center">
            {payError}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 sm:p-8 flex flex-col ${
                plan.accent
                  ? "border-accent/50 bg-accent/5 shadow-glow"
                  : "border-[#2d2640] bg-[#16121f]"
              }`}
            >
              <h2 className="text-lg font-semibold text-white">{plan.name}</h2>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-bold text-white">{plan.price}</span>
                <span className="text-sm text-gray-500">{plan.period}</span>
              </div>
              <p className="mt-3 text-gray-400 text-sm">{plan.description}</p>
              <ul className="mt-6 space-y-2.5 text-sm text-gray-300 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-accent shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              {(plan as { isPayButton?: boolean }).isPayButton ? (
                <button
                  type="button"
                  onClick={handlePayNow}
                  disabled={!isAuthenticated || payLoading}
                  className="mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold bg-accent text-white hover:bg-accent/90 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {!isAuthenticated
                    ? "Sign in to pay"
                    : payLoading
                      ? "Opening checkout…"
                      : plan.cta}
                </button>
              ) : (
                <Link
                  href={plan.href}
                  className={`mt-6 block w-full text-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    plan.accent
                      ? "bg-accent text-white hover:bg-accent/90 shadow-glow"
                      : "border border-[#2d2640] text-white hover:bg-white/5"
                  }`}
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-gray-500 text-xs">
          All enforcement is server-side. Payment required only after 2 free generations. Premium unlock is one-time; wallet is pay-per-use.
        </p>
      </main>
    </div>
  );
}
