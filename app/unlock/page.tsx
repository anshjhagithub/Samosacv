"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { SamosaLogoFull } from "@/components/brand/SamosaLogo";
import { loadResume, getUnlockPreview, setUnlockPreview } from "@/lib/storage/resumeStorage";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { FEATURE_PRICING } from "@/lib/pricing";
import { openCashfreeCheckout } from "@/lib/cashfree";
import type { ResumeData } from "@/types/resume";
import { MobileNumberModal } from "@/components/pricing/MobileNumberModal";

export default function UnlockPage() {
  const router = useRouter();
  const [data, setData] = useState<ResumeData | null>(null);
  const [preview, setPreview] = useState(getUnlockPreview());
  const [loading, setLoading] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);

  useEffect(() => {
    try {
      const resumeData = loadResume();
      if (!resumeData) {
        router.replace("/create");
        return;
      }
      setData(resumeData);
    } catch (e) {
      console.error("Failed to load resume:", e);
      router.replace("/create");
    }
  }, [router]);

  const handlePurchase = async (mobile?: string) => {
    if (!data || !preview) return;
    
    setLoading(true);
    try {
      // Load addon cart from localStorage if any
      let cart: Record<string, boolean> = { resume_pdf: true };
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('samosa_builder_addon_cart');
          if (saved) {
            const parsed = JSON.parse(saved);
            cart = { ...cart, ...parsed };
          }
        } catch {}
      }

      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          resumeId: preview.resumeId,
          mobileNumber: mobile || preview.customerPhone,
        }),
      });

      const j = await res.json();
      if (!res.ok) {
        // If the error indicates missing mobile number, show modal
        if (j.error?.toLowerCase().includes("phone") || j.error?.toLowerCase().includes("mobile")) {
          setShowMobileModal(true);
          return;
        }
        throw new Error(j.error || "Failed to create order");
      }

      if (j.payment_session_id) {
        await openCashfreeCheckout(j.payment_session_id);
        // After checkout is opened, it will redirect via return_url in cashfree
      } else {
        throw new Error("No payment session received");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!data || !preview) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <SamosaLogoFull className="h-8" />
            </Link>
            <Link
              href="/builder"
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              Back to Builder
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-4">
            Unlock Your Resume Download
          </h1>
          <p className="text-lg text-stone-600">
            Get your professional resume in PDF format for just ₹{FEATURE_PRICING.resume_pdf}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resume Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-4">Your Resume</h2>
            <div className="border border-stone-200 rounded-lg overflow-hidden">
              <ResumePreview data={data} />
            </div>
          </div>

          {/* Purchase Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-stone-900 mb-2">
                ₹{FEATURE_PRICING.resume_pdf}
              </div>
              <div className="text-stone-600">Professional Resume PDF</div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-stone-700">Professional PDF format</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-stone-700">ATS-friendly format</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-stone-700">Instant download</span>
              </div>
            </div>

            <button
              onClick={() => handlePurchase()}
              disabled={loading}
              className="w-full bg-amber-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Download Resume PDF"}
            </button>

            <div className="mt-4 text-center">
              <Link href="/builder" className="text-amber-600 hover:text-amber-700 text-sm">
                Continue editing
              </Link>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showMobileModal && (
          <MobileNumberModal
            isOpen={showMobileModal}
            isLoading={loading}
            onClose={() => setShowMobileModal(false)}
            onConfirm={async (phone: string) => {
              setShowMobileModal(false);
              const updatedPreview = { ...preview, customerPhone: phone };
              setUnlockPreview(updatedPreview);
              setPreview(updatedPreview);
              await handlePurchase(phone);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
