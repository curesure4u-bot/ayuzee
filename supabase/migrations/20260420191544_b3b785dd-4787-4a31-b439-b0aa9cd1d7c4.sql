DROP POLICY IF EXISTS "Anyone can apply as partner" ON public.network_partners;

CREATE POLICY "Public can submit partner application"
ON public.network_partners
FOR INSERT
WITH CHECK (
  is_approved = false
  AND length(coalesce(name, '')) BETWEEN 2 AND 200
  AND partner_type IN ('therapist','hospital','clinic','panchakarma_theater')
  AND length(coalesce(city, '')) BETWEEN 2 AND 100
);