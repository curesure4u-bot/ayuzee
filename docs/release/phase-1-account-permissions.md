# Phase 1: account permissions preparation

**Current local status — 3 November 2026:** account/session/recovery preparation and the new all-role workspace foundation are tracked in [phase progress](phase-progress.md) and [the RBAC increment](../domains/access-foundation-2026-11-03.md). The dated entries below are historical checkpoints. Phase 1 is not complete: hosted verification, full legacy-route integration, authoritative scoped adapters and direct data/API/storage acceptance remain open.

Date: 16 October 2026. Working branch: `Sai-Branch`.
Base source checkpoint: `0c404862561b7333c1e0d677e19fb2667ab921e2`.
Canonical checkout remains the path recorded in the Phase 0 handover.

Status: **first permissions subtask prepared and locally tested; no Phase 1
push, hosted SQL application, functional account release or Phase 2 work.**

## Modularity decision

**2 November requirement addition — RBAC-01 (required, planned).** Sai requested
role-specific portals and enforced access for every role in the system. Expand
the account-permission and role-onboarding/navigation tasks into the shared
[RBAC specification](../domains/role-based-access-control.md). Patients,
doctors, students, professionals, specialized administrators and hospital staff
must see only appropriate features in their authorized workspace. Enforce the
same rules for direct routes, actions, APIs and data access; labels or hidden
menus do not satisfy this requirement. Resolve all role sources, multi-role
switching, scope and revocation. This is a Phase 1 authenticated-release gate,
with each later module required to supply its own capability/policy tests.
It is not implemented by this planning addition. Dated progress below records
the original 16 October checkpoint; newer local work is described in the
2 November modernization progress record.

The [assessment](../architecture/modularity-assessment.md) was completed before
implementation. Broad restructuring is unnecessary. Retain existing feature
folders, Supabase client and shared backend authentication helper. Consolidate
account/session state during the session task; keep database authorization at
the database boundary. No competing authentication framework is introduced.

## First bounded update: prevent ordinary role assignment (S01)

Inspected the original `user_roles` definition, `20260715_fix_rls.sql`,
`20260715_user_setup.sql`, existing role lookup hook and shared function auth.
The supplied policies combine permissive reads/writes, including a misleading
"Service role" policy that does not restrict its database role.

The candidate at `supabase/review-candidates/phase1-account-role-boundary.sql`:

- Replaces the whole role policy set, removes browser table/column write grants
  and limits authenticated reads to the caller's assignments.
- Adds a private invoker-context trigger that denies browser role mutations
  through the tested legacy owner-context RPC paths, including truncation.
- Allows actual trusted service-principal writes and explicit database
  maintenance. A supplied service-role claim alone does not authorize a write.
- Preserves existing role records and aborts before changes if the expected
  user ID/schema contract is missing. It does not grant signup-requested roles.

This is intentionally outside `supabase/migrations`. No migration identity was
changed and no live SQL was executed. Read the candidate-directory README for
compatibility limits, including Auth hooks, account deletion and browser admin
pages that must be reviewed before application. Service handlers still need
their own caller/target/operation authorization; this SQL does not supply it.

## Local evidence

`npm run test:account-role-boundary` passes **14 scenarios** in real PostgreSQL
compiled to WebAssembly, using exact dev dependency `@electric-sql/pglite@0.5.10`.
Node reports 15 passing tests because it also counts the enclosing test.
The fixture deliberately reproduces the old escalation before applying the
candidate. Tests then exercise owner-only reads, account identity changes,
anonymous denial, denied direct insert/update/delete/truncate, tested definer
RPC bypasses, absent/forged claims, trusted service writes, database maintenance,
column-grant removal, private trigger attributes, repeat application and schema
mismatch rejection. Synthetic records only; no network/database credentials.

The only added package is that development test engine; all pre-existing locked
package entries are unchanged. It is not imported by the website. A separate
local CI job runs the database fixture test; it will run remotely only after a
future authorized Phase 1 push.

Regression checks also pass: 15 Phase 0 Node tests, two endpoint tests and 23
Vitest tests (including four existing placeholders). Workflow YAML parses and
retains the full application check. A fresh package audit still reports 51
affected entries, including two critical and 20 high; the added test engine
has no entry in that result. No existing advisory has been fixed or suppressed.
This source-only database update does not change frontend entrypoints; the
previously passing build is not represented as a new full acceptance run.

## Remaining Phase 1 work

The uploaded `/Ayuzee/PLAN.md` defines these small updates, in order:

1. **Account permissions:** S01 candidate is prepared only. Private/public
   profile separation (S02), protected doctor fields (S13), privileged backend
   functions (S09) and real API denial tests remain pending. Do not mark S01
   verified fixed without effective schema/RPC review and staging evidence.
2. **Signup/verification:** accurate confirmation state, email-return handling,
   resumable onboarding, reviewed safe role provisioning and email/redirect setup.
3. **Login/sessions:** shared session owner, no duplicate role subscriptions or
   stale account responses, private cache clearing on sign-out/account switch.
4. **Recovery:** invalid/expired links, successful reset and re-entry.
5. **Role onboarding/navigation and full RBAC (RBAC-01):** role-specific
   destinations, dashboards, menus and feature visibility for every reconciled
   system role, using shared capability decisions. Include explicit authorized
   multi-role workspace switching, direct-route/action denial, matching
   backend/data enforcement and revocation/cache tests. Professional requests
   and a selected login form cannot automatically grant privileges. See the
   [full requirement and acceptance matrix obligations](../domains/role-based-access-control.md).
6. **Abuse/accessibility:** enforced Supabase controls, truthful error/loading
   states, keyboard access and the requested readable interface for users 40+.

Next bounded source update: inspect and prepare private profile ownership and
public-field contracts. Keep account routes behind the Phase 0 preview boundary.
Actual staging, SMTP/redirect setup and hosted verification remain deferred by
Sai while consulting the administrator. This does not authorize Phase 2.

Phase 1's exit condition still requires registration through verification,
onboarding, login, recovery and logout plus direct API isolation tests. This
initial candidate and fixture do not meet that condition.

## Review and rollback

Review the candidate, fixture and tests together. Local rollback is reverting
this source-only update; there is no hosted data to restore. Applying policies
later requires a reviewed staging migration, real Auth lifecycle checks and a
safe prior permission baseline. Do not restore known permissive policies as a
routine rollback or enable accounts solely because fixture tests pass.
