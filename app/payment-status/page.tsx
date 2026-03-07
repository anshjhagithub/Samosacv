"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { openCashfreeCheckout } from "@/lib/cashfree";

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const returnTo = searchParams.get("return");
  const [status, setStatus] = useState<"loading" | "success" | "failed" | "unknown">("loading");
  const [showUpsell, setShowUpsell] = useState(true);
  const [upsellLoading, setUpsellLoading] = useState(false);

  useEffect(() => {
    if (!orderId) { setStatus("unknown"); return; }
    setStatus("success");
  }, [orderId]);

  // After payment for "resume upload", send user back to /create with order_id so they can complete generation
  useEffect(() => {
    if (status === "success" && returnTo === "create" && orderId) {
      window.location.href = `/create?order_id=${encodeURIComponent(orderId)}`;
    }
  }, [status, returnTo, orderId]);

  const isRegenOrder = orderId?.startsWith("regen_") ?? false;
  const isUploadOrder = orderId?.startsWith("upload_") ?? false;

  const handleUpsell = async () => {
    setUpsellLoading(true);
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "upsell", amount: 12 }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.payment_session_id) {
        await openCashfreeCheckout(data.payment_session_id);
      }
    } finally { setUpsellLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="max-w-md w-full rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-lg"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {status === "loading" && (
          <>
            <div className="w-12 h-12 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-stone-500">Confirming your payment…</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-emerald-600 text-2xl">✓</div>
            <h1 className="text-xl font-bold text-stone-900 mb-2">Payment received</h1>
            <p className="text-stone-500 text-sm mb-6">
              {isRegenOrder
                ? "Your regeneration credit is ready. Go to the builder and click Regenerate."
                : isUploadOrder
                  ? "Redirecting you to finish your resume…"
                  : "Your placement toolkit is unlocked. Download your PDF."}
            </p>
            {!isUploadOrder && (
              <>
                <Link href="/builder" className="inline-block rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-700 transition-all shadow-md shadow-amber-900/10">
                  {isRegenOrder ? "Go to Builder" : "Go to Builder"}
                </Link>
                <span className="mx-2 text-stone-400">·</span>
                <Link href="/create" className="text-sm text-amber-700 hover:underline font-medium">Create another</Link>
              </>
            )}
            {showUpsell && !isRegenOrder && !isUploadOrder && (
              <div className="mt-8 pt-6 border-t border-stone-200 text-left">
                <p className="text-stone-900 font-semibold mb-1">Simulate your real interview?</p>
                <p className="text-stone-500 text-sm mb-3">Mock Interview Live — ₹12</p>
                <div className="flex gap-2">
                  <button type="button" onClick={handleUpsell} disabled={upsellLoading} className="flex-1 rounded-xl bg-amber-600 text-white py-2.5 text-sm font-semibold hover:bg-amber-700 disabled:opacity-50 transition-all">
                    {upsellLoading ? "Opening…" : "Add for ₹12"}
                  </button>
                  <button type="button" onClick={() => setShowUpsell(false)} className="px-4 py-2.5 text-sm text-stone-500 hover:text-stone-700 transition-colors">No thanks</button>
                </div>
              </div>
            )}
          </>
        )}
        {status === "failed" && (
          <>
            <p className="text-red-600 mb-4">Payment could not be completed.</p>
            <Link href="/unlock" className="text-amber-700 hover:underline font-medium">Try again</Link>
          </>
        )}
        {status === "unknown" && (
          <>
            <p className="text-stone-500 mb-4">No order information found.</p>
            <Link href="/unlock" className="text-amber-700 hover:underline font-medium">Unlock toolkit</Link>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    }>
      <PaymentStatusContent />
    </Suspense>
  );
}
