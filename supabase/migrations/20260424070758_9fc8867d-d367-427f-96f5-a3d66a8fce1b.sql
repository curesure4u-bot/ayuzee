ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delhivery_waybill text;

CREATE TABLE IF NOT EXISTS public.prescription_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  guest_name text,
  guest_phone text,
  prescription_urls text[] NOT NULL,
  delivery_address jsonb NOT NULL,
  notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','reviewing','quoted','confirmed','dispatched','delivered','cancelled')),
  quoted_amount numeric,
  admin_note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.prescription_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create prescription orders"
ON public.prescription_orders
FOR INSERT
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can view their own prescription orders"
ON public.prescription_orders
FOR SELECT
USING (auth.uid() = user_id OR public.is_admin_or_super(auth.uid()));

CREATE POLICY "Admins can update prescription orders"
ON public.prescription_orders
FOR UPDATE
USING (public.is_admin_or_super(auth.uid()))
WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER update_prescription_orders_updated_at
BEFORE UPDATE ON public.prescription_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public)
VALUES ('prescriptions', 'prescriptions', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own prescriptions"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'prescriptions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own prescriptions"
ON storage.objects
FOR SELECT
USING (bucket_id = 'prescriptions' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin_or_super(auth.uid())));

CREATE POLICY "Users can update own prescriptions"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'prescriptions' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'prescriptions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can manage prescriptions"
ON storage.objects
FOR ALL
USING (bucket_id = 'prescriptions' AND public.is_admin_or_super(auth.uid()))
WITH CHECK (bucket_id = 'prescriptions' AND public.is_admin_or_super(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_prescription_orders_user_id_created_at ON public.prescription_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prescription_orders_status_created_at ON public.prescription_orders(status, created_at DESC);