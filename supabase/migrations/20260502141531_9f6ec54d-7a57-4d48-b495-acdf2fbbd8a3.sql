-- Fix commission helper functions to use existing ayuzee_wallets / ayuzee_wallet_transactions
-- (the previously referenced public.wallets / public.wallet_transactions tables do not exist).

CREATE OR REPLACE FUNCTION public.credit_commission_to_wallet(
  user_id_param uuid,
  amount_param numeric,
  order_id_param uuid,
  commission_tx_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  wid uuid;
  amt_int int := GREATEST(0, ROUND(amount_param)::int);
BEGIN
  IF user_id_param IS NULL OR amt_int <= 0 THEN
    RETURN false;
  END IF;

  SELECT id INTO wid FROM public.ayuzee_wallets WHERE user_id = user_id_param;
  IF wid IS NULL THEN
    INSERT INTO public.ayuzee_wallets(user_id) VALUES (user_id_param) RETURNING id INTO wid;
  END IF;

  -- sync_ayuzee_balance trigger updates the wallet balance automatically
  INSERT INTO public.ayuzee_wallet_transactions(wallet_id, type, amount, description, source, reference_id)
  VALUES (
    wid,
    'credit',
    amt_int,
    'Commission earned from order',
    'commission',
    COALESCE(commission_tx_id::text, order_id_param::text)
  );

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_wallet_balance(user_id_param uuid)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_balance numeric(10,2);
BEGIN
  SELECT balance INTO current_balance
  FROM public.ayuzee_wallets
  WHERE user_id = user_id_param;

  RETURN COALESCE(current_balance, 0);
END;
$$;