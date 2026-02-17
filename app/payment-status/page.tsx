"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { openCashfreeCheckout } from "@/lib/cashfree";

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [status, setStatus] = useState<"loading" | "success" | "failed" | "unknown">("loading");
  const [showUpsell, setShowUpsell] = useState(true);
  const [upsellLoading, setUpsellLoading] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setStatus("unknown");
      return;
    }
    setStatus("success");
  }, [orderId]);

  const isRegenOrder = orderId?.startsWith("regen_") ?? false;

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
    } finally {
      setUpsellLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0a12] theme-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl border border-[#2d2640] bg-[#16121f] p-8 text-center">
        {status === "loading" && (
          <>
            <div className="w-12 h-12 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Confirming your payment…</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-14 h-14 rounded-full bg-accent/20 border border-accent flex items-center justify-center mx-auto mb-4 text-accent text-2xl">✓</div>
            <h1 className="text-xl font-semibold text-white mb-2">Payment received</h1>
            <p className="text-gray-400 text-sm mb-6">
              {isRegenOrder
                ? "Your regeneration credit is ready. Go to the builder and click Regenerate to get your improved resume."
                : "Your placement toolkit is unlocked. Download your PDF and use the builder."}
            </p>
            <Link
              href="/builder"
              className="inline-block rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white"
            >
              {isRegenOrder ? "Go to Builder & Regenerate" : "Go to Builder"}
            </Link>
            <span className="mx-2 text-gray-500">·</span>
            <Link href="/create" className="text-sm text-accent hover:underline">
              Create another
            </Link>
            {showUpsell && !isRegenOrder && (
              <div className="mt-8 pt-6 border-t border-white/10 text-left">
                <p className="text-white font-medium mb-1">Want to simulate your real interview?</p>
                <p className="text-gray-400 text-sm mb-3">Mock Interview Live – ₹12</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleUpsell}
                    disabled={upsellLoading}
                    className="flex-1 rounded-xl bg-amber-500 text-black py-2.5 text-sm font-semibold hover:bg-amber-400 disabled:opacity-50"
                  >
                    {upsellLoading ? "Opening…" : "Add for ₹12"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUpsell(false)}
                    className="px-4 py-2.5 text-sm text-gray-400 hover:text-white"
                  >
                    No thanks
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        {status === "failed" && (
          <>
            <p className="text-red-400 mb-4">Payment could not be completed.</p>
            <Link href="/unlock" className="text-accent hover:underline">
              Try again
            </Link>
          </>
        )}
        {status === "unknown" && (
          <>
            <p className="text-gray-400 mb-4">No order information found.</p>
            <Link href="/unlock" className="text-accent hover:underline">
              Unlock toolkit
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0c0a12] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}
