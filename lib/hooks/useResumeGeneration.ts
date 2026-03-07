"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PaymentRequiredCode } from "@/lib/types/limits";
import type { UserLimitsData } from "@/lib/types/limits";

export type AllocateSuccess = { token: string; jwt: string };
export type AllocateError =
  | { code: "UNAUTHORIZED"; message: string }
  | { code: PaymentRequiredCode; message: string }
  | { code: string; message: string };

export interface UseResumeGenerationOptions {
  /** Called after a successful allocation so UI can refresh limits. */
  onSuccess?: () => void | Promise<void>;
  /** Current limits for fallback when backend returns generic 402. */
  limits: UserLimitsData | null;
}

export interface UseResumeGenerationResult {
  allocate: (model: "basic" | "premium") => Promise<AllocateSuccess | AllocateError>;
  loading: boolean;
  error: string | null;
  paymentRequiredCode: PaymentRequiredCode | null;
  clearPaymentRequired: () => void;
}

function inferPaymentCode(
  model: "basic" | "premium",
  limits: UserLimitsData | null
): PaymentRequiredCode {
  if (model === "basic") return "FREE_LIMIT_REACHED";
  if (!limits?.premium_unlocked) return "PREMIUM_LOCKED";
  return "INSUFFICIENT_FUNDS";
}

/**
 * Allocates a generation via /api/allocate (proxies to Supabase Edge Function check-allocate).
 * Avoids client-side "Failed to send a request to the Edge Function" by calling our API instead.
 */
export function useResumeGeneration(
  options: UseResumeGenerationOptions
): UseResumeGenerationResult {
  const { limits } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentRequiredCode, setPaymentRequiredCode] = useState<PaymentRequiredCode | null>(null);

  const clearPaymentRequired = useCallback(() => {
    setPaymentRequiredCode(null);
  }, []);

  const allocate = useCallback(
    async (model: "basic" | "premium"): Promise<AllocateSuccess | AllocateError> => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        return { code: "UNAUTHORIZED", message: "Please sign in to generate a resume." };
      }

      setLoading(true);
      setError(null);
      setPaymentRequiredCode(null);

      try {
        const res = await fetch("/api/allocate", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ model }),
        });
        const data = await res.json().catch(() => ({}));

        if (res.status === 401) {
          const msg = data.error ?? "Please sign in to generate a resume.";
          setError(msg);
          return { code: "UNAUTHORIZED", message: msg };
        }

        if (res.status === 402) {
          const code: PaymentRequiredCode =
            data.code === "FREE_LIMIT_REACHED" ||
            data.code === "PREMIUM_LOCKED" ||
            data.code === "INSUFFICIENT_FUNDS"
              ? data.code
              : inferPaymentCode(model, limits);
          const message = data.message ?? data.error ?? "Payment required.";
          setPaymentRequiredCode(code);
          setError(message);
          return { code, message };
        }

        if (res.status === 503 || !res.ok) {
          const msg = data.error ?? "Generation service unavailable.";
          setError(msg);
          return { code: data.code ?? "UNKNOWN", message: msg };
        }

        if (data.token && typeof data.token === "string") {
          return { token: data.token, jwt: session.access_token };
        }

        const fallback = data.message ?? data.error ?? "No token returned";
        setError(fallback);
        return { code: "UNKNOWN", message: fallback };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Could not start generation";
        setError(msg);
        return { code: "UNKNOWN", message: msg };
      } finally {
        setLoading(false);
      }
    },
    [limits]
  );

  return {
    allocate,
    loading,
    error,
    paymentRequiredCode,
    clearPaymentRequired,
  };
}
