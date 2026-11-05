# Ayuzee project working agreement

## Current authorization and checkpoint

- CI repair is the latest priority before further Phase 4 work. Sai approved
  retaining unfinished features as explicit previews and requested an intended-use
  inventory for keep/remove decisions. Read `docs/review/FEATURES_FOR_DECISION.md`
  and `docs/release/ci-repair-2026-11-05.md`. 351 original modules match the prior
  Git checkpoint byte-for-byte; never import them into active source or invent
  live schema types. No permanent feature removal is approved. The full app
  compiler, audit (zero findings) and 486 unit tests pass locally. Verify the
  actual GitHub run after pushing; source CI does not imply hosted acceptance.

- Latest checkpoint: source commits 067367b and CI portability fix 39e1d4d
  are pushed and verified on Sai-Branch; main is unchanged. Phase 4.1 ledger
  foundation is local and uncommitted. Read `docs/domains/wallet-ledger.md`.
  Its 20 isolated and six native checks pass, but P4.1 remains open pending
  wallet UI/legacy integration. Finance policy is disabled after cleanup;
  local_verification.wallet_install pins its source. Do not replay installed SQL.

- Latest explicit instruction, 5 November 2026: commit and push all prepared
  updates to Sai-Branch, then begin Phase 4 local implementation. This supersedes
  the earlier preparation-only/Phase-4 wait below. Use a normal fast-forward push
  with [skip netlify]; do not touch main, force-push, merge, deploy or incur cost.
  Hosting branch controls remain unverified; do not claim deployment occurred.

- Sai authorized Phase 3 local implementation, including 3.7/3.8, source cleanup
  and preparation for a checkpoint commit on 5 November 2026. Phase 3 is now
  **8/8 local, 0/8 hosted**; its phase exit remains open. Sai has now supplied that next command for Phase 4 local work. Earlier Phase 0–2 exit checks are still open.
- Read `docs/release/RESUME.md`, `docs/domains/commerce-closeout.md`,
  `docs/release/commit-readiness.md` and `docs/release/phase-progress.json`.
  Update evidence before checklist status; regenerate with `npm run progress`
  and verify `npm run progress:check`. Local checks never imply hosted acceptance.
- No paid resources, upgrades, cost-confirmation calls, real payments/refunds,
  courier operations, hosted commerce migrations or publishing are authorized.
  Keep staging local and use fictional providers. Do not request private keys or
  passwords in chat. Public previews must not fabricate successful service work.
- Preparing a commit does not authorize merging to main or deployment. Check the
  actual Netlify/Lovable branch-publishing controls before any source-only push;
  a non-main branch or `[skip netlify]` tag alone does not prove no deployment.
- Optional WhatsApp/Telegram/PDF and other feature removals remain Sai's decision.
  The narrow cleanup archived obsolete artifacts and consolidated stale notes;
  it did not approve deleting application modules. Its recovery manifest is
  `docs/release/cleanup-result.json`. Preserve unrelated uncommitted changes.

## Repository and implementation rules

- Reuse this canonical checkout, recorded in `phase-0-code-handover.md`:
  `/Users/sai/Codex/2026-10-14/alright-im-fine-with-the-plan/work/ayuzee`.
  Repository `curesure4u-bot/ayuzee`; branch `Sai-Branch`. Check branch/status
  before editing. Do not create duplicate clones, reset changes or switch branches.
- Keep work and generated artifacts under `/Users/sai/Codex`. The canonical
  handover is `/Users/sai/Codex/Ayuzee-Project-Handover`. If checkout access is
  unavailable, explain and pause file creation instead of creating elsewhere.
- Preserve all existing files/changes unless an authorized edit or reviewed
  cleanup calls for changing them; archive recovery copies before removals.
- Source targets React/Vite with Supabase. Generated live types must retain
  provenance; do not invent missing live objects to silence TypeScript. Planned
  APIs use separate narrow candidate contracts. Full-app schema/type/dependency
  debt stays visible; scoped tests and a bundle build do not replace release gates.
- RBAC applies to all 17 account roles. Use current confirmed sessions, actual
  grants, explicit multi-role workspace choice, scoped navigation/direct routes
  and backend ownership checks. Hidden menus/labels are not authorization.
  Read `docs/domains/role-based-access-control.md` for the contract.
- Use shared account/session/capability modules. Clear scoped private queries on
  account/workspace changes. Do not initialize Auth on public preview pages.
  Keep the functional preview boundary until release acceptance.
- Most users are 40+: readable text, generous targets, persistent labels, visible
  keyboard focus and predictable navigation. Loading/empty/error/retry states
  must explain the next action. Respect reduced motion and real outcome evidence.

## Database and local runtime

- The scoped live access/onboarding repair was separately authorized and applied.
  The three applied source migrations are immutable and must not be replayed:
  `20261103193309_phase0_2_scoped_access.sql`,
  `20261103195736_auth_lifecycle_permissions.sql`,
  `20261104040057_account_onboarding_contract.sql`.
  Broader live API/storage/security and actual email delivery remain unverified.
- Existing local config: `local-staging/supabase/config.toml`, project
  `ayuzee-local-staging`; loopback API 54621, DB 54622, mail 54624. Reuse the
  existing seven containers/volume; never reset/delete staging to bypass drift.
  Checkout/payment/fulfilment/refund installs have fingerprint manifests under
  `local_verification`. Do not replay installed candidate DDL or edit it in place.
- Native synthetic tests clean only their own records and disable all four
  commerce policies afterward. Never print local keys or save them in evidence.
  Native operations use the available local admin role; delegated orders_admin
  is isolated-fixture covered, not proved against the older local enum or live.
- Use the pinned CLI and inspect `--help`; never use remote flags for local tests.
  CLI state belongs under the existing handover:
  `SUPABASE_HOME=/Users/sai/Codex/Ayuzee-Project-Handover/work/phase0-2-2026-11-04/cli-state`,
  with `DO_NOT_TRACK=1` and `SUPABASE_NO_UPDATE_NOTIFIER=1`. Never redefine HOME.
- Automatic approval review rejected a hosted role-metadata lookup under the
  local-only restriction and an earlier bulk hosted implementation export.
  Neither was retried/bypassed. Resolve authorization before repeating them.
  No hosted provider/dashboard access or deployment acceptance may be assumed
  from the local tests or the original 23-to-zero scoped advisor repair.

Original phase 0–8 plan and older working-agreement/checkpoint history are
preserved in the canonical handover. Use the current ledger as the progress source.
