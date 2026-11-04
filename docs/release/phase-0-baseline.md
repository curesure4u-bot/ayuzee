# Phase 0, task 1: environment and release baseline

Status: **source baseline implemented; operator environment confirmation pending.**
This is the first preparation task from PLAN.md. Phase 0 is not complete, and
this report does not authorize a functional release or certify capacity.

This document records the initial pinned-source inspection. Subsequent code
repairs and the requested hosting deferral are recorded in
[phase-0-code-handover.md](./phase-0-code-handover.md). The machine inventory now
includes the prepared local changes; the initial observations below describe
the original branch state, not a new claim that those hazards remain unchanged.

## Source and comparison

- Repository: `curesure4u-bot/ayuzee`.
- Working branch: `Sai-Branch`.
- Inspected head: `4dc548a741ae0cee3418e66ca8ec80db14dfc137`.
- Audited application commit: `18c3c8580c665c6a711a12d5fda699b4a21da1f6`.
- Review date: 14 October 2026.
- The inspected head's sole parent is the audited application commit. Its only
  changed file is `docs/audits/Ayuzee_Codebase_Audit_Report.md` (added).
  No application repair has occurred between those commits.
- The baseline is pinned to the inspected head, before this preparation commit.
  Future runs include their actual HEAD and working-tree modification status.

The local Git clone was blocked by unavailable network DNS. Source inspection
used the connected GitHub service, the recursive tree at the pinned commit,
and pinned configuration/handler text. Local files form a partial review
snapshot, not a complete checkout. No full application build, dependency audit,
browser journey, migration replay, or live provider request was performed.

## What source establishes

| Area | Observed configuration | What remains unverified |
| --- | --- | --- |
| Netlify | `npm run build`, `dist`, `netlify/functions` | Site ID, actual deployed branch/commit, context-specific values, deployed handlers, build settings/quotas |
| Supabase | Source project ref `saphetdusyfrcduzsouk` | Whether it is live/production, actual compute/region/quotas, deployed schema/functions, auth settings |
| Database | 199 migrations and 114 manual SQL scripts | Effective schema, applied history, grants, data ownership and safe replay |
| Functions | 57 source entrypoints and 5 Netlify handlers | Enabled deployments, gateway settings, authorization and provider configuration |
| Checks | Empty-root typecheck, manual-only E2E workflow | Application checks and workflow gating remain unrepaired |
| Staging | No isolated environment established in this task | Separate projects/secrets, synthetic data and sandbox providers |
| Budget | No budget or upgrades authorized | User's monthly cap, actual current charges and measured requirements |

The inventory is in [source-baseline.json](./source-baseline.json).
Eight source-declared JWT overrides are recorded there; seven are `false`.
These settings do not establish which endpoints are deployed or safe.
Netlify handler variables are recorded as **names only**, not values.

## Reproducible check

Requires Node 20+ and Git. From a complete Git checkout:

```sh
npm run release:baseline > release-baseline.local.json
npm run test:release-baseline
```

The first command collects a source inventory. Exit 0 means collection
succeeded, even if the report lists open issues. It is **not** a release gate.
The tool uses tracked paths, does not load `.env`, execute SQL, import server
handlers, read provider secrets, or connect to external services.

To record the operator review, copy `environment.example.json` to a local file
outside the checkout. Populate metadata only, never keys or passwords:

```sh
node scripts/release-baseline.mjs --manifest /absolute/path/environment.json --require-environment
```

This optional gate exits 1 for missing evidence or unsafe staging declarations.
Passing means the operator record is complete and internally consistent; it
does not independently verify dashboards, credentials, RLS, data isolation,
preview containment, or feature correctness. The output explicitly preserves
that distinction. Do not replace typechecks or functional tests with this tool.

## Operator checklist to finish task 1

Record the following from the actual Netlify and Supabase dashboards. Keep
access credentials out of Git, reports, screenshots and chat.

1. Netlify site ID, deployed branch/full commit, production and preview context
   settings, and currently deployed handler inventory. Compare the branch with
   `Sai-Branch`; the working branch is not assumed to be the deployed branch.
2. Supabase project reference, compute size, region, actual connection,
   storage and authentication/email limits; deployed functions and their JWT
   settings. Identify the owner and purpose of the source-linked project.
3. Provider configuration inventory: which services are active, which are
   sandbox-only, secret **names/presence**, webhook verification, and limits.
   Include payment, AI, messaging, delivery, email, uploads and monitoring.
   Do not copy secret values into the operator record.
4. Dated evidence reference for that review. A dashboard/document reference
   should identify the reviewed environment and responsible operator.
5. Proposed hosting currency and monthly cap. Current baseline proposal:
   **no additional purchases or upgrades** while settings and requirements
   remain unknown. This is not a claim that current hosting is free.

The staging section remains incomplete until task 2 creates and verifies a
separate environment. The example deliberately uses null/false values so it
cannot be mistaken for a completed review.

## Audit status and next tasks

No audit finding is marked verified fixed by this task.

| Findings | Status in this task | Owning follow-up |
| --- | --- | --- |
| E01, E02, E06, E09 | Open; E01 detected by inventory, others retained from audit | Phase 0 task 3: truthful checks and targeted syntax/type/lint debt |
| E03, E04 | Open; migration collision detected, no SQL replay | Phase 0 task 4: staging schema reconciliation |
| E05, S15, S16 | Open; unsafe browser-secret example detected | Tasks 2/5 and owning feature repairs |
| O02, O04 | Open; packaging/CI hazards detected | Phase 0 task 6: deployment checks |
| O05, O09 | Open; no fresh registry audit or live readiness claim | Task 6; replace historical claims with dated evidence |

The four `20260715` migrations collide. Do not rename or blindly replay them
before inspecting the applied staging history. CommonJS handler syntax inside
the ESM package remains a packaging hazard, not a new reproduced hosted failure.

Next bounded update: **finish environment confirmation and create isolated
staging (Phase 0 task 2)**, with synthetic records, ephemeral accounts, separate
secrets and sandbox integrations. All Phase 0 tasks 2–6 remain unfinished.
Do not start Phase 1 without Sai's permission after Phase 0 review.

## UI requirements carried forward

The audience is mainly aged 40+. Preserve the established visual direction and
use clear navigation, readable text, generous button targets, persistent field
labels, predictable button placement and understandable validation. Loading,
empty and error states must explain what happened and what the user can do.
Animations/transitions must be restrained and support reduced-motion settings.
Preview labels must remain visible and unsupported actions disabled in the
backend as well as the interface. Verify these on the relevant workflow when
it is implemented; this baseline makes no claim that existing UI meets them.

## Validation and rollback

The new baseline tool passes its dedicated Node tests, including real temporary
Git-checkout CLI checks, missing/invalid record rejection, staging isolation
declarations and secret-value redaction. Only the new tool was tested.

Changes are additive documentation, two npm scripts and the baseline utility.
There are no dependency, schema, production-secret or user-facing changes.
Rollback by reverting this preparation commit; no data restoration is needed.
