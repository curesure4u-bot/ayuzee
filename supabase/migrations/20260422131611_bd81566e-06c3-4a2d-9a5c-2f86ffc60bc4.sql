-- Health Conditions (dynamic, admin-managed)
CREATE TABLE public.health_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_image_url TEXT,
  product_name TEXT,
  product_image_url TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  discount_price INTEGER,
  highlights JSONB NOT NULL DEFAULT '[]'::jsonb,            -- ["Cuts down complications", ...]
  how_it_works JSONB NOT NULL DEFAULT '[]'::jsonb,          -- [{title, description, image_url}]
  packages JSONB NOT NULL DEFAULT '[]'::jsonb,              -- [{label:"1 Month", units:"120 Tablets", price, discount_price, in_stock:true}]
  doctor_feedback JSONB NOT NULL DEFAULT '[]'::jsonb,       -- [{doctor_name, video_url, thumbnail_url, quote}]
  patient_feedback JSONB NOT NULL DEFAULT '[]'::jsonb,      -- [{patient_name, location, video_url, thumbnail_url, quote}]
  approach_title TEXT,
  approach_body TEXT,
  approach_image_url TEXT,
  plan_steps JSONB NOT NULL DEFAULT '[]'::jsonb,            -- [{month:"Month-1", items:[{title, description}]}]
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,           -- [{name, image_url}]
  faqs JSONB NOT NULL DEFAULT '[]'::jsonb,                  -- [{q,a}]
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.health_conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads published conditions"
  ON public.health_conditions FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins manage conditions"
  ON public.health_conditions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_health_conditions_updated
  BEFORE UPDATE ON public.health_conditions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Leads (Request Call) for condition pages
CREATE TABLE public.condition_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_id UUID REFERENCES public.health_conditions(id) ON DELETE SET NULL,
  condition_slug TEXT,
  user_id UUID,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  package_label TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new', -- new | contacted | converted | closed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT condition_leads_name_len CHECK (char_length(full_name) BETWEEN 2 AND 120),
  CONSTRAINT condition_leads_phone_len CHECK (char_length(phone) BETWEEN 6 AND 20)
);

ALTER TABLE public.condition_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead"
  ON public.condition_leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Owner views own leads"
  ON public.condition_leads FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Admins manage leads"
  ON public.condition_leads FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_condition_leads_updated
  BEFORE UPDATE ON public.condition_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_condition_leads_status ON public.condition_leads(status, created_at DESC);
CREATE INDEX idx_health_conditions_sort ON public.health_conditions(sort_order, name);

-- Seed 8 conditions with sample editable content
INSERT INTO public.health_conditions (slug, name, tagline, hero_title, hero_subtitle, product_name, price, discount_price, highlights, packages, sort_order)
VALUES
  ('diabetes-care','Diabetes Care','Balancing Blood Sugar the Ayurvedic Way','Diabe 250','US Patent Awarded Medicine for Diabetes','Diabe-250 Tablet',1428,1356,
    '["Cuts down on diabetes complications","Helps to maintain healthy metabolism","Controls the equilibrium of glucose","Improves sleep and bowel movements","Rids the body of dangerous endotoxins"]'::jsonb,
    '[{"label":"1 Month","units":"120 Tablets","price":1428,"discount_price":1356,"in_stock":true},{"label":"2 Months","units":"240 Tablets","price":2856,"discount_price":2570,"in_stock":true},{"label":"3 Months","units":"360 Tablets","price":4284,"discount_price":3640,"in_stock":true}]'::jsonb,
    1),
  ('liver-care','Liver Care','Shielding Your Liver Naturally','Yakrit Veda & Arogyavardhini Vati','Restore liver function the Ayurvedic way','Yakrit Veda Combo',680,612,
    '["Helps restore liver functions","Enhances the digestive process","Improves appetite"]'::jsonb,
    '[{"label":"1 Month","units":"60 Tablets","price":680,"discount_price":612,"in_stock":true},{"label":"3 Months","units":"180 Tablets","price":2040,"discount_price":1700,"in_stock":true}]'::jsonb,
    2),
  ('gut-care','Gut Care','Heal Your Gut, Heal Your Health','Gut Veda','Restore gut balance naturally','Gut Veda Capsules',590,531,'[]'::jsonb,'[]'::jsonb,3),
  ('hair-care','Hair Care','Regain Confidence, Regrow Hair','Heryegena H','Counters scalp & dandruff problems','Heryegena-H',790,711,
    '["Assists in reversal of Hairfall","Counters Scalp & Dandruff problems","Promotes Healthy Hair Growth"]'::jsonb,
    '[{"label":"1 Month","units":"30 Tablets","price":790,"discount_price":711,"in_stock":true}]'::jsonb,4),
  ('spine-care','Spine Care','Strength & Flexibility for Your Spine','Spine Veda','Ayurvedic spine wellness','Spine Veda Oil + Tablets',999,899,'[]'::jsonb,'[]'::jsonb,5),
  ('child-care','Child Care','Holistic Wellness for Children','Bal Veda','Immunity, growth & nutrition','Bal Veda Syrup',420,378,'[]'::jsonb,'[]'::jsonb,6),
  ('women-care','Women Care','Revitalize Your Femininity','Gyn OD','Hormonal balance the Ayurvedic way','Gyn OD',520,468,
    '["Works as antibiotic for reproductive system","Antioxidant & boosts immunity","Heals reproductive system"]'::jsonb,
    '[{"label":"1 Month","units":"30 Tablets","price":520,"discount_price":468,"in_stock":true}]'::jsonb,7),
  ('heart-care','Heart Care','Care for Your Heart, Naturally','Hridya Veda','Supports cardiovascular health','Hridya Veda Tablets',850,765,'[]'::jsonb,'[]'::jsonb,8);