"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserLimitsData } from "@/lib/types/limits";

const GET_LIMITS_FN = "get-limits";

export interface UseUserLimitsResult {
  limits: UserLimitsData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isAuthenticated: boolean;
}

export function useUserLimits(): UseUserLimitsResult {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [limits, setLimits] = useState<UserLimitsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLimits = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      setLimits(null);
      setUser(null);
      setLoading(false);
      return;
    }
    setUser(session.user);
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke<UserLimitsData>(GET_LIMITS_FN);
      if (fnError) {
        setError(fnError.message ?? "Failed to load limits");
        setLimits(null);
        return;
      }
      if (data && typeof data === "object" && "free_generations_remaining" in data) {
        setLimits(data);
      } else {
        setLimits(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load limits");
      setLimits(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchLimits();
      } else {
        setUser(null);
        setLimits(null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchLimits();
      } else {
        setUser(null);
        setLimits(null);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchLimits]);

  const refresh = useCallback(async () => {
    await fetchLimits();
  }, [fetchLimits]);

  return {
    limits,
    loading,
    error,
    refresh,
    isAuthenticated: !!user,
  };
}
