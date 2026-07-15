-- 1. Extend ayuzee_txn_type enum
ALTER TYPE public.ayuzee_txn_type ADD VALUE IF NOT EXISTS 'referral_credit';

-- 2. Add referral fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by UUID;

CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);

-- 3. Helper: generate a unique 8-char referral code (AYZ-XXXXX)
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alphabet TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code TEXT;
  exists_already BOOLEAN;
  i INT;
BEGIN
  LOOP
    code := 'AYZ-';
    FOR i IN 1..5 LOOP
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::INT, 1);
    END LOOP;
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = code) INTO exists_already;
    EXIT WHEN NOT exists_already;
  END LOOP;
  RETURN code;
END;
$$;

-- 4. Backfill referral codes for existing profiles
UPDATE public.profiles
SET referral_code = public.generate_referral_code()
WHERE referral_code IS NULL;

-- 5. Update handle_new_user trigger to set referral_code + referred_by
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref_code_input TEXT;
  ref_user_id UUID;
BEGIN
  ref_code_input := NULLIF(NEW.raw_user_meta_data ->> 'ref_code', '');

  IF ref_code_input IS NOT NULL THEN
    SELECT user_id INTO ref_user_id
    FROM public.profiles
    WHERE referral_code = ref_code_input
    LIMIT 1;
  END IF;

  INSERT INTO public.profiles (user_id, full_name, phone, referral_code, referred_by)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    public.generate_referral_code(),
    ref_user_id
  );
  RETURN NEW;
END;
$$;

-- 6. Enable pg_net (for HTTP calls from triggers)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 7. Trigger function: when an order is paid, call credit-referral edge function
CREATE OR REPLACE FUNCTION public.trigger_credit_referral()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  fn_url TEXT := 'https://saphetdusyfrcduzsouk.supabase.co/functions/v1/credit-referral';
  anon_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhcGhldGR1c3lmcmNkdXpzb3VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODcyNjgsImV4cCI6MjA5MjI2MzI2OH0.X4k1jO7nujGt7TfDjrQI3MNmk5cmlWH3kNj0O6_b8pU';
BEGIN
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS DISTINCT FROM 'paid') THEN
    PERFORM net.http_post(
      url := fn_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || anon_key
      ),
      body := jsonb_build_object('order_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_credit_referral ON public.orders;
CREATE TRIGGER orders_credit_referral
AFTER UPDATE OF payment_status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.trigger_credit_referral();

-- Also fire on INSERT (orders created already-paid)
DROP TRIGGER IF EXISTS orders_credit_referral_insert ON public.orders;
CREATE TRIGGER orders_credit_referral_insert
AFTER INSERT ON public.orders
FOR EACH ROW
WHEN (NEW.payment_status = 'paid')
EXECUTE FUNCTION public.trigger_credit_referral();