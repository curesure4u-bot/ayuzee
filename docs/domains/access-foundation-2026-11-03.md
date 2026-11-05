# Phase 1 increment — role policy and workspace interface

3 November 2026 · existing `curesure4u-bot/ayuzee` checkout · `Sai-Branch`.

Sai authorized continuing local RBAC/UI work while Supabase connection approval is arranged. No hosted configuration, roles, SQL, deployment, push or merge is part of this increment. Existing uncommitted account, directory and hosting work is preserved.

## Phase ownership

This increment belongs to **Phase 1, task 5 (RBAC-01)** and the interface portion of **task 6 (accessibility)**. It also extends the Phase 0 source release gate to check the new module and progress report. It does not start a replacement roadmap or release any later-phase workflow.

Track current checklist counts in [phase progress](../release/phase-progress.md), generated from [the versioned ledger](../release/phase-progress.json). Local source/fixture checks and hosted acceptance are independent. No overall effort percentage is estimated.

## Implemented source behavior

- `src/features/access/roles.ts` enumerates all **17 account/admin roles** observed in the source schema, plus **12 separately scoped hospital role names**. A global `therapist` is not automatically a hospital therapist. A global `provider` is not a hospital `service_provider`.
- `policy.ts` maps all 17 account roles to **24 explicitly named portal areas**. Specialized administrators receive only their delegated area; platform administration does not confer patient records or every specialized administrative function. These are conservative portal/read contracts, not operational write grants.
- The prior account helper's unknown-role → patient fallback is removed. Unknown/missing grants return no role and route to account access. `super_admin` remains explicit rather than silently collapsing to another role.
- Account home lists only actually assigned, recognized workspaces. Requested signup/onboarding roles cannot create a workspace. All-role destinations now lead to `/workspace/<role>`; the original workflow pages remain behind preview containment.
- `Workspace.tsx` uses one policy for navigation, cards, workspace selection and direct feature-route denial. An unauthorized workspace/feature rejects before protected children mount. Unknown/malformed paths fail closed. The active context comes from the URL, so browser back/forward is checked normally rather than restoring an unchecked local-storage role.
- Multi-role accounts switch explicitly between granted workspaces. The screen never merges their navigation. Account/role/revision changes remount the private workspace context and cancel/clear query data. Loading, account errors, unconfirmed email, incomplete onboarding, expired local sessions and absent accounts render no workspace tools.
- Hospital **contract functions only** require actor, organization, branch, explicit module, active status and valid expiry. Clinical/therapy/nursing access additionally requires assignment. Owners/branch admins cannot bypass branch/module/assignment predicates. Existing HMS hooks/guards are not claimed migrated by this contract.

## Interface changes

The shell retains Ayuzee's cream/leaf-green palette, with a simple account header, named role navigation, large controls, visible labels/focus, a skip link and a single-column mobile card layout. Workspace cards and detail screens visibly say Preview and expose no medical, financial or simulated successful service action. Denial screens provide account selection and support links without leaking restricted record details.

The **local-only** review at `npm run preview:access` uses synthetic identities and no hosted Supabase client. Its “Review as” selector is a test harness outside the app build, not a role-granting product control. It can review every account role plus multi-role, loading, error, revoked and signed-out states.

## Verification and limits

Exact commands/results and browser limits: [3 November local validation](../release/local-validation-2026-11-03.md).

The policy and rendered-interface tests cover all named roles, cross-role denial, specialized admin separation, own/assigned resource contracts, hospital scope/expiry/status, unknown grants, protected-child mount prevention, context switching, back navigation, focus, account switching and preview containment. Strict module/account typechecks and targeted lint are separate from the still-unresolved full application typecheck.

Browser review uses the synthetic local fixture at desktop and 390px mobile width. Patient and doctor menus, explicit switching, feature preview details, cross-role direct-link denial and unavailable-account states are checked. This is not a live Auth, RLS, SMTP or real patient-data test. Full automated accessibility certification is not claimed by manual layout review.

## What still prevents RBAC-01 completion

1. Reconcile actual schema, trusted role assignments, custom HMS templates, professional approval/suspension and organization/branch memberships. **4 November update:** plugin access now successfully lists the owning organization, Ayuzee project and public-schema metadata. The earlier connection blocker is resolved; effective role/policy/membership verification remains pending (see the phase ledger).
2. Connect trusted scoped membership adapters. The legacy doctor-field HMS projection lacks the complete organization/membership contract; do not fabricate it or infer access from role labels.
3. Inventory every legacy route/menu/search/notification/action and migrate it to reviewed capabilities. The new boundary covers the new workspace routes; the existing outer preview boundary still contains the older unready routes.
4. Define and enforce feature operations (`create`, `edit`, `delete`, `approve`, `export`, `sign`, `dispense`, `settle`) and target scopes with their owning workflows. Cards do not imply these powers. Platform-scope record reads currently fail closed until their authoritative adapters exist.
5. Enforce and test matching server/API/database/storage rules and role freshness/revocation independently of the browser. The pure TypeScript scope contracts are preparation, not server enforcement. Existing role/account SQL candidates remain unapplied.
6. Verify end-to-end authentication and each released role against isolated hosted staging before deliberately expanding `previewPolicy.ts`. Do not enable accounts/workspaces solely because these local tests pass.

Full legacy portal integration, real hospital portals, custom-role reconciliation and data/API acceptance remain explicitly pending in the phase ledger. **This is a locally implemented foundation, not completed full-system RBAC or a Phase 1 exit.**

## Repeatable local review

```sh
npm run test:access
npm run typecheck:access
npm run lint:access
npm run test:phase1
npm run progress:check
npm run preview:access
```

Open `http://127.0.0.1:4181/workspace/patient` for synthetic UI review. Review the existing phase checks, all unit tests and production compilation as described in the source handover; no successful scoped command substitutes for a passing full release gate.

Rollback is a source revert of this increment together with its related route/destination and gate changes. It does not require hosted data restoration. Preserve prior account/directory work when reviewing or reverting.
