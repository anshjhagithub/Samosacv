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
    
    // Explicitly verify payment with backend before showing success
    const verifyPayment = async () => {
      try {
        const res = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        const data = await res.json();
        
        if (data.status === "PAID") {
          setStatus("success");
        } else {
          setStatus("failed");
        }
      } catch (e) {
        setStatus("failed");
      }
    };
    
    verifyPayment();
  }, [orderId]);

  // After payment for "resume upload", send user back to /create with order_id so they can complete generation
  useEffect(() => {
    if (status === "success" && returnTo === "create" && orderId) {
      window.location.href = `/create?order_id=${encodeURIComponent(orderId)}`;
    }
  }, [status, returnTo, orderId]);

  // After payment for unlock/regular order, set payment flag but don't redirect
  useEffect(() => {
    if (status === "success" && !returnTo && orderId) {
      // Set a flag in localStorage to indicate payment was successful for this order
      if (typeof window !== "undefined") {
        localStorage.setItem(`payment_success_${orderId}`, "true");
      }
    }
  }, [status, orderId, returnTo]);

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
            <h1 className="text-xl font-bold text-stone-900 mb-2">Payment successful</h1>
            <p className="text-stone-500 text-sm mb-6">
              {isRegenOrder
                ? "Your regeneration credit is ready. Go to the builder and click Regenerate."
                : isUploadOrder
                  ? "Redirecting you to finish your resume…"
                  : "Your resume is ready for download."}
            </p>
            {!isUploadOrder && (
              <>
                {isRegenOrder ? (
                  <Link href="/builder" className="inline-block rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-700 transition-all shadow-md shadow-amber-900/10">
                    Go to Builder
                  </Link>
                ) : (
                  <Link href="/resume/review" className="inline-block rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-all shadow-md shadow-emerald-900/10">
                    Download Resume
                  </Link>
                )}
              </>
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
