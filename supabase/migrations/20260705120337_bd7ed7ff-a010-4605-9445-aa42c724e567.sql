
-- Helper predicate reused across policies: staff = admin/super_admin/doctor
-- Drop overly permissive SELECT policies and replace with role-scoped ones.

-- hms_custom_forms
DROP POLICY IF EXISTS "Authenticated read custom forms" ON public.hms_custom_forms;
CREATE POLICY "Staff read custom forms" ON public.hms_custom_forms FOR SELECT TO authenticated
USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'doctor'::app_role));

-- hms_labels
DROP POLICY IF EXISTS "Authenticated read labels" ON public.hms_labels;
CREATE POLICY "Staff read labels" ON public.hms_labels FOR SELECT TO authenticated
USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'doctor'::app_role));

-- hms_suggestions
DROP POLICY IF EXISTS "Authenticated read suggestions" ON public.hms_suggestions;
CREATE POLICY "Staff read suggestions" ON public.hms_suggestions FOR SELECT TO authenticated
USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'doctor'::app_role));

-- hms_departments
DROP POLICY IF EXISTS "Authenticated read departments" ON public.hms_departments;
CREATE POLICY "Staff read departments" ON public.hms_departments FOR SELECT TO authenticated
USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'doctor'::app_role));

-- hms_stores
DROP POLICY IF EXISTS "Authenticated read stores" ON public.hms_stores;
CREATE POLICY "Staff read stores" ON public.hms_stores FOR SELECT TO authenticated
USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'doctor'::app_role));

-- hms_packages
DROP POLICY IF EXISTS "Authenticated read packages" ON public.hms_packages;
CREATE POLICY "Staff read packages" ON public.hms_packages FOR SELECT TO authenticated
USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'doctor'::app_role));

-- hms_rate_plan_items
DROP POLICY IF EXISTS "rate_plan_items_authn_select" ON public.hms_rate_plan_items;
CREATE POLICY "rate_plan_items_staff_select" ON public.hms_rate_plan_items FOR SELECT TO authenticated
USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'doctor'::app_role));

-- hms_email_templates and hms_document_templates
DROP POLICY IF EXISTS "auth read doc templates" ON public.hms_document_templates;
CREATE POLICY "staff read doc templates" ON public.hms_document_templates FOR SELECT TO authenticated
USING (is_active = true AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'doctor'::app_role)));

DROP POLICY IF EXISTS "auth read wa templates" ON public.hms_email_templates;
DROP POLICY IF EXISTS "auth read email templates" ON public.hms_email_templates;
CREATE POLICY "staff read email templates" ON public.hms_email_templates FOR SELECT TO authenticated
USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'doctor'::app_role));

-- homeo_theme_remedy_map
DROP POLICY IF EXISTS "Authenticated read theme map" ON public.homeo_theme_remedy_map;
CREATE POLICY "Clinicians read theme map" ON public.homeo_theme_remedy_map FOR SELECT TO authenticated
USING (has_role(auth.uid(),'doctor'::app_role) OR has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role));

-- Revoke public/anon EXECUTE on SECURITY DEFINER function
REVOKE EXECUTE ON FUNCTION public.ai_rx_mark_draft_approved() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ai_rx_mark_draft_approved() TO authenticated, service_role;
