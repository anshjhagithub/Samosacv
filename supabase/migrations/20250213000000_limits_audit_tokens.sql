-- User limits and wallet (enforced server-side only)
CREATE TABLE IF NOT EXISTS public.user_limits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  free_generations_used INT NOT NULL DEFAULT 0 CHECK (free_generations_used >= 0 AND free_generations_used <= 2),
  premium_generations_remaining INT NOT NULL DEFAULT 0 CHECK (premium_generations_remaining >= 0),
  wallet_balance_paise INT NOT NULL DEFAULT 0 CHECK (wallet_balance_paise >= 0),
  premium_unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One-time generation tokens (created by Edge Function check-allocate)
CREATE TABLE IF NOT EXISTS public.generation_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model TEXT NOT NULL CHECK (model IN ('basic', 'premium')),
  allocation_type TEXT NOT NULL CHECK (allocation_type IN ('free', 'premium_pack', 'premium_pay_per_use')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at TIMESTAMPTZ
);

-- Audit log for every generation (tokens, costs, free vs paid)
CREATE TABLE IF NOT EXISTS public.audit_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_token_id UUID REFERENCES public.generation_tokens(id),
  model TEXT NOT NULL CHECK (model IN ('basic', 'premium')),
  free_or_paid TEXT NOT NULL CHECK (free_or_paid IN ('free', 'premium_pack', 'premium_pay_per_use')),
  tokens_used INT NOT NULL DEFAULT 0,
  api_cost_paise INT NOT NULL DEFAULT 0,
  platform_fee_paise INT NOT NULL DEFAULT 0,
  total_cost_paise INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments / top-ups (₹49 = 4900 paise for 6 premium; wallet top-up for pay-per-use)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_paise INT NOT NULL CHECK (amount_paise > 0),
  type TEXT NOT NULL CHECK (type IN ('premium_pack', 'wallet_topup')),
  premium_generations_added INT DEFAULT 0,
  wallet_balance_added_paise INT DEFAULT 0,
  external_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generation_tokens_user_unused ON public.generation_tokens(user_id) WHERE used_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_audit_generations_user ON public.audit_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_generations_created ON public.audit_generations(created_at);

-- RLS: only service role and Edge Functions (via service role) can read/write
ALTER TABLE public.user_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- No policies: only service role can access (anon and authenticated cannot)
CREATE POLICY "Service role only user_limits" ON public.user_limits FOR ALL USING (false);
CREATE POLICY "Service role only generation_tokens" ON public.generation_tokens FOR ALL USING (false);
CREATE POLICY "Service role only audit_generations" ON public.audit_generations FOR ALL USING (false);
CREATE POLICY "Service role only payments" ON public.payments FOR ALL USING (false);

-- Allow service role full access (by default service_role bypasses RLS in Supabase)
-- Users can read their own limits via Edge Function get-limits (Edge Function uses service role to read and returns only their row)
COMMENT ON TABLE public.user_limits IS 'Enforced only in Edge Functions. 2 free basic generations; premium via ₹49 pack (6 gens) or pay-per-use (₹5 + API).';
COMMENT ON TABLE public.audit_generations IS 'Full audit: tokens_used, api_cost_paise, platform_fee_paise, total_cost_paise, free_or_paid.';
