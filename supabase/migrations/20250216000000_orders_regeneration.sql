-- Orders: cart checkout per resume (micro-transactions).
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id text,
  line_items jsonb NOT NULL DEFAULT '{}',
  amount_paise integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  cashfree_payment_id text,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_status ON public.orders (user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_resume ON public.orders (user_id, resume_id) WHERE resume_id IS NOT NULL;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
CREATE POLICY "Users can read own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage orders" ON public.orders;
CREATE POLICY "Service role can manage orders" ON public.orders
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Regeneration history: ₹2 per regeneration.
CREATE TABLE IF NOT EXISTS public.regeneration_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id text NOT NULL,
  order_id text,
  amount_paise integer NOT NULL DEFAULT 200,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_regen_user_resume ON public.regeneration_history (user_id, resume_id);

ALTER TABLE public.regeneration_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own regeneration" ON public.regeneration_history;
CREATE POLICY "Users can read own regeneration" ON public.regeneration_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage regeneration" ON public.regeneration_history;
CREATE POLICY "Service role can manage regeneration" ON public.regeneration_history
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

COMMENT ON TABLE public.orders IS 'Micro-transaction orders: resume_pdf + add-ons per resume.';
COMMENT ON TABLE public.regeneration_history IS '₹2 regeneration payments per resume.';
