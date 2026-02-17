"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PaymentRequiredCode } from "@/lib/types/limits";
import type { UserLimitsData } from "@/lib/types/limits";

/** Try these in order; first successful name wins. Match your Supabase deployment (folder name). */
const GENERATE_RESUME_FN_NAMES = ["generate_resume", "check-allocate"];

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
 * Allocates a generation via generate_resume edge function. On 402, sets paymentRequiredCode
 * from backend or infers from model + limits. Use supabase.functions.invoke; no localStorage.
 */
export function useResumeGeneration(
  options: UseResumeGenerationOptions
): UseResumeGenerationResult {
  const { onSuccess, limits } = options;
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

      const supabaseUrl = typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
      if (!supabaseUrl) {
        setError("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL to your environment.");
        setLoading(false);
        return { code: "UNKNOWN", message: "Supabase is not configured." };
      }

      try {
        let data: unknown = null;
        let fnError: unknown = null;
        for (const fnName of GENERATE_RESUME_FN_NAMES) {
          const result = await supabase.functions.invoke<{
            token?: string;
            code?: string;
            message?: string;
          }>(fnName, { body: { model } });
          data = result.data;
          fnError = result.error;
          if (!result.error) break;
          const msg = (result.error as { message?: string })?.message ?? "";
          if (msg.includes("Failed to send a request") || msg.includes("fetch") || msg.includes("Network")) {
            continue;
          }
          break;
        }

        if (fnError) {
          let code: PaymentRequiredCode = inferPaymentCode(model, limits);
          let message = (fnError as { message?: string }).message ?? "Payment required";
          const ctx = (fnError as { context?: Response }).context;
          if (ctx && typeof (ctx as Response).json === "function") {
            try {
              const body = await (ctx as Response).json();
              if (
                body?.code === "FREE_LIMIT_REACHED" ||
                body?.code === "PREMIUM_LOCKED" ||
                body?.code === "INSUFFICIENT_FUNDS"
              ) {
                code = body.code;
              }
              if (body?.message) message = body.message;
            } catch (_) {
              /* use inferred code */
            }
          }
          setPaymentRequiredCode(code);
          setError(message);
          return { code, message };
        }

        const body = typeof data === "object" && data ? data : null;
        if (body && typeof (body as { token?: string }).token === "string") {
          const token = (body as { token: string }).token;
          return { token, jwt: session.access_token };
        }

        setError((body as { message?: string })?.message ?? "No token returned");
        return {
          code: "UNKNOWN",
          message: (body as { message?: string })?.message ?? "No token returned",
        };
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
