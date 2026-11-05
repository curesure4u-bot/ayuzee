# RBAC-01: role-specific portals and enforced access

Requested by Sai on 2 November 2026. **Required; local foundation implemented 3 November, full-system acceptance pending.**

Latest increment: [account role policy and workspace UI](access-foundation-2026-11-03.md). All 17 source account roles now have explicit portal mappings and guarded preview workspaces; 12 hospital roles have separate scope contracts. Legacy portal integration, authoritative membership/operation adapters and hosted API/data/storage verification remain incomplete. See [phase progress](../release/phase-progress.md). The original requirement below remains the acceptance contract.

## Product requirement

After sign-in, a user sees the dashboard, navigation, tools and actions appropriate to their verified role and workspace. A patient must not see doctor-only tools merely because the interface labels them “For doctors.” The same separation applies to every other role in the system. Restricted features must also reject unauthorized direct links and requests.

Public information and genuinely shared features remain explicitly public/shared. For example, patients can discover public doctor profiles without gaining access to a doctor's professional dashboard, clinical tools or assigned patient records.

## Phase ownership and priority

| Phase | Required delivery |
| --- | --- |
| Phase 1, account permissions + role onboarding/navigation | Canonical role/capability model, verified grants, correct login destinations, active workspace, shared access decisions, portal shells, navigation filtering, route/action checks, server authorization contracts, session/revocation handling and cross-role tests. Required before a functional authenticated release. |
| Phase 2, community | Apply the Phase 1 policy to every community entry point, professional audience, moderation action, search result and notification. Public doctor discovery remains distinct from restricted professional tools. |
| Phases 3–5 and 7, owning features | Assign explicit capabilities to every new route/action/data operation. Commerce, finance, booking, memberships, learning, AI and productivity use the shared foundation rather than adding independent role checks. |
| Phase 6, hospital operations | Enforce hospital staff capabilities plus organization, branch, patient/case assignment and temporary-access expiry for every operational/clinical workflow. Define the hospital role model in Phase 1; release operational grants with each verified hospital workflow. |
| Phase 8, combined acceptance | Audit the complete released route/feature matrix and direct APIs across all supported roles and scopes. This is regression verification; authorization is not postponed until Phase 8. |

Keep the existing Phase 0 environment, containment and release requirements. Existing account preparation and the new doctor-directory slice do not establish completion of RBAC-01. At the next Phase 1 implementation increment, prioritize this requirement before expanding authenticated feature exposure. Source preparation for other phases can remain behind the preview boundary.

## Role inventory: reconcile the complete system

The starting inventory must include all role sources, not just the six public signup choices. The following are source observations, not proof of the effective deployed enum or approved permission assignments:

- Generated `app_role` declarations in `src/integrations/supabase/types.ts`: `admin`, `doctor`, `patient`, `therapist`, `provider`, `super_admin`, `student`, `venue_owner`, `product_admin`, `blog_admin`, `content_admin`, `orders_admin`, `accounts_admin`, `doctor_admin`, `ayush_admin`, `support_admin`, `manufacturer`.
- Hospital roles in `src/hooks/useHmsAccess.ts`: `owner`, `branch_admin`, `branch_doctor`, `franchise_doctor`, `therapist`, `pharmacist`, `lab_tech`, `receptionist`, `camp_doctor`, `nurse`, `venue_partner`, `service_provider`.
- Role/module templates and configurable records, including `hms_access_roles`, staff/HR assignments, existing guards and role-management screens. Some current template records are mocks and cannot confer authority.
- Migration-defined roles, actual trusted assignments, custom roles and any additional roles found in the effective schema during reconciliation.

Distinguish global account roles, scoped hospital memberships, administrative responsibilities and feature entitlements. Do not flatten `provider` and `service_provider`, or a global doctor and a branch doctor, merely because their labels sound similar. Resolve aliases explicitly. Every supported role must have a reviewed feature/access mapping; unknown or unmapped privileged roles fail closed.

## Portal behavior

| Role family | Intended experience, subject to reviewed capabilities |
| --- | --- |
| Patient | Own patient account and permitted patient-facing services; no professional/staff administration or clinical signing tools. |
| Doctor | Approved professional workspace and authorized care functions; records restricted to actual assignment/scope. |
| Student | Student learning/community tools; no automatic clinician or hospital privileges. |
| Therapist | Assigned therapy schedule, notes and permitted patient context; no general prescribing or finance access. |
| Provider / venue owner / manufacturer | Relevant service, venue or manufacturing/catalog workspace with owned/scoped records. |
| Administrative roles | Only the delegated product, orders, accounts, credential review, content, AYUSH or support responsibilities. A specialized admin is not implicitly a platform administrator. |
| Hospital staff roles | Role-appropriate nursing, pharmacy, lab, reception, branch or other work within approved organization/branch and record scope. |
| Owner / platform administrator | Explicitly reviewed administrative capabilities and scope; broad titles are not a reason to silently bypass clinical-record access rules. |

This describes the intended separation, not a final permissions matrix. Phase 1 must produce the complete role × feature × operation × scope matrix, including read/create/edit/delete/approve/export/sign/dispense/settle distinctions and explicit public/shared classifications.

## Mandatory design rules

1. **Trusted authority:** the server derives identity from verified authentication and resolves trusted grants/memberships. Choosing “Doctor login,” a signup account type, a URL, editable metadata or a browser flag never grants a role. Pending, suspended, revoked and expired assignments remain restricted.
2. **One policy vocabulary:** define stable feature/route IDs and operation capabilities. Navigation, dashboard cards, menus, direct-route guards and action controls consume the same reviewed policy definitions. Backend/database enforcement uses corresponding contracts and denial tests; hiding controls alone is insufficient.
3. **Cover every entry point:** include header/sidebar/footer menus, home/dashboard cards, global search, command palettes, assistants, contextual links, notifications, deep links and role management. Restricted content must not leak through counts, previews, exports or cached data.
4. **Server and data enforcement:** validate operation and target scope in functions/commands and effective database/storage policies. A same-role user in a different hospital or branch is not automatically allowed. Clinical assignment and protected administrative/financial fields need explicit rules.
5. **Multi-role accounts:** offer an explicit switch only among actually granted, currently valid workspaces. The active portal shows that workspace's features, rather than merging every role's navigation. Choosing a workspace cannot confer authority. Preserve a clear public/shared area. Define deliberate context switching for authorized deep links into another workspace.
6. **Safe loading and revocation:** while roles are loading or cannot be verified, do not flash privileged menus/content. On logout, account switch, membership change, expiry or revocation, cancel stale requests and clear scoped private caches. Define backend freshness/revocation behavior for sensitive operations.
7. **Consistent denial:** unauthorized direct routes show an accessible denial/safe return path without revealing protected record details. Direct APIs deny the operation independently. An unknown route/role/capability does not receive a permissive default.
8. **Controlled administration:** only appropriately delegated operators grant/revoke roles, approve professional access or change capabilities; changes are audited. Protected grants cannot be edited by their subject or broadened through a narrower admin role.

## Implementation sequence when Phase 1 resumes

1. Reconcile the role sources above and the effective schema; inventory every existing feature/route and audience.
2. Produce the canonical matrix and name owners for ambiguous/shared/admin cases. Preserve pending requests separately from grants.
3. Build the shared policy resolver around existing account/session work, scoped memberships and stable capabilities. Keep existing hook exports as compatibility adapters where useful.
4. Apply portal destinations/shells and all UI entry-point filtering, including active workspace selection.
5. Enforce matching direct-route/action and backend/database/storage rules with compatibility-aware migrations after schema review.
6. Verify the complete role matrix, then expand only the accepted route policy. Each later module must supply its own capability entries and direct-request evidence before release.

## Acceptance obligations

- A patient login cannot see or enter doctor/staff-only tools through navigation, dashboard cards, search, a pasted URL or direct API requests. An appropriate public doctor profile remains discoverable.
- A doctor sees approved doctor features and only authorized case data. Using a doctor login form with patient credentials grants no doctor capability.
- Repeat allowed and denied operations for **every reconciled role**, not only doctor/patient. Each supported role has explicit expected destinations and feature visibility.
- Specialized admins cannot exercise unrelated administrative powers. A role holder cannot assign a stronger role to themselves or others outside delegated scope.
- Same-role, different-user/organization/branch/case requests are denied where ownership/assignment is required. Verify reads, writes, exports and file access.
- Pending/unverified, suspended, expired, revoked, missing and unknown roles fail safely. Loading/error states do not render restricted content.
- Multi-role switching exposes only the chosen authorized workspace, does not manufacture grants and does not retain another workspace/account's private data. Browser back/forward and old links respect the current context.
- Role removal and logout are tested with stale tokens, late responses, open tabs and cached queries. Backend denial remains effective independently of visible menus.
- Direct backend/database/storage tests prove denied access with no unauthorized mutation or sensitive payload disclosure. Passing browser visibility checks alone cannot close this requirement.
- Keyboard, focus, accessible denial states and narrow-screen navigation work for the supported portals. Every later released feature has entries in the capability/role regression suite.

## Status

Phase 1 local implementation has begun; see the dated increment above. Full RBAC-01 remains open and carries into later module acceptance. No hosted role, database policy or deployed behavior has been changed by this local work.
