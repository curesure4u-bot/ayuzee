# Database and hosting follow-up — 24 October 2026

Sai requested resuming the deferred database and hosting work across Phases
0–2. This supersedes the earlier instruction to defer that administration.
Work continues in the existing checkout on `Sai-Branch`, preserving the
existing unpublished Phase 1 changes. No extra project or clone was created.

## Access and environment identity

- The source CLI configuration names `saphetdusyfrcduzsouk`.
- Sai supplied `https://gsjkrmrumlxakcecpfiz.supabase.co` as the intended
  database URL. Its purpose, schema and relationship to the source project
  still require verification. The CLI project reference has not been changed
  based solely on this URL.
- Supabase lists **zero projects**. The connected organization is
  **Sai-2211's Org** (`cnwixmdcspzybiuculbx`). Requests for both project references
  return **You do not have permission to perform this action**.
- Sai subsequently confirmed that the working project belongs to
  **curesure4u-bot's Org**. That organization is absent from the connected
  account's organization list, explaining the remaining access blocker.
- The supplied Netlify deployment is
  [this deployment](https://6a9e0323be30ee3c78effdfa--moonlit-centaur-b93ace.netlify.app/).
  A certificate-verified public HEAD request returned HTTP 200 and Netlify
  headers. This confirms delivery of HTML, not a functioning application,
  deployed commit, database connectivity or administrative access.
- The delivered main bundle, `/assets/index-QqvNv9Ak.js`, contains
  `https://gsjkrmrumlxakcecpfiz.supabase.co` and no occurrence of the older source
  project reference. Nine first-party JavaScript assets were inspected;
  no key values were printed or saved. This confirms a configured destination,
  not a successful database request or correct key pairing.
- No Netlify connector is available; plugin discovery returned no Netlify
  result. Native browser access failed with a screen-capture error.
- Linking GitHub to a provider has not granted this session access to the
  provider's project administration. The account connected here must have
  access to the actual project/site.

## Local changes completed

Netlify now selects `npm run build:netlify`. Its new entrypoint:

1. Loads the production Vite environment and rejects absent/placeholder project
   configuration, non-HTTPS API origins, mismatched legacy anon-key project
   claims, expired legacy keys, privileged keys and recognized server-secret
   variables exposed with `VITE_` prefixes. Error messages omit values.
2. Runs hosting tests, Phase 0/1 tests, endpoint checks, unit tests, targeted
   lint, preview/account/configuration/full application typechecks and the
   dependency audit. Any nonzero exit, signal or timeout stops the sequence.
3. Compiles only after those checks pass. Each command has a ten-minute limit.
   Existing application-typecheck or advisory failures therefore block release;
   they have not been repaired or suppressed by this change.

The new test command is also included in the existing automatic source-check
workflow. The ordinary `npm run build` remains a compilation command, so
Netlify must use the configured gated command. Dashboard context overrides,
manual/prebuilt deployments, branch protection, deployed packaging and live
configuration remain unverified. These local edits are not yet hosted.

Opaque publishable keys cannot be matched to a project offline. Format checks
and decoded legacy claims do not prove authenticity, active key status,
connectivity, staging separation or correct backend authorization.

`supabase/inspection/phase0-2-catalog.sql` supplies an explicit read-only
transaction that inventories relations/RLS, complete policies, table/column
grants, callable functions, Auth triggers, community/account columns and
constraints. It does not read user records or function bodies, modify schema,
or apply a candidate. Its results still require private operator review:
policy expressions and function settings may contain embedded literals.

## Deferred work and acceptance

| Scope | Current status and next required evidence |
| --- | --- |
| Phase 0: existing environment identity | Supplied URLs recorded; inspect the owning dashboards, deployed commit, build contexts, quotas, providers and budget. No paid resource has been created. |
| Phase 0: staging | No isolated staging verified. Establish a separate environment with synthetic data and separate secrets after identifying the existing resources. |
| Phase 0: schema/history | Reconfirmed 199 migration files, 114 manual SQL scripts and four files sharing version `20260715`. Read effective schema and applied history before choosing a baseline or repairing identities. No history was renamed or replayed. |
| Phase 0: containment | Local Netlify and four privileged Supabase handlers remain previews. Inspect deployed functions, policies, storage and gateway settings; then verify direct requests. |
| Phase 0: release checks | Local Netlify gate implemented and tested. Full application typechecking, advisory remediation, deployed function packaging, monitoring and recovery remain open. |
| Phase 1: accounts | Role/profile/onboarding/doctor candidates still remain unapplied. Local fixtures pass; inspect Auth hooks, grants, views and legacy RPCs, adapt in staging, and verify direct anonymous/member/admin requests. |
| Phase 1: Auth delivery | Verify SMTP, confirmation, site URL, callback/reset redirects, rate limits and real registration/recovery/logout journeys in the target environment. |
| Phase 2: doctor discovery | Verify approved public projection, grants, anonymous access and pagination against the reconciled schema. |
| Phase 2: community | Audience controls, comments/likes, poll schema/voting, moderation and durable notifications remain unresolved. Repair and verify database contracts in staging before release. |
| Phase 2: acceptance | Community browser/accessibility/SEO checks and the agreed synthetic load/correctness test remain open. |

No phase exit condition is newly satisfied. Broader financial/clinical findings
belong to later workflow phases and remain behind previews; these changes do
not establish their live security.

## Verification performed

| Check | Result |
| --- | --- |
| New hosting gate tests | 5 passed, including every command-failure position, timeout/signal handling, secret redaction, key checks and compilation order |
| Phase 0 tests | 15 passed |
| Native Netlify endpoint checks | 2 passed |
| Phase 1 PostgreSQL/function checks | 31 passed (Node count includes enclosing tests) |
| Account Vitest tests | 43 passed |
| Read-only catalog SQL | All ten statements executed in isolated PGlite with synthetic roles; not executed against Supabase |
| Real gated command with absent local configuration | Exit 1 with variable-name-only diagnostics before checks/build; expected negative control |
| Patch whitespace | Passed |

No complete gated release was run with real credentials. Full application
typechecking, fresh dependency audit and production compilation were not
rerun for this bounded gate change. No database, provider settings, deployment,
purchase, push or merge was performed.

## Resuming hosted work

Authorize this session's Supabase connection for **curesure4u-bot's Org**,
using an account that can open
[the supplied project dashboard](https://supabase.com/dashboard/project/gsjkrmrumlxakcecpfiz),
or obtain project access for the connected account. For hosting administration,
provide access to the existing Netlify site dashboard. Public URLs identify
resources but do not authorize their administration. Do not send passwords,
private tokens or service-role keys in chat.

Once access succeeds, inspect advisors/logs and the catalog/history first;
record environment separation, reconcile schema, adapt/apply candidates in
staging, and run the required direct API and Auth/browser acceptance checks.

References checked: [Supabase migrations](https://supabase.com/docs/guides/deployment/database-migrations),
[API keys](https://supabase.com/docs/guides/getting-started/api-keys),
[Netlify build troubleshooting](https://docs.netlify.com/build/configure-builds/troubleshooting-tips/),
[deploy contexts](https://docs.netlify.com/deploy/deploy-overview/).
