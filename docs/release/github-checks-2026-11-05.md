# GitHub checks — 5 November 2026

Historical initial failures are recorded below. See [the source repair](ci-repair-2026-11-05.md) for the latest local verification; subsequent remote results must be checked on the new commit.

The source checkpoint `067367bc15bf91bf8d0af7788106082538257cbf` was pushed
successfully to Sai-Branch. Main stayed at
`ea29dec5eb4b6d3546161aec0c711a56eaddaeb9`.
The commit badge describes CI results, not whether the push succeeded.

[Workflow run](https://github.com/curesure4u-bot/ayuzee/actions/runs/41980269316):
six successful jobs and two failed jobs. Accounts, community/commerce, directory,
preview safety, configuration TypeScript and production build passed.

- [Full-app job](https://github.com/curesure4u-bot/ayuzee/actions/runs/41980269316/job/127088513651)
  stopped in schema preflight with `spawnSync rg ENOENT`; TypeScript itself was
  skipped. The script assumed a system ripgrep binary that this runner lacked.
  Source discovery now falls back to Node's filesystem API for that specific
  missing-tool error. It retains source filters and does not swallow permission
  failures. Seven schema-contract tests pass, including absent-ripgrep discovery.
  The actual unresolved live-schema calls remain a failing release gate; fixing
  the tool assumption is not a full application typecheck pass.
- [Dependency audit](https://github.com/curesure4u-bot/ayuzee/actions/runs/41980269316/job/127088513682)
  reported 51 vulnerabilities: 32 moderate, 17 high and two critical. Its
  `npm audit --audit-level=high` failure is expected until dependency repairs
  are reviewed and verified. This supersedes the older 56-count measurement
  for this specific GitHub run; it does not imply that dependencies were repaired.

No CI check was disabled, made advisory or changed to fabricate a green badge.
The branch is a progress checkpoint, with local Phase 3 criteria 8/8 and hosted
acceptance 0/8. Phase 4 work began locally after verifying the push.
