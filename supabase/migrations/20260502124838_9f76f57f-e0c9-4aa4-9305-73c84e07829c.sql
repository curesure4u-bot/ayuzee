-- ============================================================================
-- FUNCTION: Calculate commission for an order
-- ============================================================================
CREATE OR REPLACE FUNCTION public.calculate_order_commission(order_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_total NUMERIC(10,2);
  doctor_id UUID;
  commission_breakdown JSONB;
  rule RECORD;
  doctor_commission NUMERIC(10,2) := 0;
  platform_fee NUMERIC(10,2) := 0;
BEGIN
  SELECT total_amount, referring_doctor_id
  INTO order_total, doctor_id
  FROM public.orders
  WHERE id = order_id_param;

  SELECT * INTO rule
  FROM public.commission_rules
  WHERE is_active = true
    AND CURRENT_DATE >= valid_from
    AND (valid_until IS NULL OR CURRENT_DATE <= valid_until)
  ORDER BY priority DESC
  LIMIT 1;

  IF rule.rule_type = 'percentage' THEN
    doctor_commission := order_total * (rule.commission_breakdown->>'doctor')::NUMERIC / 100;
    platform_fee := order_total * (rule.commission_breakdown->>'platform')::NUMERIC / 100;
  ELSIF rule.rule_type = 'fixed' THEN
    doctor_commission := (rule.commission_breakdown->>'doctor')::NUMERIC;
    platform_fee := (rule.commission_breakdown->>'platform')::NUMERIC;
  END IF;

  commission_breakdown := jsonb_build_object(
    'doctor_commission', doctor_commission,
    'platform_fee', platform_fee,
    'rule_id', rule.id,
    'rule_name', rule.name
  );

  RETURN commission_breakdown;
END;
$$;

-- ============================================================================
-- FUNCTION: Credit commission to wallet
-- ============================================================================
CREATE OR REPLACE FUNCTION public.credit_commission_to_wallet(
  user_id_param UUID,
  amount_param NUMERIC(10,2),
  order_id_param UUID,
  commission_tx_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  wallet_record RECORD;
  new_balance NUMERIC(10,2);
BEGIN
  SELECT * INTO wallet_record FROM public.wallets WHERE user_id = user_id_param;

  IF NOT FOUND THEN
    INSERT INTO public.wallets (user_id, balance, total_earned)
    VALUES (user_id_param, amount_param, amount_param)
    RETURNING * INTO wallet_record;
    new_balance := wallet_record.balance;
  ELSE
    new_balance := wallet_record.balance + amount_param;
    UPDATE public.wallets
    SET balance = new_balance,
        total_earned = total_earned + amount_param,
        updated_at = NOW()
    WHERE user_id = user_id_param;
  END IF;

  INSERT INTO public.wallet_transactions (
    wallet_id, user_id, transaction_type, amount,
    balance_before, balance_after, order_id,
    commission_transaction_id, status, description
  ) VALUES (
    wallet_record.id, user_id_param, 'commission_credit', amount_param,
    COALESCE(wallet_record.balance, 0) - CASE WHEN wallet_record.balance = new_balance THEN 0 ELSE 0 END,
    new_balance, order_id_param,
    commission_tx_id, 'completed', 'Commission earned from order'
  );

  RETURN true;
END;
$$;

-- ============================================================================
-- FUNCTION: Get wallet balance
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_wallet_balance(user_id_param UUID)
RETURNS NUMERIC(10,2)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance NUMERIC(10,2);
BEGIN
  SELECT balance INTO current_balance
  FROM public.wallets
  WHERE user_id = user_id_param;

  RETURN COALESCE(current_balance, 0);
END;
$$;

COMMENT ON FUNCTION public.calculate_order_commission IS 'Calculate commission breakdown for an order based on active rules';
COMMENT ON FUNCTION public.credit_commission_to_wallet IS 'Credit commission amount to user wallet and create transaction record';
COMMENT ON FUNCTION public.get_wallet_balance IS 'Get current wallet balance for a user';