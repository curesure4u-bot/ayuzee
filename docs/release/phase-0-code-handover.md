# Phase 0 code updates — hosting deferred

Prepared against `curesure4u-bot/ayuzee`, `Sai-Branch`, commit
`4dc548a741ae0cee3418e66ca8ec80db14dfc137`. Date: 15 October 2026.

Sai requested deferring Netlify/Supabase setup while progressing the remaining
Phase 0 code work. No live settings, credentials, SQL, accounts or provider
configuration were changed. Phase 1 has not started.

## Working directory and approval

Sai's canonical local checkout is:

`/Users/sai/Documents/Codex/2026-10-14/alright-im-fine-with-the-plan/work/ayuzee`

It is a complete Git checkout on `Sai-Branch` with the GitHub origin above.
Use this checkout for subsequent work; do not create more working copies.
The former `work/ayuzee-verified` location is an alias to this same checkout.
The partial snapshot and duplicate original files are preserved outside this
repository in `work/archive`; they are not part of this change.

Future chats need this folder selected/accessible to read the same files.
The repository and parent workspace `AGENTS.md` files record this agreement.
Prepare local work only: **do not push, merge, publish or deploy until Sai
explicitly commands it.** Permission for Phase 1 is separately required.

## Prepared changes

1. **Truthful checks (E01/E02/E09).** Separate commands target the application
   and Vite configuration explicitly. The nested comment in the dormant
   Razorpay helper is repaired. The dormant booking utility receives services
   as arguments instead of calling hooks inside an ordinary async function.
   Its booking-failure and notification-failure paths have meaningful tests.
2. **Preview boundary.** Informational pages remain accessible. Other routes,
   including account access, member tools, shopping and clinical portals, show
   a non-operational Preview page. The underlying feature code is preserved.
   There is no browser flag or environment variable to enable these routes.
   A future verified release must deliberately expand the reviewed route policy.
   Global assistant/search/notification overlays are no longer mounted.
3. **Optional Netlify integrations contained in source.** The five deployed
   entrypoints are ESM handlers returning HTTP 503 with `success: false` and
   `FEATURE_PREVIEW`. They perform no provider calls, database operations or
   input logging, even when called directly. Their original implementations
   remain under `netlify/disabled-implementations/`, outside the configured
   functions directory and without imports from the deployed handlers.
4. **Environment guidance.** The browser-prefixed Telegram private-token
   example is removed. Optional integrations remain disabled until their
   authorization and sandbox checks pass.
5. **Automatic source checks.** A separate workflow runs targeted tests,
   native function-import checks, changed-file lint, full application/config
   typechecks, a production build and a dependency advisory check. No production secrets are used.
   Known debt can make these jobs fail; failures are not swallowed or replaced
   with placeholder tests. Existing E2E remains manual until isolated staging
   is available. Netlify build settings and GitHub branch-protection settings
   are unchanged, so adding this workflow alone does not gate deployments.

## Audience and UI

The Preview page uses readable 18px body text, a clear heading, a persistent
Preview label, two generously sized navigation buttons and visible keyboard
focus. Focus moves to the heading on a preview-route change. It uses no
animation, fabricated clinical results, fake loading delay or simulated action.
These choices suit the requested audience aged 40+. Visual/mobile/browser QA
is still required before release; this work is not a whole-site redesign.

## Validation

Rechecked on **16 October 2026** after Sai installed project dependencies.
All 89 direct dependency versions inspected match `package-lock.json`.

| Check | Local result |
| --- | --- |
| Baseline and Phase 0 code tests | 15 passed |
| Native endpoint imports and deny-execution tests | 2 passed |
| Changed TS/TSX syntax | Passed compiler parser checks |
| Compiler negative-control fixture | Exposes an application error hidden by an empty referenced root |
| Source patch | Applies cleanly to the pinned source snapshot; byte comparison performed |
| All application TS/TSX syntax | 1,530 source files parsed; no syntax diagnostics |
| Full application typecheck | Incomplete: interrupted after approximately five minutes without a compiler verdict or diagnostics |
| Configuration typecheck | Passed |
| Targeted ESLint | Passed |
| Full ESLint | 3,144 errors; 147 warnings |
| Existing Vitest suite | 18 passed across four files; four tests remain placeholders |
| Production build | Passed; large-chunk warning remains |
| Netlify bundle and browser journeys | Not run |
| Schema replay and direct database authorization | Deferred with Supabase/staging setup |
| Current dependency advisories | Fresh audit completed: 51 affected package entries (2 critical, 20 high, 28 moderate, 1 low); no upgrades applied |

The earlier 15 October review borrowed host TypeScript because installation
failed with registry DNS and npm exit-handler errors. That installation blocker
is superseded: dependencies are now available in the project's ignored
`node_modules`, including locked TypeScript **5.9.3**. The fresh advisory check
also successfully contacted the npm registry during the 16 October run.
Dependency versions and the lockfile are unchanged; no dependencies are vendored
in Git. CI will install with `npm ci` when the branch is pushed.
No remote workflow, deployment or push was performed during preparation.

The full lint count is two higher than the historical audit. Comparing changed
TS files against the parent with the same linter explains this: two hook errors
and one parser error were removed, while the repaired Razorpay syntax exposed
five pre-existing `any` violations. These are newly visible diagnostics, not
newly introduced `any` usages. The targeted Phase 0 lint command passes.

The audit's critical package entries are Vitest/Tinypool in the test toolchain.
Package counts alone do not establish production exploitability. Triage relevant
advisories before selecting upgrades; do not run an automatic force-fix.

For subsequent validation in the canonical checkout:

```sh
npm ci
npm run test:phase0
npm run check:functions
npm run lint:phase0
npm run typecheck:app
npm run typecheck:config
npm run build
npm run audit:deps
```

Run commands individually so every failure is visible. Investigate the slow
application typecheck before claiming a result or recording its diagnostic
baseline. Full lint and dependency advisory checks currently fail. The visible
npm cache remains `/Users/sai/.npm`; the requested shared Codex cache was not
present during inspection. This does not prevent use of installed dependencies.

## Remaining boundaries

The route boundary is a UI control, not database authorization. Existing
Supabase functions and direct database APIs have not been disabled or repaired.
Existing providers and allowed informational pages may still make Supabase
requests; the contact page's existing submission form is unchanged. This work
does not claim that all browser writes or network requests are disabled.
This patch therefore does **not** establish that financial/clinical state is
protected through direct requests or existing deployments. Keep the release
blocked until the corresponding backend controls are verified in staging.

The database history still contains 199 migrations, including four with version
`20260715`, and 114 manual SQL scripts. They were not renamed or replayed.
Reconciliation must start by inspecting applied history and the effective
schema after isolated staging is available. This avoids losing migration
identity or guessing which manual scripts were executed.

All 79 findings are tracked in `audit-status.json`; implemented source changes
are distinguished from externally verified fixes. The optional Sentry setup
already present in `src/main.tsx` is unchanged; its DSN, hosted delivery and
privacy configuration remain part of the deferred environment review.

Phase 0 tasks 1/2/4 are still pending their hosting/staging/schema evidence.
Tasks 3/5/6 have bounded source updates, with the validation limits above.
Phase 0's exit condition has not passed. Do not start Phase 1 without Sai's
permission after Phase 0 review.

## Review and rollback

The canonical checkout already contains the earlier baseline-tool update and
the combined source changes. Do not apply either exported patch to it again.
Review the local commit/diff on `Sai-Branch`; remote publication requires Sai's
explicit command. Automated checks may fail on existing type/dependency debt;
their results must be reviewed before treating the change as release-ready.

Preserve unrelated local work. No dependency version or lockfile changes are
included. Rollback consists of reverting the code patch; no data restoration
is needed. Reverting also restores the original unready endpoint behavior,
so it is not a reason to enable those integrations in production.


## 16 October preview follow-up and source publication

The modularity assessment is recorded in
`docs/architecture/modularity-assessment.md`. Broad restructuring is not required;
account-domain boundaries will accompany their owning Phase 1 repairs.

The default home now renders an informational preview with the existing visual
palette. The original launch home remains a named export, but its sample doctor
cards, testimonials and fabricated delivery checker are not mounted by default.
Public navigation no longer subscribes to account state. Hidden legacy navigation
returns without mounting its account/data hooks. Contact/newsletter/waitlist
forms have visible preview notices, disabled fieldsets and submit prevention;
they no longer import or invoke database submission helpers. Existing private
APIs and policies are still unchanged: this is not complete backend containment.
The `/blog` redirect can reach the reviewed public blog index/detail routes.

Five additional rendered component tests pass (23 Vitest tests total; four
older placeholders remain). The 17 focused Node tests still pass. Changed-file
lint and a separate preview UI semantic typecheck pass. The preview check is
explicitly narrower than the full application and does not replace its CI job.
Full lint now reports 3,138 errors and 147 warnings. The Razorpay helper's five
existing `any` annotations and the navigation cast were replaced with typed
interfaces/queries rather than suppressing diagnostics.

Production compilation passes with synthetic public values for isolated QA.
Headless Chrome launch failed before browser inspection, so rendered mobile and
visual acceptance is still unverified. Full application typechecking also remains
incomplete. A bounded compiler trace identifies excessive type instantiation in
existing Supabase query expressions; file moves would not resolve that defect.
CI retains the full check with a timeout rather than reporting a false success.

Sai authorized a reviewed Phase 0 source push and then Phase 1 work on 16 October.
Use `[skip netlify]` on the latest source commit to skip Netlify Git-triggered
branch/production deployment while administration remains deferred. This is a
source checkpoint, not completion of Phase 0's functional release exit condition.
The GitHub integration write probe returned HTTP 403 and an ordinary Git remote
query timed out; no push has been confirmed. Do not mark publication successful
without verifying the remote branch head. Do not publish Phase 1 automatically.
