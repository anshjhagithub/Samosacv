-- Builder improve credits: ₹1 per summary/project improvement.
CREATE TABLE IF NOT EXISTS public.improve_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type text NOT NULL CHECK (feature_type IN ('summary_improve', 'project_improve')),
  order_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  consumed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_improve_credits_user_type ON public.improve_credits (user_id, feature_type);
CREATE INDEX IF NOT EXISTS idx_improve_credits_consumed ON public.improve_credits (user_id, feature_type) WHERE consumed_at IS NULL;

ALTER TABLE public.improve_credits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own improve_credits" ON public.improve_credits;
CREATE POLICY "Users can read own improve_credits" ON public.improve_credits
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage improve_credits" ON public.improve_credits;
CREATE POLICY "Service role can manage improve_credits" ON public.improve_credits
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

COMMENT ON TABLE public.improve_credits IS '₹1 builder improve credits (summary/project). Consumed when user uses AI improve.';
