-- Fix: atmri_case_updates public exposure
-- Removes anonymous read access to patient case updates and photos.
DROP POLICY IF EXISTS "public_updates" ON public.atmri_case_updates;

-- Fix: network_partners public PII exposure
-- Restrict full-row reads to authenticated users only.
-- Public/anon consumers must use the network_partners_public view
-- (which excludes contact_person, email, phone, address, pincode, applied_by_user_id).
DROP POLICY IF EXISTS "Public can view approved partners" ON public.network_partners;

CREATE POLICY "Authenticated can view approved partners"
ON public.network_partners
FOR SELECT
TO authenticated
USING (is_approved = true);

-- Drop anon SELECT grant on the base table; keep authenticated + service_role.
REVOKE SELECT ON public.network_partners FROM anon;