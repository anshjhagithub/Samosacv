"use client";

import type { UserLimitsData } from "@/lib/types/limits";

export interface UserLimitsDisplayProps {
  limits: UserLimitsData | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export function UserLimitsDisplay({
  limits,
  loading,
  error,
  isAuthenticated,
}: UserLimitsDisplayProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-[#2d2640] bg-[#16121f]/80 px-4 py-3 text-sm text-gray-500">
        Loading your usage…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-[#2d2640] bg-[#16121f]/80 px-4 py-3 text-sm text-gray-400">
        <span className="text-gray-500">Sign in</span> to see your free generations, premium status, and wallet balance.
      </div>
    );
  }

  if (!limits) {
    return (
      <div className="rounded-xl border border-[#2d2640] bg-[#16121f]/80 px-4 py-3 text-sm text-gray-500">
        Your usage will appear here after you sign in.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#2d2640] bg-[#16121f] px-4 py-3.5 text-sm shadow-sm">
      <div className="font-medium text-gray-400 text-xs uppercase tracking-wider mb-2">
        Your usage
      </div>
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-6 gap-y-2 sm:gap-6 text-gray-300">
        <span>
          Free: <strong className="text-white">{limits.free_generations_remaining}</strong> left
        </span>
        <span>
          Premium:{" "}
          <strong className={limits.premium_unlocked ? "text-accent" : "text-gray-500"}>
            {limits.premium_unlocked ? "Unlocked" : "Locked"}
          </strong>
        </span>
        {limits.premium_unlocked && (
          <span>
            Premium gens: <strong className="text-white">{limits.premium_generations_remaining}</strong>
          </span>
        )}
        <span>
          Wallet: <strong className="text-white">₹{limits.wallet_balance_rupees}</strong>
        </span>
      </div>
    </div>
  );
}
