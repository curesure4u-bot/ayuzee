-- Saved addresses
CREATE TABLE public.patient_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  label TEXT,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_patient_addresses_user ON public.patient_addresses(user_id);

ALTER TABLE public.patient_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own addresses"
ON public.patient_addresses FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert their own addresses"
ON public.patient_addresses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their own addresses"
ON public.patient_addresses FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users delete their own addresses"
ON public.patient_addresses FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER trg_patient_addresses_updated_at
BEFORE UPDATE ON public.patient_addresses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Wishlist
CREATE TABLE public.patient_wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX idx_patient_wishlist_user ON public.patient_wishlist(user_id);

ALTER TABLE public.patient_wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own wishlist"
ON public.patient_wishlist FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users add to their own wishlist"
ON public.patient_wishlist FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users remove from their own wishlist"
ON public.patient_wishlist FOR DELETE
TO authenticated
USING (auth.uid() = user_id);