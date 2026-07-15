
-- Restrict gam_user_badges SELECT to owner (admins retain full access via existing policy)
DROP POLICY IF EXISTS "User badges visible to authenticated" ON public.gam_user_badges;
CREATE POLICY "Users can view their own badges"
ON public.gam_user_badges
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin_or_super(auth.uid()));

-- Restrict HMS operational config SELECT to admin/super or HMS-enabled doctors
DROP POLICY IF EXISTS billseries_authn_select ON public.hms_bill_series;
CREATE POLICY billseries_hms_staff_select ON public.hms_bill_series FOR SELECT TO authenticated
USING (is_active AND (public.is_admin_or_super(auth.uid()) OR EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = auth.uid() AND d.hms_access = true)));

DROP POLICY IF EXISTS "auth read currencies" ON public.hms_currencies;
CREATE POLICY hms_currencies_staff_select ON public.hms_currencies FOR SELECT TO authenticated
USING (is_active = true AND (public.is_admin_or_super(auth.uid()) OR EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = auth.uid() AND d.hms_access = true)));

DROP POLICY IF EXISTS disccat_authn_select ON public.hms_discount_categories;
CREATE POLICY disccat_hms_staff_select ON public.hms_discount_categories FOR SELECT TO authenticated
USING (is_active AND (public.is_admin_or_super(auth.uid()) OR EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = auth.uid() AND d.hms_access = true)));

DROP POLICY IF EXISTS discremarks_authn_select ON public.hms_discount_remarks;
CREATE POLICY discremarks_hms_staff_select ON public.hms_discount_remarks FOR SELECT TO authenticated
USING (is_active AND (public.is_admin_or_super(auth.uid()) OR EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = auth.uid() AND d.hms_access = true)));

DROP POLICY IF EXISTS expcat_authn_select ON public.hms_expense_categories;
CREATE POLICY expcat_hms_staff_select ON public.hms_expense_categories FOR SELECT TO authenticated
USING (is_active AND (public.is_admin_or_super(auth.uid()) OR EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = auth.uid() AND d.hms_access = true)));

DROP POLICY IF EXISTS ipadmtypes_authn_select ON public.hms_ip_admission_types;
CREATE POLICY ipadmtypes_hms_staff_select ON public.hms_ip_admission_types FOR SELECT TO authenticated
USING (is_active AND (public.is_admin_or_super(auth.uid()) OR EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = auth.uid() AND d.hms_access = true)));

DROP POLICY IF EXISTS memplans_authn_select ON public.hms_membership_plans;
CREATE POLICY memplans_hms_staff_select ON public.hms_membership_plans FOR SELECT TO authenticated
USING (is_active AND (public.is_admin_or_super(auth.uid()) OR EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = auth.uid() AND d.hms_access = true)));

DROP POLICY IF EXISTS psources_authn_select ON public.hms_patient_sources;
CREATE POLICY psources_hms_staff_select ON public.hms_patient_sources FOR SELECT TO authenticated
USING (is_active AND (public.is_admin_or_super(auth.uid()) OR EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = auth.uid() AND d.hms_access = true)));

DROP POLICY IF EXISTS paytypes_authn_select ON public.hms_payment_types;
CREATE POLICY paytypes_hms_staff_select ON public.hms_payment_types FOR SELECT TO authenticated
USING (is_active AND (public.is_admin_or_super(auth.uid()) OR EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = auth.uid() AND d.hms_access = true)));

DROP POLICY IF EXISTS rate_plans_authn_select ON public.hms_rate_plans;
CREATE POLICY rate_plans_hms_staff_select ON public.hms_rate_plans FOR SELECT TO authenticated
USING (is_active AND (public.is_admin_or_super(auth.uid()) OR EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = auth.uid() AND d.hms_access = true)));

DROP POLICY IF EXISTS areas_authn_select ON public.hms_service_areas;
CREATE POLICY areas_hms_staff_select ON public.hms_service_areas FOR SELECT TO authenticated
USING (is_active AND (public.is_admin_or_super(auth.uid()) OR EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = auth.uid() AND d.hms_access = true)));

DROP POLICY IF EXISTS tax_authn_select ON public.hms_tax_slabs;
CREATE POLICY tax_hms_staff_select ON public.hms_tax_slabs FOR SELECT TO authenticated
USING (is_active AND (public.is_admin_or_super(auth.uid()) OR EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = auth.uid() AND d.hms_access = true)));

DROP POLICY IF EXISTS wards_authn_select ON public.hms_wards;
CREATE POLICY wards_hms_staff_select ON public.hms_wards FOR SELECT TO authenticated
USING (is_active AND (public.is_admin_or_super(auth.uid()) OR EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = auth.uid() AND d.hms_access = true)));
