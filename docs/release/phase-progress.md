# Ayuzee phase progress

Updated 2026-11-05 · branch `Sai-Branch`.

Counts are equally counted checklist criteria, not effort estimates or a claim of production readiness. Local source/fixture verification and hosted acceptance are counted separately. A phase closes only when every criterion and its exit condition is verified.

**A phase remains open until its exit checks pass.** Supabase access and the scoped live view repair are verified: 23 advisor ERROR findings are now zero; 19 local PostgreSQL tests, 70 local integration checks (69 HTTP plus FK cleanup) and read-only live permission assertions passed. Existing records/admin assignments were preserved. Additive onboarding backend is now applied and seven local Auth/email/PKCE scenarios pass; hosted delivery remains pending. Staging is local as Sai requested. Publishing controls and SMTP acceptance, broader APIs/storage and complete community workflows still prevent phase closure. Phase 2 community source workflows and a local-only database candidate are now implemented and tested; no community migration or frontend deployment has been applied live. Public Netlify hosting is now confirmed by live response headers; its deployed branch and publishing controls remain unverified. Phase 3.1–3.8 now meet all eight local commerce criteria, including fictional-provider fulfilment/refunds and bounded capacity. Hosted commerce acceptance remains 0/8. No commerce candidate was applied hosted and no real provider action or paid resource was used. Latest source repair: full active-app compilation and clean dependency audit pass; 351 historical modules are retained as 310 explicit previews for Sai’s business review. Hosted acceptance is unchanged.

| Phase | Local checklist complete | Hosted checklist complete | Exit accepted |
| --- | --- | --- | --- |
| 0 — Safe release process | 9/9 | 0/5 | No |
| 1 — Login, accounts and permissions | 11/13 | 2/9 | No |
| 2 — Core community portal | 5/8 | 0/8 | No |
| 3 — Ecommerce | 8/8 | 0/8 | No |
| 4 — Wallets, rewards, memberships and learning | 0/6 | 0/6 | No |

Local counts describe the explicit list below; they are not percentages of the whole codebase or forecasts of engineering time.

Latest increment: [CI repair and explicit feature previews](ci-repair-2026-11-05.md), including the [keep/remove decision list](../review/FEATURES_FOR_DECISION.md). Phase 0 local criteria are 9/9; hosted exit remains open. [Phase 4.1 wallet ledger foundation in progress](../domains/wallet-ledger.md), following the pushed [Phase 3 local closeout, 8/8](../domains/commerce-closeout.md), including [delivery](../domains/commerce-fulfilment.md) and [payment verification/recovery](../domains/commerce-payments.md), extending [checkout](../domains/commerce-checkout.md) and the [catalog](../domains/commerce-catalog.md), following the [community portal](../domains/community-portal.md) and [scoped live access repair](scoped-access-2026-11-04.md). Phase 3 source work was explicitly authorized while earlier hosted acceptance remains open. Source: [machine-readable ledger](phase-progress.json). Original plan: retain the Phase 0–8 sequence; do not replace it with a new roadmap. Local staging replaces hosted staging at Sai’s explicit request; this is a changed constraint, not evidence of hosted validation.

## Phase 0 — Safe release process

### P0.1 — Environment

- [x] **local** · Declared source/deployment configuration inventoried; environment validation rejects unsafe browser keys. [Evidence](../../scripts/netlify-build.test.mjs)
- [ ] **hosted** · Netlify serving ayuzee.com is verified from live HTTP headers on 4 November. Deployed branch/commit and Lovable-to-Netlify publishing workflow still need dashboard verification; Supabase project is verified. [Evidence](../../docs/release/public-site-inspection-2026-11-04.json)

### P0.2 — Isolated staging

- [x] **local** · Separate local account, directory and role-workspace fixtures use synthetic identities/data. [Evidence](../../tests/browser/access/main.tsx)
- [x] **local** · Free isolated loopback-only Supabase stack is running; synthetic scoped-access schema and 70 integration checks (69 HTTP plus relational cleanup) pass. This is targeted staging, not a complete 429-table replay. [Evidence](../../docs/release/scoped-access-local-result.json)

### P0.3 — Truthful checks

- [x] **local** · Application/config checks are explicit; scoped checks do not replace the full application job. [Evidence](../../.github/workflows/phase0-checks.yml)
- [x] **local** · Full active application typecheck passes. Unreleased implementations are retained as user-approved explicit previews with integrity checks; live schema provenance is unchanged. [Evidence](../../docs/release/ci-repair-2026-11-05.json)

### P0.4 — Database source of truth

- [x] **local** · Migration/manual-SQL conflicts are recorded and a catalog inspection query is prepared. [Evidence](../../supabase/inspection/phase0-2-catalog.sql)
- [ ] **hosted** · Compare effective schema and migration history; prove reproducible isolated replay.

### P0.5 — Preview containment

- [x] **local** · Functional routes stay behind the preview boundary; designated privileged handlers deny execution in source tests. [Evidence](../../scripts/phase0-functions.test.mjs)
- [ ] **hosted** · Verify actual hosted APIs/functions/policies cannot mutate unready financial or clinical state.

### P0.6 — Deployment checks and monitoring

- [x] **local** · Source build gate stops at failed checks; role policy checks and ledger consistency are included. [Evidence](../../scripts/netlify-build.mjs)
- [x] **local** · Reviewed toolchain and validation upgrades, scoped transitive overrides and a clean lockfile install pass. Existing npm audit --audit-level=high reports zero total vulnerabilities. [Evidence](../../docs/release/ci-repair-2026-11-05.json)
- [ ] **hosted** · Verify Netlify/Lovable publishing controls, actual CI gating and protected release flow. Netlify serving the public domain is now confirmed; dashboard settings and deployed commit remain unavailable.
- [ ] **hosted** · Verify actual error delivery, privacy configuration and operational ownership.

## Phase 1 — Login, accounts and permissions

### P1.1 — Secure account permissions

- [x] **local** · Original account/role candidates have isolated PostgreSQL tests. The role boundary is now included in the applied scoped repair; onboarding/public-profile candidates remain separate. [Evidence](../../scripts/account-permissions.test.mjs)
- [ ] **hosted** · Reconcile actual schema/RPCs and verify direct account/profile/doctor API denial in staging.
- [x] **hosted** · Applied scoped repair to 21 views, 17 supporting-table policy fences, six authority guards and role writes; live advisor ERRORs 23→0 and read-only acceptance passed. Other APIs/storage remain open. [Evidence](../../docs/release/scoped-access-2026-11-04.md)
- [x] **hosted** · Applied additive onboarding RPC/table and patient-only Auth bootstrap; read-only live ACL/unknown-identity assertions pass. Existing 36 role rows and 15 profiles remain; no existing account auto-completed. [Evidence](../../docs/release/onboarding-integration-2026-11-04.md)

### P1.2 — Signup and verification

- [x] **local** · Signup, email return and resumable onboarding are tested locally; requested role never grants access. [Evidence](../../src/features/accounts/AccountUI.test.tsx)
- [ ] **hosted** · Live dashboard verified custom SMTP and email confirmation are disabled. Site URL/redirect origin match ayuzee.com. Existing company SMTP sender plus coordinated real confirmation/recovery delivery are required; local Mailpit passes do not close this check. [Evidence](../../docs/release/auth-dashboard-2026-11-04.json)
- [x] **local** · Seven real local Auth/Mailpit/PKCE/API scenarios pass: signup confirmation, persisted onboarding, own data/role denial, refresh/logout, password recovery and used-link rejection. Hosted SMTP/delivery remains unverified. [Evidence](../../docs/release/onboarding-local-result.json)

### P1.3 — Login and sessions

- [x] **local** · Single account observer rejects stale identity/role results and clears private query state. [Evidence](../../src/features/accounts/sessionStore.test.ts)
- [ ] **hosted** · Verify real login, refresh, logout and role removal with actual Auth/database policies.

### P1.4 — Password recovery

- [x] **local** · Expired/invalid links, recovery transport, identity changes and sign-out failure paths have local tests. [Evidence](../../src/features/accounts/actions.test.ts)
- [ ] **hosted** · Prove real delivered recovery email through reset and successful re-entry.

### P1.5 — All-role RBAC and workspaces

- [x] **local** · All 17 source account/admin roles have explicit portal/read mappings; unknown roles fail closed. [Evidence](../../src/features/access/policy.test.ts)
- [x] **local** · Role-specific navigation/cards, account destinations and explicit multi-role switching are implemented and tested. [Evidence](../../src/features/access/Workspace.test.tsx)
- [x] **local** · New workspace direct routes reject cross-role/unknown access before protected children mount and clear scoped queries on context changes. [Evidence](../../src/features/access/Workspace.test.tsx)
- [x] **local** · All 12 source hospital role contracts require actor/org/branch/module/status/expiry; clinical contracts also require assignment. No membership API is connected. [Evidence](../../src/features/access/policy.test.ts)
- [ ] **local** · Inventory and connect all legacy menus/routes/search/notifications/action entrypoints to reviewed capability policies; current preview containment remains.
- [ ] **local** · Implement authoritative scoped membership adapters and reviewed write/approve/export/sign/dispense/settle contracts. Current portals display read previews only.
- [ ] **hosted** · Reconcile deployed roles, custom templates, assignments, professional approval/suspension and membership scope. MCP project/schema access is now verified; the policy/membership audit remains to be completed. [Evidence](../../docs/release/supabase-access-2026-11-04.json)
- [ ] **hosted** · Prove backend/database/storage isolation and freshness/revocation independently of UI for every released role/scope/operation.
- [x] **local** · Shared app navigation and opt-in app footer use the role/workspace policy across all 17 roles. Multiple grants require workspace selection; account/error/loading states hide private tools; public previews still make no account calls. [Evidence](../../src/features/access/PortalNav.test.tsx)

### P1.6 — Abuse controls and accessibility

- [x] **local** · Account/portal render tests cover readable states, focus and keyboard controls; desktop/mobile workspace browser review recorded in local handover. [Evidence](../../docs/domains/access-foundation-2026-11-03.md)
- [ ] **hosted** · Read-only dashboard: new signups allowed, anonymous sign-ins off, email confirmation off. Verify enforced throttling and complete production Auth journeys after SMTP is arranged. [Evidence](../../docs/release/auth-dashboard-2026-11-04.json)

## Phase 2 — Core community portal

### P2.1 — Profiles and professional verification

- [ ] **local** · Finish profile editing, credential-review UI and explicit public-field projection.
- [ ] **hosted** · Verify professional approval/suspension, public opt-in and private-field isolation end to end.

### P2.2 — Doctor discovery

- [x] **local** · Bounded URL-driven directory search/filter/sort/pagination, runtime projection validation and accessible state tests are implemented; candidate view is absent live and the route remains a preview. [Evidence](../../src/features/professionals/directory.test.ts)
- [ ] **hosted** · Create and verify the approved-only, opt-in public directory contract and real search/pagination/empty/error journeys.

### P2.3 — Posts and audience controls

- [x] **local** · Modular post composer and owned edit/delete flows, workspace-specific audiences, bounded URL search/type/sort/pagination, validation and failed-draft retention are locally tested. The shared candidate API is PostgreSQL-tested; hosted migration and route release remain pending. [Evidence](../../src/features/community/community.test.tsx)
- [ ] **hosted** · Prove ownership, doctor-only and public audience rules through direct APIs.

### P2.4 — Comments and likes

- [x] **local** · Comment creation/own deletion and idempotent likes refresh persisted state; UI failure handling and PostgreSQL ownership, parent-audience fences, counters and transaction rollback pass locally. [Evidence](../../scripts/community-permissions.test.mjs)
- [ ] **hosted** · Prove duplicate-action prevention and unauthorized comment/like mutation denial.

### P2.5 — Polls and moderation

- [x] **local** · Poll votes persist one choice per account with expiry/choice validation. Reports deduplicate and authorized hide/dismiss decisions require a reason and persist an immutable moderation record in the local PostgreSQL candidate. [Evidence](../../scripts/community-permissions.test.mjs)
- [ ] **hosted** · Verify one vote per account, report ownership and moderator permissions.

### P2.6 — Notifications

- [x] **local** · Removed fabricated global alerts. Community notifications use recipient-scoped records, durable read/dismiss actions and UUID-derived internal links; local tests prove immutable payloads, trusted delivery ACLs and transaction rollback. No hosted delivery is claimed. [Evidence](../../src/features/community/notifications.test.tsx)
- [ ] **hosted** · Verify recipient isolation, delivery persistence and authenticated provider boundaries without paid integrations.

### P2.7 — Mobile, accessibility and search visibility

- [ ] **local** · Responsive feed/editor and desktop/mobile role views reviewed; the 390px patient feed passes 26 axe checks with zero violations/incomplete checks and no horizontal overflow. Complete remaining metadata/crawler and loading measurements before closing this criterion. [Evidence](../../docs/domains/community-portal.md)
- [ ] **hosted** · Verify the actual released community pages and metadata after an explicitly authorized deployment.

### P2.8 — Community capacity checkpoint

- [ ] **local** · Define a representative synthetic 1,000-user community workload and pass free local acceptance; do not infer live capacity from it.
- [ ] **hosted** · Agree and verify the deployed capacity claim within existing free limits and explicit load-test authorization.

## Phase 3 — Ecommerce

### P3.1 — Catalog and product management

- [x] **local** · Approved-only public projection, URL search/category/system/stock filters, sort/pagination and detail states; canonical manufacturer submissions and reviewer approval/rejection/withdrawal, owned editing and feedback are locally tested. [Evidence](../../docs/domains/commerce-catalog.md)
- [ ] **hosted** · Reconcile all deployed grants and alternate RPC consumers, run native local REST/Auth tests, then separately deploy and verify catalog ownership/publication with real roles.

### P3.2 — Cart and authoritative pricing

- [x] **local** · Server-only integer-paise pricing, strict ID/quantity cart, configurable tax-inclusive delivery/coupon rules and expiring quotes; responsive UI validates totals, invalidates changed input and fails closed when rules/storage are missing. Local PostgreSQL/native/browser verification passes; production business rules remain unapproved. [Evidence](../../docs/domains/commerce-checkout.md)
- [ ] **hosted** · Verify real pricing rules and tampered browser requests against the released API; no paid resources or real charge is authorized.

### P3.3 — Order creation and stock reservation

- [x] **local** · Owned pending unpaid orders, persisted request-key recovery/history, exact retries, atomic stock/coupon holds, logical expiry, trusted cleanup and unpaid release pass local tests. Real concurrent REST requests for the last item yield exactly one reservation; coupon expiry and role revocation during lock waits are denied. [Evidence](../../docs/release/checkout-local-result.json)
- [ ] **hosted** · Verify native/hosted transaction retries and competing requests for the last item; read/write fences alone do not implement checkout.

### P3.4 — Payment verification

- [x] **local** · Test-only payment attempt binds real customer/order, stored provider order ID, receipt, INR amount and verified capture; exact retries, cross-purchase replay denial and atomic stock commit pass isolated and native local tests. No live provider call or hosted release is claimed. [Evidence](../../docs/domains/commerce-payments.md)
- [ ] **hosted** · Verify the existing provider test-mode integration and trusted boundary without making real charges.

### P3.5 — Payment recovery and reconciliation

- [x] **local** · Signed raw-body event inbox, duplicate/body-conflict handling, leased retries/dead letters, closed-browser reconciliation and lost-create recovery without duplicate POST are locally verified. Minimal payment identity survives Auth deletion; late/additional captures enter review without false fulfilment. Owned read-only status UI passes local checks. [Evidence](../../docs/release/payments-local-result.json)
- [ ] **hosted** · Verify delayed/repeated provider test events, failed payments and reconciliation; do not invoke paid provider operations.

### P3.6 — Fulfilment and delivery

- [x] **local** · Private persisted packing/booking/tracking, explicit order operations roles, one claim, uncertain-create recovery, event deduplication and owned delivery UI pass 74 source cases and 10 native local scenarios. Legacy courier source entrypoints fail closed; no live provider call or deployment. [Evidence](../../docs/domains/commerce-fulfilment.md)
- [ ] **hosted** · Verify authorized courier test-mode outcomes, failure and retry, within existing no-cost access.

### P3.7 — Cancellation and refunds

- [x] **local** · Owned pre-booking cancellation, stock restoration once, bound integer-paise partial/full refunds, durable retry keys and original-reference recovery pass 81 source cases and nine native Auth/REST scenarios, including actual concurrent balance/permission races. No real refund or provider request. [Evidence](../../docs/domains/commerce-closeout.md)
- [ ] **hosted** · Verify provider test-mode refund reconciliation; no real refund or financial transaction is authorized.

### P3.8 — Commerce capacity checkpoint

- [x] **local** · Bounded native local workload passes five scenarios: 550 catalog products, 240 anonymous filtered requests at concurrency 8, 24 independent reservations, 20 final-item contenders, 16 same-key retries and 40 ownership denials. Measured latency is workstation-only, not a production SLA. [Evidence](../../docs/release/commerce-capacity-result.json)
- [ ] **hosted** · Agree and verify the deployed capacity claim within existing free limits and explicit load-test authorization.

## Phase 4 — Wallets, rewards, memberships and learning

### P4.1 — Wallet ledger and balances

- [ ] **local** · Traceable private ledger foundation passes 20 isolated and six native local checks. Shared-session wallet UI, legacy writer reconciliation/containment and final source integration remain pending. [Evidence](../../docs/domains/wallet-ledger.md)
- [ ] **hosted** · Reconcile the effective live schema and verified provider/entitlement boundaries, then obtain separately authorized hosted acceptance without paid resources or real financial operations.

### P4.2 — Rewards and redemptions

- [ ] **local** · Derive eligibility, amounts, stock and entitlements on the server; verify duplicate-credit and concurrent-spend denial.
- [ ] **hosted** · Reconcile the effective live schema and verified provider/entitlement boundaries, then obtain separately authorized hosted acceptance without paid resources or real financial operations.

### P4.3 — Payout processing and recovery

- [ ] **local** · Prepare durable claims, provider-bound outcomes and uncertain/partial-failure recovery with fictional adapters; no real payout.
- [ ] **hosted** · Reconcile the effective live schema and verified provider/entitlement boundaries, then obtain separately authorized hosted acceptance without paid resources or real financial operations.

### P4.4 — Memberships and digital purchases

- [ ] **local** · Bind activation to verified purchase, enforce expiry and authorize digital downloads; no browser-authored activation.
- [ ] **hosted** · Reconcile the effective live schema and verified provider/entitlement boundaries, then obtain separately authorized hosted acceptance without paid resources or real financial operations.

### P4.5 — Quiz scoring and progression

- [ ] **local** · Keep answer validation and reward issuance server-side; test daily selection and consecutive-day streaks.
- [ ] **hosted** · Reconcile the effective live schema and verified provider/entitlement boundaries, then obtain separately authorized hosted acceptance without paid resources or real financial operations.

### P4.6 — Course and content workflows

- [ ] **local** · Verify persistence, role/ownership access and safe rendering for the released learning workflows.
- [ ] **hosted** · Reconcile the effective live schema and verified provider/entitlement boundaries, then obtain separately authorized hosted acceptance without paid resources or real financial operations.

## Later phases

- **Phase 5 — Bookings and consultations:** Pending; no booking action enabled by workspace cards.
- **Phase 6 — Hospital operations:** Pending; Phase 1 defines scoped role vocabulary, while actual operational adapters and hospital workflow acceptance belong here.
- **Phase 7 — Tools and integrations:** Pending; each tool requires its own capability and direct API tests.
- **Phase 8 — Combined acceptance and capacity:** Pending; whole-system role and capacity acceptance is not inferred from local tests.

Regenerate with `npm run progress`; CI checks consistency with `npm run progress:check`. Update criterion status only after its stated evidence is obtained. No commit, push, deployment or hosted database change is implied by this ledger.
