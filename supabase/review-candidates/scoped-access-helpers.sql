-- Included by build-scoped-access.mjs after the protected role-write boundary.
-- No browser-supplied metadata, login form or editable staff template grants access.
GRANT USAGE ON SCHEMA ayuzee_private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION ayuzee_private.rbac_actor()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id=auth.uid() AND u.deleted_at IS NULL
  )
$$;

CREATE OR REPLACE FUNCTION ayuzee_private.rbac_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT ayuzee_private.rbac_actor() AND EXISTS (
    SELECT 1 FROM public.user_roles r
    WHERE r.user_id = auth.uid() AND r.role::text IN ('admin', 'super_admin')
  )
$$;

CREATE OR REPLACE FUNCTION ayuzee_private.rbac_server()
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = ''
AS $$
  SELECT (
    current_setting('role', true) = 'service_role'
    AND (auth.role() IS NULL OR auth.role() = 'service_role')
  ) OR (
    current_user IN ('postgres', 'supabase_admin')
    AND session_user IN ('postgres', 'supabase_admin')
    AND current_setting('role', true) IN ('none', 'postgres', 'supabase_admin')
    AND auth.role() IS NULL
  )
$$;

CREATE OR REPLACE FUNCTION ayuzee_private.rbac_branch(p_branch uuid, p_domain text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT ayuzee_private.rbac_admin() OR EXISTS (
    SELECT 1 FROM public.hms_staff s JOIN public.hms_branches b ON b.id = p_branch
    WHERE ayuzee_private.rbac_actor() AND s.user_id = auth.uid() AND s.is_active IS TRUE AND b.is_active IS TRUE
      AND COALESCE(s.status, 'active') <> 'inactive'
      AND COALESCE(s.employee_status, 'active') NOT IN ('terminated', 'resigned', 'relieved', 'suspended')
      AND s.organisation_id IS NOT NULL AND s.organisation_id = b.organisation_id
      AND (s.branch_id = b.id OR lower(s.role) IN ('owner', 'admin', 'hr_manager'))
      AND CASE p_domain
        WHEN 'hr' THEN lower(s.role) IN ('owner', 'admin', 'branch_admin', 'hr_manager', 'hr')
        WHEN 'finance' THEN lower(s.role) IN ('owner', 'admin', 'branch_admin', 'accountant', 'accounts_admin', 'cashier')
          OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id=auth.uid() AND r.role::text='accounts_admin')
        WHEN 'registration' THEN lower(s.role) IN ('owner', 'admin', 'branch_admin', 'receptionist')
        WHEN 'clinical_admin' THEN lower(s.role) IN ('owner', 'admin', 'branch_admin')
        ELSE false
      END
  )
$$;

CREATE OR REPLACE FUNCTION ayuzee_private.rbac_location(p_location text, p_domain text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT ayuzee_private.rbac_admin() OR (
    (SELECT count(*) FROM public.hms_branches b WHERE b.branch_name = p_location) = 1
    AND EXISTS (SELECT 1 FROM public.hms_branches b WHERE b.branch_name = p_location
      AND ayuzee_private.rbac_branch(b.id, p_domain))
  )
$$;

CREATE OR REPLACE FUNCTION ayuzee_private.rbac_employee(p_employee uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT ayuzee_private.rbac_admin() OR EXISTS (
    SELECT 1 FROM public.hms_staff s WHERE s.id = p_employee
      AND ((ayuzee_private.rbac_actor() AND s.user_id = auth.uid()) OR ayuzee_private.rbac_branch(s.branch_id, 'hr'))
  )
$$;

CREATE OR REPLACE FUNCTION ayuzee_private.rbac_doctor_visit(p_visit uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.hms_op_visits v JOIN public.doctors d ON d.id = v.doctor_id
    JOIN public.hms_op_patients p ON p.id=v.patient_id AND p.branch=v.branch
    WHERE ayuzee_private.rbac_actor() AND v.id = p_visit AND d.user_id = auth.uid() AND d.is_approved IS TRUE
      AND d.is_suspended IS NOT TRUE AND d.hms_access IS TRUE
      AND d.hms_modules && ARRAY['clinical','opd','all']::text[]
      AND (d.hms_access_expiry IS NULL OR d.hms_access_expiry > now())
      AND EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id=auth.uid() AND r.role::text='doctor')
      AND (v.branch = d.hms_branch OR v.branch = ANY(d.hms_branches))
      AND (SELECT count(*) FROM public.hms_branches b WHERE b.branch_name=v.branch) = 1
  )
$$;

CREATE OR REPLACE FUNCTION ayuzee_private.rbac_patient(p_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT ayuzee_private.rbac_actor() AND (p_user = auth.uid() OR ayuzee_private.rbac_admin() OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id=p_user
      AND (ayuzee_private.rbac_branch(p.hms_branch_id,'registration') OR ayuzee_private.rbac_branch(p.hms_branch_id,'clinical_admin'))
  ) OR EXISTS (
    SELECT 1 FROM public.hms_op_visits v
    JOIN public.hms_op_patients p ON p.id=v.patient_id AND p.branch=v.branch
    WHERE (p.auth_user_id=p_user OR EXISTS(SELECT 1 FROM public.ayuzee_hms_bridge l
      WHERE l.hms_id=p.id AND l.ayuzee_id=p_user AND l.bridge_type='patient'))
      AND ayuzee_private.rbac_doctor_visit(v.id)
  ))
$$;

CREATE OR REPLACE FUNCTION ayuzee_private.rbac_own_patient(p_patient uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT ayuzee_private.rbac_actor() AND (EXISTS(SELECT 1 FROM public.hms_op_patients p WHERE p.id=p_patient AND p.auth_user_id=auth.uid())
  OR EXISTS (SELECT 1 FROM public.ayuzee_hms_bridge l
    WHERE l.ayuzee_id=auth.uid() AND l.bridge_type='patient' AND l.hms_id=p_patient))
$$;

CREATE OR REPLACE FUNCTION ayuzee_private.rbac_registry(p_patient uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
 SELECT ayuzee_private.rbac_admin() OR ayuzee_private.rbac_own_patient(p_patient)
  OR EXISTS(SELECT 1 FROM public.hms_op_visits v WHERE v.patient_id=p_patient AND ayuzee_private.rbac_doctor_visit(v.id))
  OR EXISTS(SELECT 1 FROM public.hms_op_patients p WHERE p.id=p_patient AND
    (ayuzee_private.rbac_location(p.branch,'registration') OR ayuzee_private.rbac_location(p.branch,'clinical_admin')))
$$;

-- A minimal, caller-filtered Auth projection. Never grant auth.users SELECT.
CREATE OR REPLACE FUNCTION ayuzee_private.rbac_accounts()
RETURNS TABLE(id uuid, email text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT u.id, u.email::text FROM auth.users u
  WHERE ayuzee_private.rbac_server() OR ayuzee_private.rbac_patient(u.id)
$$;

CREATE OR REPLACE FUNCTION ayuzee_private.rbac_branch_label(p_branch uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT b.branch_name FROM public.hms_branches b WHERE b.id=p_branch AND (
    ayuzee_private.rbac_server() OR ayuzee_private.rbac_admin()
    OR ayuzee_private.rbac_branch(b.id,'hr') OR ayuzee_private.rbac_branch(b.id,'finance')
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.hms_branch_id=b.id AND ayuzee_private.rbac_patient(p.user_id))
  )
$$;

CREATE OR REPLACE FUNCTION ayuzee_private.rbac_authority_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $$
DECLARE allowed text[];
BEGIN
  -- Auth owns signup/deletion. This path is unavailable to browser RPCs,
  -- including ones executing as postgres; the session principal is checked.
  IF auth.role() IS NULL AND session_user='supabase_auth_admin'
    AND current_setting('role',true) NOT IN ('anon','authenticated')
    AND current_user IN ('postgres','supabase_admin','supabase_auth_admin') THEN
    IF TG_TABLE_NAME='profiles' AND TG_OP IN ('INSERT','DELETE') THEN
      IF TG_OP='DELETE' THEN RETURN OLD; END IF;
      IF NEW.hms_branch_id IS NOT NULL OR NEW.hms_patient_linked IS TRUE
        OR NEW.hms_op_number IS NOT NULL OR NEW.abha_id IS NOT NULL THEN
        RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='Signup cannot grant clinical account links';
      END IF;
      RETURN NEW;
    END IF;
    -- Preserve the existing ON DELETE SET NULL foreign-key contract. Only
    -- removal of a link to an already deleted Auth account is accepted, never
    -- reassignment or any change to clinical, role or branch authority.
    IF TG_OP='UPDATE' THEN
      allowed:=CASE TG_TABLE_NAME
        WHEN 'doctors' THEN ARRAY['user_id']
        WHEN 'hms_staff' THEN ARRAY['user_id']
        WHEN 'hms_op_visits' THEN ARRAY['assigned_by']
        WHEN 'hms_op_patients' THEN ARRAY['auth_user_id','registered_by']
        ELSE NULL::text[] END;
      IF allowed IS NOT NULL AND to_jsonb(NEW)-allowed=to_jsonb(OLD)-allowed
        AND NOT EXISTS(SELECT 1 FROM unnest(allowed) AS f(name)
          WHERE to_jsonb(NEW)->f.name IS DISTINCT FROM to_jsonb(OLD)->f.name
          AND (to_jsonb(NEW)->>f.name IS NOT NULL OR to_jsonb(OLD)->>f.name IS NULL
            OR EXISTS(SELECT 1 FROM auth.users u WHERE u.id=(to_jsonb(OLD)->>f.name)::uuid))) THEN
        RETURN NEW;
      END IF;
    END IF;
  END IF;
  IF ayuzee_private.rbac_server() THEN
    IF TG_OP='DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
  END IF;
  IF NOT ayuzee_private.rbac_actor() THEN
    RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='An active account is required';
  END IF;
  IF TG_OP='UPDATE' AND (NEW.id IS DISTINCT FROM OLD.id OR
    (TG_TABLE_NAME IN ('profiles','doctors') AND to_jsonb(NEW)->'user_id' IS DISTINCT FROM to_jsonb(OLD)->'user_id')) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='Account and record identity require trusted maintenance';
  END IF;
  IF ayuzee_private.rbac_admin() THEN
    IF TG_OP='DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
  END IF;
  IF TG_TABLE_NAME='hms_staff' THEN
    IF NOT ayuzee_private.rbac_branch(COALESCE((to_jsonb(OLD)->>'branch_id')::uuid,(to_jsonb(NEW)->>'branch_id')::uuid),'hr') THEN
      RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='Staff changes require an authorized HR scope';
    END IF;
    IF TG_OP='INSERT' AND NEW.user_id IS NOT NULL THEN
      RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='Staff login access requires administrator approval';
    END IF;
    IF TG_OP='UPDATE' AND (NEW.user_id IS NOT NULL OR OLD.user_id IS NOT NULL) AND
      (to_jsonb(NEW)-ARRAY['name','department','phone','email','salary','today_attendance','productivity_score','updated_at','address','city','state','pincode','photo_url']
       IS DISTINCT FROM to_jsonb(OLD)-ARRAY['name','department','phone','email','salary','today_attendance','productivity_score','updated_at','address','city','state','pincode','photo_url']) THEN
      RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='Staff role and scope require administrator approval';
    END IF;
  ELSIF TG_TABLE_NAME='hms_branches' THEN
    IF TG_OP <> 'UPDATE' OR (to_jsonb(NEW)-ARRAY['address','city','state','pincode','phone','email','opening_hours','google_maps_url','updated_at']
      IS DISTINCT FROM to_jsonb(OLD)-ARRAY['address','city','state','pincode','phone','email','opening_hours','google_maps_url','updated_at']) THEN
      RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='Branch identity and scope require administrator approval';
    END IF;
  ELSIF TG_TABLE_NAME='profiles' THEN
    IF COALESCE(to_jsonb(OLD)->>'user_id',to_jsonb(NEW)->>'user_id') IS DISTINCT FROM auth.uid()::text THEN
      RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='Profile changes require the owning account';
    END IF;
    allowed := ARRAY['full_name','email','phone','gender','date_of_birth','avatar_url','city','state','pincode','preferred_languages','blood_group','emergency_contact_name','emergency_contact_phone','updated_at'];
    IF TG_OP='INSERT' AND (NEW.user_id IS DISTINCT FROM auth.uid() OR NEW.hms_branch_id IS NOT NULL
      OR NEW.hms_patient_linked IS TRUE OR NEW.hms_op_number IS NOT NULL OR NEW.abha_id IS NOT NULL) THEN
      RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='Clinical account links require trusted administration';
    END IF;
    IF TG_OP='UPDATE' AND (to_jsonb(NEW)-allowed IS DISTINCT FROM to_jsonb(OLD)-allowed) THEN
      RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='Protected profile fields cannot be self-edited';
    END IF;
  ELSIF TG_TABLE_NAME='doctors' THEN
    IF TG_OP='DELETE' OR (COALESCE(to_jsonb(OLD)->>'user_id',to_jsonb(NEW)->>'user_id') IS DISTINCT FROM auth.uid()::text
      AND NOT EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=auth.uid() AND r.role::text='doctor_admin')) THEN
      RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='Professional changes require the owner or credential reviewer';
    END IF;
    allowed := ARRAY['full_name','specialization','category','city','clinic_name','languages','bio','avatar_url','phone','consultation_fee'];
    IF EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id=auth.uid() AND r.role::text='doctor_admin') THEN
      allowed := allowed || ARRAY['is_approved','is_verified','is_suspended','verification_status','rejection_reason','suspended_at','suspended_reason'];
    END IF;
    IF TG_OP='INSERT' AND (NEW.user_id IS DISTINCT FROM auth.uid() OR NEW.is_approved OR NEW.is_verified
      OR NEW.hms_access OR NEW.vaidya_access IS TRUE OR NEW.hms_role IS NOT NULL OR NEW.hms_branch IS NOT NULL
      OR NEW.hms_access_granted_at IS NOT NULL OR NEW.hms_access_granted_by IS NOT NULL OR NEW.hms_access_expiry IS NOT NULL
      OR COALESCE(cardinality(NEW.hms_branches),0)>0 OR COALESCE(cardinality(NEW.hms_modules),0)>0) THEN
      RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='Professional privileges require approval';
    END IF;
    IF TG_OP='UPDATE' AND (to_jsonb(NEW)-allowed IS DISTINCT FROM to_jsonb(OLD)-allowed) THEN
      RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='Protected professional permissions cannot be self-edited';
    END IF;
  ELSIF TG_TABLE_NAME='hms_op_patients' THEN
    IF NOT ayuzee_private.rbac_location(COALESCE(to_jsonb(OLD)->>'branch',to_jsonb(NEW)->>'branch'),'registration')
       OR (TG_OP='INSERT' AND NEW.auth_user_id IS NOT NULL)
       OR (TG_OP='UPDATE' AND (NEW.branch IS DISTINCT FROM OLD.branch OR NEW.auth_user_id IS DISTINCT FROM OLD.auth_user_id)) THEN
      RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='Patient registration requires an authorized branch registrar';
    END IF;
  ELSIF TG_TABLE_NAME='hms_op_visits' THEN
    IF TG_OP<>'INSERT' AND NOT (ayuzee_private.rbac_doctor_visit(OLD.id) OR ayuzee_private.rbac_location(OLD.branch,'registration')) THEN
      RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='Visit changes require assignment or an authorized registrar';
    END IF;
    IF TG_OP='INSERT' OR TG_OP='DELETE' OR
      (to_jsonb(NEW)-ARRAY['notes','chief_complaint','status','check_in_time','check_out_time','updated_at','prescription_given','vitals_captured']
       IS DISTINCT FROM to_jsonb(OLD)-ARRAY['notes','chief_complaint','status','check_in_time','check_out_time','updated_at','prescription_given','vitals_captured']) THEN
      IF NOT ayuzee_private.rbac_location(COALESCE(to_jsonb(NEW)->>'branch',to_jsonb(OLD)->>'branch'),'registration') THEN
        RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='Patient assignment requires an authorized registrar';
      END IF;
    END IF;
  END IF;
  IF TG_OP='DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END
$$;

-- Caller-specific profile search closes the existing owner-context RPC bypass.
CREATE OR REPLACE FUNCTION public.search_patient(_query text)
RETURNS TABLE(profile_id uuid, ayuzee_patient_id text, hms_op_number text, full_name text,
 phone text, email text, gender text, date_of_birth date, city text, hms_patient_linked boolean, sync_status text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT p.id,p.ayuzee_patient_id,p.hms_op_number,p.full_name,p.phone,p.email,p.gender,p.date_of_birth,p.city,p.hms_patient_linked,
    CASE WHEN p.hms_patient_linked THEN 'linked' ELSE 'platform_only' END
  FROM public.profiles p WHERE p.is_active IS TRUE AND auth.uid() IS NOT NULL
    AND ayuzee_private.rbac_patient(p.user_id)
    AND length(btrim(_query)) BETWEEN 2 AND 100
    AND (p.phone ILIKE '%'||_query||'%' OR p.full_name ILIKE '%'||_query||'%'
      OR p.ayuzee_patient_id ILIKE '%'||_query||'%' OR p.hms_op_number ILIKE '%'||_query||'%' OR p.email ILIKE '%'||_query||'%')
  ORDER BY CASE WHEN p.phone=_query THEN 0 ELSE 1 END,p.full_name LIMIT 20
$$;
REVOKE ALL ON FUNCTION public.search_patient(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.search_patient(text) TO authenticated,service_role;

-- Functions in this non-exposed schema are explicit, narrowly scoped helpers.
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA ayuzee_private FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION ayuzee_private.rbac_actor(),ayuzee_private.rbac_admin(),ayuzee_private.rbac_server(),
 ayuzee_private.rbac_branch(uuid,text),ayuzee_private.rbac_location(text,text),
 ayuzee_private.rbac_employee(uuid),ayuzee_private.rbac_doctor_visit(uuid),ayuzee_private.rbac_registry(uuid),
 ayuzee_private.rbac_patient(uuid),ayuzee_private.rbac_own_patient(uuid),
 ayuzee_private.rbac_accounts(),ayuzee_private.rbac_branch_label(uuid)
 TO authenticated,service_role;

CREATE OR REPLACE VIEW public.unified_patient_view WITH (security_invoker=true) AS
SELECT u.id AS user_id,COALESCE(p.full_name,u.email) AS name,p.phone,p.date_of_birth,p.gender,p.city,
 EXISTS(SELECT 1 FROM public.ayuzee_hms_bridge b WHERE b.ayuzee_id=u.id AND b.bridge_type='patient') AS has_hms_record,
 (SELECT count(*) FROM public.ayuzee_hms_bridge b WHERE b.ayuzee_id=u.id) AS bridge_records_count
FROM ayuzee_private.rbac_accounts() u LEFT JOIN public.profiles p ON p.user_id=u.id;

CREATE OR REPLACE VIEW public.unified_patient_directory WITH (security_invoker=true) AS
SELECT p.id AS profile_id,p.user_id,p.ayuzee_patient_id,p.hms_op_number,p.full_name,p.phone,p.email,
 p.gender,p.date_of_birth,p.city,p.state,p.blood_group,p.hms_patient_linked,p.hms_branch_id,
 ayuzee_private.rbac_branch_label(p.hms_branch_id) AS linked_branch,p.abha_id,p.is_active,p.created_at,
 CASE WHEN p.hms_patient_linked AND p.user_id IS NOT NULL THEN 'platform_and_hms'
   WHEN p.hms_patient_linked THEN 'hms_only' WHEN p.user_id IS NOT NULL THEN 'platform_only' ELSE 'orphan' END AS sync_status
FROM public.profiles p WHERE p.is_active IS TRUE ORDER BY p.created_at DESC;
