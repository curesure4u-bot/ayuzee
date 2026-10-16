# Modularity assessment before Phase 1

Reviewed 16 October 2026 against local `Sai-Branch` at `6a49765`.
Sai has chosen to retain React/Vite, Netlify and Supabase. No provider migration,
new backend framework, microservice split or repository-wide move is proposed.

## Decision

Broad modularization is not a prerequisite for continuing repairs. Targeted
account-domain boundaries are justified and should accompany their owning
Phase 1 tasks. A directory move by itself repairs neither authorization nor
database contracts. Keep each repair independently reviewable and tested.

## Inspected evidence

- The current source has 1,530 TS/TSX modules: 1,181 under pages, 171 under
  components, 106 hooks, 15 services, three contexts and one provider module.
  These are file counts, not distinct complete workflows.
- Feature directories and lazy routing already provide useful organization.
  The Phase 0 route policy and endpoint response helper are already small,
  separate modules; they do not need a framework rewrite.
- A static search found session/authentication method calls in 320 source
  files. `SiteNav` independently loads sessions, profiles and roles while also
  calling `useUserRole`, which maintains another subscription and role lookup.
  This motivates one shared session owner during Phase 1 task 3.
- `useUserRole` recognizes a smaller role set than supplied SQL. HMS-specific
  roles and module permissions have different meanings; do not collapse them
  into one loose string or automatically promote professional role requests.
- `useAccessControl` lists HMS permission templates and is not the account
  session/authorization provider. Its sample records are not a security boundary.
- Backend functions already have `_shared/auth.ts`. Reuse and strengthen this
  boundary rather than adding another independent token validator per endpoint.
- Supplied role/profile SQL contains permissive policies. This must be repaired
  in the database; a frontend module cannot replace effective RLS verification.
- A bounded compiler trace reached 5,000,000 type instantiations while checking
  existing Supabase query expressions, including `Bulk.tsx` and admin pages.
  This is evidence of a type-checking bottleneck, not proof of live database
  schema correctness. Do not bypass it with `noCheck`, global `any`, or excluding
  application source. Reconcile query contracts incrementally with their schema.

## Boundaries to establish with the owning task

| Phase 1 task | Appropriate change | Required evidence |
| --- | --- | --- |
| Secure permissions | Reviewed private/public fields, complete effective role policies, protected doctor privilege fields, shared server authorization | Local database denial/ownership tests, then staging verification before release |
| Signup/verification | Account workflow functions separate from form rendering | Verification, incomplete onboarding and failure tests |
| Sessions | One account session owner; existing hook APIs remain adapters | Account switch, sign-out, stale request and private-cache tests |
| Recovery | Explicit recovery states separate from login rendering | Expired/invalid link, reset success and re-entry tests |
| Onboarding/navigation | Shared role interpretation and destination mapping with explicit professional approval | Role request cannot grant privileges; existing routes remain compatible |

Use a small `src/features/accounts` boundary only where it owns implemented
behavior, with existing public hook exports retained for compatibility. Backend
authorization belongs in the existing shared backend area; database policies
and constraints remain the authority for direct database access.

## Work deliberately postponed

Do not move all pages, split all routes, replace the database client, introduce
an ORM, add NestJS, or create a generic repository abstraction before these
repairs. Other domains should be modularized when their own phased workflows
are implemented and their contracts are understood.

## Authorization and release boundaries

Sai authorized a Phase 0 push only when its source update is ready and then
Phase 1 work. Hosting administration, staging creation and live database changes
remain deferred. Source preparation and local database fixtures do not establish
that production is repaired. Phase 0 release exit conditions are still open;
do not enable account routes simply because Phase 1 source work begins.

Keep Phase 0 follow-ups and Phase 1 implementation in separate commits. A source
push must not silently enable deployment of unfinished features. Preserve the
current checkout and working branch.
