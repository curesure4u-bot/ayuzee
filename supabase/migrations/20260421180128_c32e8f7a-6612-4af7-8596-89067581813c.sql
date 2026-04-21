-- Add 'provider' role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'provider';

-- Service providers table (hospitals, therapists, panchakarma centers, resorts)
CREATE TABLE IF NOT EXISTS public.service_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('hospital','therapist','panchakarma','resort')),
  business_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  city TEXT NOT NULL,
  state TEXT,
  pincode TEXT,
  address TEXT,
  about TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  rating NUMERIC NOT NULL DEFAULT 4.7,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner views own provider"
  ON public.service_providers FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owner inserts own provider"
  ON public.service_providers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner updates own provider"
  ON public.service_providers FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Approved providers public"
  ON public.service_providers FOR SELECT TO public
  USING (is_approved = true);

CREATE POLICY "Admins manage providers"
  ON public.service_providers FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_service_providers_updated_at
  BEFORE UPDATE ON public.service_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for provider verification documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('provider-documents', 'provider-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Provider uploads own documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'provider-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Provider reads own documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'provider-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Provider updates own documents"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'provider-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
