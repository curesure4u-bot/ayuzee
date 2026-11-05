# Supabase ERROR-level findings — 4 November 2026

**Resolution:** the scoped replacement, not the blanket containment below, was
applied and verified on 4 November. All 23 ERROR findings are now clear. See
[the applied repair and remaining limits](scoped-access-2026-11-04.md). The
following sections retain the original inspection and proposal for traceability.

Project: Ayuzee (`gsjkrmrumlxakcecpfiz`). Read-only catalog/advisor inspection; no patient records queried.

The dashboard's 23 ERROR findings are 2 Auth-user-exposing views plus 21 owner-rights views. The two patient views appear in both categories; this is 21 distinct views.

## Exposed Auth Users (2)

- `public.unified_patient_view`
- `public.unified_patient_directory`

[Official remediation](https://supabase.com/docs/guides/database/database-linter?lint=0002_auth_users_exposed)

## Security Definer View (21)

- `public.gamification_leaderboard`
- `public.unified_patient_view`
- `public.competition_college_leaderboard`
- `public.mis_today_collection_by_user`
- `public.mis_today_collection_by_dept`
- `public.mis_today_hourly_collection`
- `public.hrms_v_workforce_summary`
- `public.hrms_v_department_workforce`
- `public.hrms_v_branch_workforce`
- `public.hrms_v_attrition_monthly`
- `public.hrms_v_doctor_activity`
- `public.hrms_v_therapist_activity`
- `public.hrms_v_expiring_documents`
- `public.hrms_v_expiring_registrations`
- `public.hrms_v_probation_ending`
- `public.hrms_v_expiring_training_certs`
- `public.unified_patient_directory`
- `public.mis_daily_revenue`
- `public.mis_department_revenue`
- `public.mis_doctor_revenue`
- `public.mis_opd_summary`

[Official remediation](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view)

## Concrete repair prepared

`supabase/review-candidates/phase0-view-containment.sql` forces invoker security and revokes table and explicit column privileges from PUBLIC/anon/authenticated on the 21 named views. It preserves definitions/data and trusted service SELECT. Six local PostgreSQL checks pass, including a negative control exposing synthetic Auth emails, denied browser reads, preservation, invoker RLS, repeat application and schema mismatch rejection.

Applying this containment changes existing hosted API availability, including HR, finance and patient aggregation reports. It is not a replacement for tenant/assignment-aware replacements or repairs to their underlying tables. Live application is awaiting the user's decision. No paid resource is required.

## Additional confirmed security work

Current role-table policies allow authenticated INSERT/UPDATE/DELETE without ownership limits, and anon SELECT. Profiles have unrestricted anon/authenticated SELECT. Doctor self-update and community audience isolation also require repairs. A zero ERROR advisor count would not establish complete RBAC.

## Approval-review limit

Automatic approval review rejected the broad full function/view-definition export as sensitive implementation/security data transmission. Only the narrower permissions/dependencies inspection completed. Reproducing the full schema locally requires explicit authorization for that source-code inspection; no workaround has been used.
