-- commission_transactions
CREATE TABLE IF NOT EXISTS public.commission_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id UUID,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  commission_rule_id UUID REFERENCES public.commission_rules(id) ON DELETE SET NULL,
  beneficiary_type TEXT NOT NULL CHECK (beneficiary_type IN ('doctor','platform','manufacturer','supplier','referrer')),
  beneficiary_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  base_amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  commission_percentage DECIMAL(5,2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','credited','failed','reversed')),
  credited_at TIMESTAMPTZ,
  calculation_details JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ct_order ON public.commission_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_ct_beneficiary ON public.commission_transactions(beneficiary_id, beneficiary_type);
CREATE INDEX IF NOT EXISTS idx_ct_status ON public.commission_transactions(status);
CREATE INDEX IF NOT EXISTS idx_ct_created_at ON public.commission_transactions(created_at DESC);

ALTER TABLE public.commission_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Beneficiaries view own commission transactions" ON public.commission_transactions
  FOR SELECT TO authenticated
  USING (beneficiary_id = auth.uid() OR public.is_admin_or_super(auth.uid()));

CREATE POLICY "Admins manage commission transactions" ON public.commission_transactions
  FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

-- commission_wallets
CREATE TABLE IF NOT EXISTS public.commission_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) DEFAULT 0.00 CHECK (balance >= 0),
  pending_balance DECIMAL(10,2) DEFAULT 0.00,
  total_earned DECIMAL(10,2) DEFAULT 0.00,
  total_withdrawn DECIMAL(10,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  is_locked BOOLEAN DEFAULT false,
  locked_reason TEXT,
  locked_at TIMESTAMPTZ,
  locked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cw_balance ON public.commission_wallets(balance DESC);

CREATE TRIGGER commission_wallets_updated_at
  BEFORE UPDATE ON public.commission_wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.commission_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own commission wallet" ON public.commission_wallets
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_or_super(auth.uid()));

CREATE POLICY "Admins manage commission wallets" ON public.commission_wallets
  FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

-- Extend existing payout_requests with new fields
ALTER TABLE public.payout_requests
  ADD COLUMN IF NOT EXISTS wallet_id UUID REFERENCES public.commission_wallets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS requested_amount DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS processing_fee DECIMAL(10,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS final_payout_amount DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS payment_proof_url TEXT,
  ADD COLUMN IF NOT EXISTS processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- commission_wallet_transactions
CREATE TABLE IF NOT EXISTS public.commission_wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.commission_wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'commission_credit','referral_credit','bonus_credit','refund_credit',
    'adjustment_credit','withdrawal','reversal','penalty_debit','adjustment_debit'
  )),
  amount DECIMAL(10,2) NOT NULL,
  balance_before DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  commission_transaction_id UUID REFERENCES public.commission_transactions(id) ON DELETE SET NULL,
  payout_request_id UUID REFERENCES public.payout_requests(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending','completed','failed','reversed')),
  description TEXT,
  metadata JSONB,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cwt_wallet ON public.commission_wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_cwt_user ON public.commission_wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_cwt_type ON public.commission_wallet_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_cwt_created_at ON public.commission_wallet_transactions(created_at DESC);

ALTER TABLE public.commission_wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own wallet transactions" ON public.commission_wallet_transactions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_or_super(auth.uid()));

CREATE POLICY "Admins manage wallet transactions" ON public.commission_wallet_transactions
  FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));