DROP POLICY IF EXISTS "Authenticated can view approved partners" ON public.network_partners;

-- Applicants can still view their own submission
CREATE POLICY "Applicant views own application"
ON public.network_partners
FOR SELECT
TO authenticated
USING (applied_by_user_id = auth.uid());

-- Admins keep full access via existing "Admins manage partners" policy.
-- General authenticated users must use the network_partners_public view,
-- which excludes contact_person, phone, email, and address.