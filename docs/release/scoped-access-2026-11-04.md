# Scoped live access repair — 4 November 2026

Sai explicitly authorized preparing the proper scoped repair and applying it to
the existing Ayuzee Supabase project. No paid resources or upgrades were used.
The former blanket browser-view containment candidate was **not applied**.

## Applied and verified

- Project `gsjkrmrumlxakcecpfiz`; hosted migration
  `20261103193440_phase0_2_scoped_access`. The CLI-created source file is
  `supabase/migrations/20261103193309_phase0_2_scoped_access.sql`; the hosted
  migration tool assigns its own version. Do not replay the 199 historical
  source migrations against this project.
- Follow-up `20261103195813_auth_lifecycle_permissions` preserves the existing
  Auth `ON DELETE SET NULL` cleanup contract and denies private reads after hard
  or soft account deletion. Its CLI-created source is
  `supabase/migrations/20261103195736_auth_lifecycle_permissions.sql`. A targeted
  test exposed the cleanup compatibility bug in the initial guard; the forward
  repair is tested against that exact initial migration. No live account was
  deleted for verification. All 17 replaced function bodies are fingerprinted
  before the upgrade, and the existing view definitions remain unchanged.
- All 21 public views now use caller permissions. The two patient projections
  no longer reference `auth.users` directly; a private caller-filtered function
  returns only the permitted account ID/email projection.
- Seventeen supporting tables have restrictive read/write policies. Existing
  permissive policies cannot override those fences. Role writes and six tables
  containing account/clinical authority have additional guards against browser
  self-promotion, owner-context RPC writes and forged clinical links.
- Patients see their own records; doctors require approval, an unexpired module
  grant, a known branch and a matching patient assignment. Staff domains and
  branches must belong to their authoritative organization. Existing `admin`
  and `super_admin` grants retain report access. No account was promoted.
- Anonymous users cannot select the 19 private views. College aggregates remain
  public; individual reward scores require explicit publication consent and
  never reveal another person's coin balance. No one was automatically opted in.
- `search_patient(text)` now enforces the same caller scope and bounded input.

The migration includes schema/view drift checks, lock/statement timeouts and a
transaction. It preserves existing records; no production records were copied
to local staging. Counts before/after were unchanged: 36 role rows, 15 profiles,
12 doctor rows, 10 staff rows and six administrator assignments.

## Evidence

- `node --test scripts/scoped-access.test.mjs`: 19 passing PostgreSQL tests,
  including negative controls, all 21 view column contracts, cross-account and
  cross-organization denial, suspension/expiry/revocation, protected writes,
  Auth bootstrap, trusted services and transactional drift rejection.
- `node scripts/scoped-access-local.mjs`: 70 passing integration checks (69 HTTP
  checks and one relational cleanup assertion) on the free
  loopback-only Docker Supabase stack with synthetic records and local tokens.
  The schema is a targeted fixture, not a complete 429-table replay. Only the
  view fingerprint precondition is substituted to match synthetic local views.
  The real local Auth service creates/deletes one synthetic account, verifying
  that the trusted database principal can preserve doctor/staff/clinical records
  while removing account references. An old local token cannot regain access.
- `supabase/inspection/scoped-access-acceptance.sql`: passed on live in a
  read-only transaction. Unknown accounts/forged editable role metadata were
  denied; existing admins read all reports; anonymous private-view/raw-Auth
  reads were denied; the public projections remained accessible. Actual account
  IDs were kept inside the database and never returned by the test.
- Security advisor: **23 ERROR findings → zero**. Remaining findings include
  70 mutable search paths, 56 anonymously executable definer functions, 58
  authenticated definer functions, disabled leaked-password protection and 12
  no-policy tables. These counts overlap and are not proof of exploitability.
  The authenticated function count includes the deliberate own-account-only
  publication preference RPC. The private preference table has a service-only
  policy and no browser table access; its scoped function owns browser writes.
- Machine-readable evidence: `scoped-access-live-result.json` and
  `scoped-access-local-result.json` in this directory.

Advisor references: [view permissions](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view),
[Auth exposure](https://supabase.com/docs/guides/database/database-linter?lint=0002_auth_users_exposed),
[privileged RPC review](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).

## Limits and remaining acceptance

This closes the inspected view exposure and related authority boundary. It does
not certify the other tables, storage buckets, RPCs, provider functions or every
legacy workflow. Zero advisor errors does not mean the system has no remaining
security issues. Broader server/storage denial and Phases 0–2 remain open.

Current metadata showed no visits/bills, one patient registry entry and no doctor
branch grants matching an existing branch. Six doctors otherwise met the clinical
eligibility predicate. Administrators must assign actual branches/patients before
clinical access can work; this repair never turns missing assignments into
platform-wide access. Staff display titles outside the reviewed scope vocabulary
are not silently upgraded to administrator permissions.

Recovery should be a reviewed forward repair to the affected scope or projection.
Restoring the previous public/owner-context policies would reopen the exposure.
The schema fingerprints, inspection metadata and original local view sources are
retained for comparison. Existing source snapshots preserve earlier branch work.

A bulk hosted function/view definition export was rejected by automatic approval
review. That export was not retried or bypassed; this repair used existing local
SQL definitions, approved column metadata, dependency names and live fingerprints.
The broader effective-schema baseline still needs its own authorized inspection.
