
CREATE OR REPLACE FUNCTION public.trigger_credit_referral()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer uuid;
  v_wallet_id uuid;
  v_commission numeric;
  v_existing uuid;
BEGIN
  IF NEW.payment_status <> 'paid' THEN
    RETURN NEW;
  END IF;

  -- Skip if already credited (idempotency)
  SELECT id INTO v_existing
  FROM public.ayuzee_transactions
  WHERE order_id = NEW.id AND type = 'referral_credit'
  LIMIT 1;
  IF v_existing IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Find buyer's referrer
  SELECT referred_by INTO v_referrer
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  IF v_referrer IS NULL THEN
    RETURN NEW;
  END IF;

  -- Ensure referrer wallet exists
  SELECT id INTO v_wallet_id
  FROM public.ayuzee_wallets
  WHERE user_id = v_referrer
  LIMIT 1;

  IF v_wallet_id IS NULL THEN
    INSERT INTO public.ayuzee_wallets (user_id)
    VALUES (v_referrer)
    RETURNING id INTO v_wallet_id;
  END IF;

  v_commission := round(coalesce(NEW.total, 0) * 0.05);
  IF v_commission <= 0 THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.ayuzee_transactions
    (wallet_id, user_id, type, amount, order_id, reason)
  VALUES
    (v_wallet_id, v_referrer, 'referral_credit', v_commission, NEW.id,
     'Referral commission · 5% of ₹' || NEW.total::text);

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block the order write because of referral side-effects
  RAISE WARNING 'trigger_credit_referral failed for order %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;
