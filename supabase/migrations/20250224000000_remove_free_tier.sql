-- Remove free tier: relax constraints that enforced 2 free generations

-- Drop the old check constraint on free_generations_used (allows <= 2)
ALTER TABLE public.user_limits DROP CONSTRAINT IF EXISTS user_limits_free_generations_used_check;

-- Re-add a looser constraint (keeps column but no upper bound)
ALTER TABLE public.user_limits ADD CONSTRAINT user_limits_free_generations_used_check CHECK (free_generations_used >= 0);

-- Update generation_tokens: keep 'free' as a valid legacy value but add no new constraint
-- (existing rows may reference 'free', so we don't remove it)

-- Update audit_generations: same reasoning, keep 'free' as legacy
-- No constraint changes needed

COMMENT ON TABLE public.user_limits IS 'No free tier. Paid only: ₹15 per AI resume via cart checkout, or ₹49 pack for 5 generations.';
