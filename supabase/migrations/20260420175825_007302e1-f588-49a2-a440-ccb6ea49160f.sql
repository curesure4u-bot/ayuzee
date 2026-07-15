
-- ===== Clinic table additions =====
ALTER TABLE public.doctor_clinics
  ADD COLUMN IF NOT EXISTS about TEXT,
  ADD COLUMN IF NOT EXISTS locality TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS intro_video_url TEXT,
  ADD COLUMN IF NOT EXISTS gst_number TEXT,
  ADD COLUMN IF NOT EXISTS legal_entity_name TEXT,
  ADD COLUMN IF NOT EXISTS gst_address TEXT,
  ADD COLUMN IF NOT EXISTS show_legal_entity BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consultation_settings JSONB DEFAULT '{}'::jsonb;

-- ===== Clinic media (multi-photo) =====
CREATE TABLE IF NOT EXISTS public.clinic_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.doctor_clinics(id) ON DELETE CASCADE,
  doctor_user_id UUID NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'photo', -- photo | cover | logo | video
  url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clinic_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic media public" ON public.clinic_media FOR SELECT USING (true);
CREATE POLICY "Owner manages clinic media" ON public.clinic_media FOR ALL
  USING (auth.uid() = doctor_user_id) WITH CHECK (auth.uid() = doctor_user_id);

-- ===== Clinic services (tag table) =====
CREATE TABLE IF NOT EXISTS public.clinic_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.doctor_clinics(id) ON DELETE CASCADE,
  doctor_user_id UUID NOT NULL,
  service_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (clinic_id, service_name)
);
ALTER TABLE public.clinic_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic services public" ON public.clinic_services FOR SELECT USING (true);
CREATE POLICY "Owner manages clinic services" ON public.clinic_services FOR ALL
  USING (auth.uid() = doctor_user_id) WITH CHECK (auth.uid() = doctor_user_id);

-- ===== Reward schemes =====
CREATE TABLE IF NOT EXISTS public.reward_schemes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  scheme_type TEXT NOT NULL DEFAULT 'Bulk Purchase Scheme',
  description TEXT,
  banner_url TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  terms TEXT,
  audience TEXT NOT NULL DEFAULT 'all', -- all | diamond | platinum | platinum_plus | credit
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reward_schemes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Schemes public" ON public.reward_schemes FOR SELECT USING (true);
CREATE POLICY "Admins manage schemes" ON public.reward_schemes FOR ALL
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_reward_schemes_updated
BEFORE UPDATE ON public.reward_schemes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== Reward scheme tiers =====
CREATE TABLE IF NOT EXISTS public.reward_scheme_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scheme_id UUID NOT NULL REFERENCES public.reward_schemes(id) ON DELETE CASCADE,
  min_order_value INTEGER NOT NULL,
  reward_name TEXT NOT NULL,
  reward_image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reward_scheme_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tiers public" ON public.reward_scheme_tiers FOR SELECT USING (true);
CREATE POLICY "Admins manage tiers" ON public.reward_scheme_tiers FOR ALL
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- ===== Doctor rewards earned (unlocked) =====
CREATE TABLE IF NOT EXISTS public.doctor_rewards_earned (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_user_id UUID NOT NULL,
  scheme_id UUID REFERENCES public.reward_schemes(id) ON DELETE SET NULL,
  reward_name TEXT NOT NULL,
  reward_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'unlocked', -- unlocked | shipped | delivered
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);
ALTER TABLE public.doctor_rewards_earned ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctor views earned" ON public.doctor_rewards_earned FOR SELECT
  USING (auth.uid() = doctor_user_id);
CREATE POLICY "Admins view all earned" ON public.doctor_rewards_earned FOR SELECT
  USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert earned" ON public.doctor_rewards_earned FOR INSERT
  WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update earned" ON public.doctor_rewards_earned FOR UPDATE
  USING (has_role(auth.uid(),'admin'));

-- ===== Doctor reward history (delivered log) =====
CREATE TABLE IF NOT EXISTS public.doctor_reward_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_user_id UUID NOT NULL,
  earned_id UUID REFERENCES public.doctor_rewards_earned(id) ON DELETE SET NULL,
  reward_name TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'delivered', -- delivered | redeemed | cancelled
  amount_value INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);
ALTER TABLE public.doctor_reward_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctor views own reward history" ON public.doctor_reward_history FOR SELECT
  USING (auth.uid() = doctor_user_id);
CREATE POLICY "Admins manage reward history" ON public.doctor_reward_history FOR ALL
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- ===== Doctor category tier =====
CREATE TABLE IF NOT EXISTS public.doctor_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_user_id UUID NOT NULL UNIQUE,
  current_tier TEXT NOT NULL DEFAULT 'diamond', -- diamond | platinum | platinum_plus
  monthly_spend INTEGER NOT NULL DEFAULT 0,
  diamond_progress INTEGER NOT NULL DEFAULT 0,
  platinum_progress INTEGER NOT NULL DEFAULT 0,
  platinum_plus_progress INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.doctor_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctor views own category" ON public.doctor_categories FOR SELECT
  USING (auth.uid() = doctor_user_id);
CREATE POLICY "Admins view all categories" ON public.doctor_categories FOR SELECT
  USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage categories" ON public.doctor_categories FOR ALL
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Doctor inserts own category row" ON public.doctor_categories FOR INSERT
  WITH CHECK (auth.uid() = doctor_user_id);

CREATE TRIGGER trg_doctor_categories_updated
BEFORE UPDATE ON public.doctor_categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== Storage bucket for clinic images =====
INSERT INTO storage.buckets (id, name, public)
VALUES ('clinic-media','clinic-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Clinic media read" ON storage.objects FOR SELECT
  USING (bucket_id = 'clinic-media');
CREATE POLICY "Clinic owner uploads" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'clinic-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Clinic owner updates" ON storage.objects FOR UPDATE
  USING (bucket_id = 'clinic-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Clinic owner deletes" ON storage.objects FOR DELETE
  USING (bucket_id = 'clinic-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ===== Seed sample reward schemes =====
INSERT INTO public.reward_schemes (title, scheme_type, start_date, end_date, audience, terms, is_active) VALUES
('March 2026 Month End Offers Diamond and Platinum Customers','Bulk Purchase Scheme','2026-03-25','2026-04-01','diamond','Valid for Diamond & Platinum orders only. Applicable only on COD/Prepaid Orders. Offer period: 25th to 31st Mar 2026. Orders placed only during the offer period will be eligible.', true),
('Holi Festival Offer Credit Customers','Bulk Purchase Scheme','2026-02-27','2026-03-06','credit','Applicable to both CN & Non-CN customers. Offer Valid 27th Feb - 5th Mar 2026. Exclusive for Credit Orders.', true),
('Holi Festival Offer','Bulk Purchase Scheme','2026-02-27','2026-03-06','all','Offer valid only for Prepaid & COD orders. Applicable to both CN & Non-CN customers. Offer Valid 27th Feb - 5th Mar 2026.', true);

INSERT INTO public.reward_scheme_tiers (scheme_id, min_order_value, reward_name, sort_order)
SELECT id, 10000, 'Travel Mug', 1 FROM public.reward_schemes WHERE title='March 2026 Month End Offers Diamond and Platinum Customers';
INSERT INTO public.reward_scheme_tiers (scheme_id, min_order_value, reward_name, sort_order)
SELECT id, 20000, 'Digital Glucometer', 2 FROM public.reward_schemes WHERE title='March 2026 Month End Offers Diamond and Platinum Customers';
INSERT INTO public.reward_scheme_tiers (scheme_id, min_order_value, reward_name, sort_order)
SELECT id, 40000, 'Nebulizer', 3 FROM public.reward_schemes WHERE title='March 2026 Month End Offers Diamond and Platinum Customers';

INSERT INTO public.reward_scheme_tiers (scheme_id, min_order_value, reward_name, sort_order)
SELECT id, 30000, 'Travel Mug', 1 FROM public.reward_schemes WHERE title='Holi Festival Offer Credit Customers';
INSERT INTO public.reward_scheme_tiers (scheme_id, min_order_value, reward_name, sort_order)
SELECT id, 50000, 'Weighing Machine', 2 FROM public.reward_schemes WHERE title='Holi Festival Offer Credit Customers';

INSERT INTO public.reward_scheme_tiers (scheme_id, min_order_value, reward_name, sort_order)
SELECT id, 10000, 'Dindayal Premium Thandai', 1 FROM public.reward_schemes WHERE title='Holi Festival Offer';
INSERT INTO public.reward_scheme_tiers (scheme_id, min_order_value, reward_name, sort_order)
SELECT id, 20000, 'Travel Mug', 2 FROM public.reward_schemes WHERE title='Holi Festival Offer';
INSERT INTO public.reward_scheme_tiers (scheme_id, min_order_value, reward_name, sort_order)
SELECT id, 40000, 'Nebulizer', 3 FROM public.reward_schemes WHERE title='Holi Festival Offer';
