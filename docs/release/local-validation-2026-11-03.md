# Local validation — 3 November 2026

Branch: `Sai-Branch`. Increment: Phase 1 RBAC policy/workspace foundation, with Phase 0 source-gate/progress tracking follow-up. No commit, push, deployment, hosted role change or database application performed.

| Check | Result | Scope / limit |
| --- | --- | --- |
| `npm test` | 157 passed, 15 files | Includes 69 new RBAC tests, two additional account UI regressions and four existing placeholder tests; not 157 live workflows. |
| `npm run test:phase1` | 31 Node checks and 114 unit tests passed | Isolated PostgreSQL candidates and account/access tests. SQL remains unapplied. |
| `npm run test:phase0` | 15 passed | Source containment, syntax and baseline tooling. |
| `npm run test:hosting` | 5 passed | Local configuration validation and stop-on-failure build gate. |
| `npm run check:functions` | 2 passed | Native imports and denied preview-handler execution. |
| `npm run typecheck:access` | Passed | Strict access module, imported dependencies and synthetic browser fixture. |
| `npm run typecheck:accounts` | Passed | Strict account feature and its explicit integration list. |
| `npm run lint:access` | Passed without warnings | New access source and fixture. |
| `npm run lint:phase1` | Passed; one existing Fast Refresh warning | Existing mixed hook/component HMS guard export. |
| `npm run lint:phase0` | Passed | Targeted source checks. |
| Production compilation | Passed, 6,546 modules, 16.21 seconds | Synthetic public configuration; output in existing handover project. Existing >500kB chunk warning remains. This was not the complete gated release command. |
| Progress ledger generation/check | Passed | Evidence links resolve; the generated report matches JSON. Does not independently rerun the linked tests. |
| `git diff --check` | Passed | Tracked source patch whitespace. |
| Browser review | Desktop and 390px width reviewed | Synthetic patient/doctor workspace menus, multi-role switch, feature preview, pasted doctor URL denied for patient, error/retry, heading focus and mobile overflow. |
| Scoped automated accessibility checks | No violations reported on inspected states | WCAG A/AA tags; workspace color-contrast checks include an incomplete/manual-review result. Error-state run had no incomplete results. This is not accessibility certification. |

Full application typechecking, full lint debt, dependency advisory repairs, complete legacy entrypoint mapping, effective role/custom-membership reconciliation, trusted operation adapters and hosted API/database/storage acceptance remain open. Earlier bounded full typechecks did not produce a verdict; they have not been relabelled as passing. The fresh advisory audit still contains 57 affected package entries; no dependency version was changed in this UI increment.

Screenshots are stored together in the existing handover project's `outputs/phase0-1-2026-11-03/` as `patient-workspace-desktop.jpg` and `patient-workspace-mobile.jpg`. These show a clearly labelled synthetic review, not a live deployed portal.

Checklist snapshot: Phase 0 **6/8 local criteria**, **0/6 hosted criteria**; Phase 1 **9/11 local criteria**, **0/7 hosted criteria**. Counts refer only to [the defined criteria](phase-progress.md), not phase effort percentages. Neither phase exit is accepted. The next local RBAC step is the complete legacy entrypoint inventory and matching operation/membership contracts; enabling real services remains gated by their own security evidence.
