-- Commission rules table
CREATE TABLE IF NOT EXISTS public.commission_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('fixed', 'percentage', 'tiered')),
  applicable_to JSONB NOT NULL DEFAULT '{"type":"all","values":[]}'::jsonb,
  commission_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commission_rules_active ON public.commission_rules(is_active, priority DESC);
CREATE INDEX IF NOT EXISTS idx_commission_rules_validity ON public.commission_rules(valid_from, valid_until);

ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;

-- Admins/super_admins can view
CREATE POLICY "Admins view commission rules"
ON public.commission_rules FOR SELECT
TO authenticated
USING (public.is_admin_or_super(auth.uid()));

CREATE POLICY "Admins insert commission rules"
ON public.commission_rules FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE POLICY "Admins update commission rules"
ON public.commission_rules FOR UPDATE
TO authenticated
USING (public.is_admin_or_super(auth.uid()));

CREATE POLICY "Admins delete commission rules"
ON public.commission_rules FOR DELETE
TO authenticated
USING (public.is_admin_or_super(auth.uid()));

-- Updated_at trigger
CREATE TRIGGER update_commission_rules_updated_at
BEFORE UPDATE ON public.commission_rules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();