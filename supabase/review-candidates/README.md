# Database repair candidates

These files are **review material, not applied migrations**. Supabase migration
commands do not discover this directory. Local tests read the named candidate
explicitly and run it only inside an ephemeral, synthetic PostgreSQL engine.

Do not copy these into `migrations` or execute them in a hosted project until
the administrator has established isolated staging and reconciled applied
history, effective schema, grants, policies, functions and authentication hooks.
The existing duplicate migration versions are deliberately unchanged.

## Phase 1: account roles

`phase1-account-role-boundary.sql` addresses the supplied S01 role-policy defect:

- Authenticated clients may read their own assignments only. Browser accounts,
  including administrator accounts, cannot write role assignments directly.
- The trusted backend's service database principal may perform role DML. Its
  handlers must still authorize the caller, target, operation and allowed role.
  This candidate does not secure a handler that blindly trusts a request body.
- A private write trigger rejects browser request contexts even inside the
  tested legacy owner-context functions. This is defense in depth, not a sandbox
  for arbitrary SQL, unsafe views, other privileged tables or arbitrary RPCs.
- Direct database maintenance is permitted for the explicit platform principals
  without a request role. A claimed service role alone is insufficient.
- All existing assignments survive. Existing privileged accounts require a
  separate review; compromised grants are not automatically identifiable.

No new browser role-assignment RPC or signup hook is introduced. Existing
signup hooks, account deletion cascades, professional onboarding and browser
admin-management pages may need changes before this candidate can be applied.
In particular, the Auth database principal is not automatically allowed to
write roles; review its real bootstrap/deletion path with the signup repair.
Never grant roles from editable signup metadata to make those flows pass.

RLS ownership tests here exercise PostgreSQL directly. They do not establish
the deployed PostgREST/JWT configuration, existing views/RPC grants, real Auth
hooks, server service-key handling or permissions on profiles/doctors.

## Local verification

```sh
npm ci
npm run test:account-role-boundary
```

PGlite is an exact-version development dependency. It supplies a local
PostgreSQL engine; tests need no credentials, hosted connections, Docker,
network calls or persistent database directory. It is not imported by the app.

If staging eventually rejects this candidate, revise the candidate and tests
first. Do not restore the known permissive policies as a routine rollback.
Disable the affected account feature and restore only a previously verified
permission baseline. No database has been changed by preparing these files.
