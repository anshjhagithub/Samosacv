"use client";

import type { PaymentRequiredCode } from "@/lib/types/limits";

export interface PaymentRequiredModalProps {
  code: PaymentRequiredCode;
  open: boolean;
  onClose: () => void;
  /** Optional: trigger payment flow (Cashfree). */
  onUpgrade?: () => void;
  onUnlockPremium?: () => void;
  onRechargeWallet?: () => void;
}

const titles: Record<PaymentRequiredCode, string> = {
  FREE_LIMIT_REACHED: "Free generations used",
  PREMIUM_LOCKED: "Unlock premium",
  INSUFFICIENT_FUNDS: "Wallet recharge",
};

const messages: Record<PaymentRequiredCode, string> = {
  FREE_LIMIT_REACHED:
    "You've used your 2 free resume generations. Upgrade to continue creating resumes.",
  PREMIUM_LOCKED:
    "Unlock premium for ₹49 and get 6 premium generations, or use pay-per-use with your wallet.",
  INSUFFICIENT_FUNDS:
    "Add balance to your wallet to use premium generations (₹5 + API cost per generation).",
};

export function PaymentRequiredModal({
  code,
  open,
  onClose,
  onUpgrade,
  onUnlockPremium,
  onRechargeWallet,
}: PaymentRequiredModalProps) {
  if (!open) return null;

  const title = titles[code];
  const message = messages[code];

  const primaryAction =
    code === "FREE_LIMIT_REACHED"
      ? onUpgrade
      : code === "PREMIUM_LOCKED"
        ? onUnlockPremium
        : onRechargeWallet;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[#2d2640] bg-[#16121f] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <h2 id="payment-modal-title" className="text-lg font-semibold text-white mb-2">
          {title}
        </h2>
        <p className="text-gray-400 text-sm mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          {primaryAction && (
            <button
              type="button"
              onClick={() => {
                primaryAction();
                onClose();
              }}
              className="flex-1 rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              {code === "FREE_LIMIT_REACHED"
                ? "Upgrade"
                : code === "PREMIUM_LOCKED"
                  ? "Unlock for ₹49"
                  : "Recharge wallet"}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[#2d2640] bg-transparent px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
