-- ============ AYUZEE MONEY WALLET ============
CREATE TABLE public.ayuzee_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ayuzee_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own wallet" ON public.ayuzee_wallets
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own wallet" ON public.ayuzee_wallets
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all wallets" ON public.ayuzee_wallets
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_ayuzee_wallets_updated
  BEFORE UPDATE ON public.ayuzee_wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- transactions
CREATE TYPE public.ayuzee_txn_type AS ENUM ('credit', 'cashback', 'redeem', 'expiry', 'refund_reversal', 'adjustment');

CREATE TABLE public.ayuzee_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  wallet_id UUID NOT NULL REFERENCES public.ayuzee_wallets(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type public.ayuzee_txn_type NOT NULL,
  reason TEXT,
  order_id UUID,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ayuzee_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own txns" ON public.ayuzee_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all txns" ON public.ayuzee_transactions
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert txns" ON public.ayuzee_transactions
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE INDEX idx_ayuzee_txn_user ON public.ayuzee_transactions(user_id, created_at DESC);

-- auto create wallet on signup
CREATE OR REPLACE FUNCTION public.create_ayuzee_wallet()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.ayuzee_wallets (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_ayuzee_wallet();

-- keep balances synced
CREATE OR REPLACE FUNCTION public.sync_ayuzee_balance()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE delta INT;
BEGIN
  IF NEW.type IN ('credit', 'cashback', 'refund_reversal') THEN
    delta := NEW.amount;
    UPDATE public.ayuzee_wallets
      SET balance = balance + delta,
          lifetime_earned = lifetime_earned + delta
      WHERE id = NEW.wallet_id;
  ELSIF NEW.type IN ('redeem', 'expiry') THEN
    delta := NEW.amount;
    UPDATE public.ayuzee_wallets
      SET balance = balance - delta,
          lifetime_spent = lifetime_spent + CASE WHEN NEW.type='redeem' THEN delta ELSE 0 END
      WHERE id = NEW.wallet_id;
  ELSIF NEW.type = 'adjustment' THEN
    UPDATE public.ayuzee_wallets SET balance = balance + NEW.amount WHERE id = NEW.wallet_id;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_sync_ayuzee_balance
  AFTER INSERT ON public.ayuzee_transactions
  FOR EACH ROW EXECUTE FUNCTION public.sync_ayuzee_balance();

-- ============ DOCTOR PROFILE EXTENSIONS ============
ALTER TABLE public.doctors
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS alternate_phone TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS registration_number TEXT,
  ADD COLUMN IF NOT EXISTS public_profile BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS profile_completion INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS escalation_name TEXT,
  ADD COLUMN IF NOT EXISTS escalation_phone TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- only approved + public visible
DROP POLICY IF EXISTS "Doctors are viewable by everyone" ON public.doctors;
CREATE POLICY "Approved doctors visible" ON public.doctors
  FOR SELECT USING (is_approved = true AND public_profile = true);
CREATE POLICY "Owner views own doctor row" ON public.doctors
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all doctors" ON public.doctors
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update doctors" ON public.doctors
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_doctors_updated BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ DOCTOR SUB-TABLES ============
-- Addresses
CREATE TABLE public.doctor_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  landmark TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  phone TEXT NOT NULL,
  alternate_phone TEXT,
  gstin TEXT,
  legal_entity_name TEXT,
  trade_name TEXT,
  is_default_shipping BOOLEAN NOT NULL DEFAULT false,
  is_default_billing BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.doctor_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages addresses" ON public.doctor_addresses
  FOR ALL TO authenticated USING (auth.uid() = doctor_user_id) WITH CHECK (auth.uid() = doctor_user_id);
CREATE TRIGGER trg_doctor_addresses_updated BEFORE UPDATE ON public.doctor_addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Bank Details
CREATE TABLE public.doctor_bank_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bank', 'upi')),
  account_holder_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  bank_name TEXT,
  upi_id TEXT,
  upi_name TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.doctor_bank_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages bank" ON public.doctor_bank_details
  FOR ALL TO authenticated USING (auth.uid() = doctor_user_id) WITH CHECK (auth.uid() = doctor_user_id);
CREATE TRIGGER trg_doctor_bank_updated BEFORE UPDATE ON public.doctor_bank_details
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Clinics
CREATE TABLE public.doctor_clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  clinic_name TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  phone TEXT,
  consultation_fee INTEGER NOT NULL DEFAULT 0,
  timings TEXT,
  services TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.doctor_clinics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active clinics public" ON public.doctor_clinics FOR SELECT USING (is_active = true);
CREATE POLICY "Owner manages clinics" ON public.doctor_clinics
  FOR ALL TO authenticated USING (auth.uid() = doctor_user_id) WITH CHECK (auth.uid() = doctor_user_id);
CREATE TRIGGER trg_doctor_clinics_updated BEFORE UPDATE ON public.doctor_clinics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Education
CREATE TABLE public.doctor_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  degree TEXT NOT NULL,
  college TEXT NOT NULL,
  year_completed INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.doctor_education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Education public" ON public.doctor_education FOR SELECT USING (true);
CREATE POLICY "Owner manages education" ON public.doctor_education
  FOR ALL TO authenticated USING (auth.uid() = doctor_user_id) WITH CHECK (auth.uid() = doctor_user_id);

-- Specializations
CREATE TABLE public.doctor_specializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  specialization TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.doctor_specializations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Specs public" ON public.doctor_specializations FOR SELECT USING (true);
CREATE POLICY "Owner manages specs" ON public.doctor_specializations
  FOR ALL TO authenticated USING (auth.uid() = doctor_user_id) WITH CHECK (auth.uid() = doctor_user_id);

-- Work history
CREATE TABLE public.doctor_work_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  position TEXT NOT NULL,
  organization TEXT NOT NULL,
  start_year INTEGER,
  end_year INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.doctor_work_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Work public" ON public.doctor_work_history FOR SELECT USING (true);
CREATE POLICY "Owner manages work" ON public.doctor_work_history
  FOR ALL TO authenticated USING (auth.uid() = doctor_user_id) WITH CHECK (auth.uid() = doctor_user_id);

-- Awards
CREATE TABLE public.doctor_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  title TEXT NOT NULL,
  awarded_by TEXT,
  year INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.doctor_awards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Awards public" ON public.doctor_awards FOR SELECT USING (true);
CREATE POLICY "Owner manages awards" ON public.doctor_awards
  FOR ALL TO authenticated USING (auth.uid() = doctor_user_id) WITH CHECK (auth.uid() = doctor_user_id);

-- Memberships
CREATE TABLE public.doctor_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  organization TEXT NOT NULL,
  membership_id TEXT,
  year INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.doctor_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Memberships public" ON public.doctor_memberships FOR SELECT USING (true);
CREATE POLICY "Owner manages memberships" ON public.doctor_memberships
  FOR ALL TO authenticated USING (auth.uid() = doctor_user_id) WITH CHECK (auth.uid() = doctor_user_id);

-- Saved Posts
CREATE TABLE public.doctor_saved_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_title TEXT NOT NULL,
  post_url TEXT,
  thumbnail_url TEXT,
  excerpt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.doctor_saved_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages saved posts" ON public.doctor_saved_posts
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Saved Medicines
CREATE TABLE public.doctor_saved_medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
ALTER TABLE public.doctor_saved_medicines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages saved meds" ON public.doctor_saved_medicines
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- backfill wallets for existing users
INSERT INTO public.ayuzee_wallets (user_id)
  SELECT id FROM auth.users
  ON CONFLICT (user_id) DO NOTHING;