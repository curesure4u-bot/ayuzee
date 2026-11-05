# Phase 3 local closeout — 5 November 2026

**Local checklist: 8/8. Hosted checklist: 0/8. Phase exit remains open.**
This is completion of the authorized local scope, not production readiness.
The [phase ledger](../release/phase-progress.md) retains every hosted exit check.
No provider request, payment, refund, courier booking, paid resource, hosted
commerce migration, frontend deployment, commit or push was performed.

## Completed local increments

| Increment | Result | Evidence |
| --- | --- | --- |
| 3.1 Catalog | Approved public projection; manufacturer ownership; reviewer decisions | [Catalog](commerce-catalog.md) |
| 3.2 Pricing | Integer-paise server pricing; checked rules/quotes; safe cart UI | [Checkout](commerce-checkout.md) |
| 3.3 Orders | Owned unpaid reservations, stock holds, idempotent recovery | [Native checkout](../release/checkout-local-result.json) |
| 3.4 Payments | Bound capture evidence; atomic paid/stock commit | [Payments](commerce-payments.md) |
| 3.5 Recovery | Signed inbox, retries/dead letters, browser-independent reconciliation | [Native payments](../release/payments-local-result.json) |
| 3.6 Delivery | Staff packing, one booking claim, persisted customer tracking | [Fulfilment](commerce-fulfilment.md) |
| 3.7 Resolution | Scoped cancellation; bounded partial/full refunds; uncertain-result recovery | Refund design and tests below |
| 3.8 Capacity | Bounded local catalog/checkout/contention benchmark | [Measured result](../release/commerce-capacity-result.json) |

## Cancellation and refunds: proposed local business rules

The private `phase3-refunds.sql` candidate provides cancellation/refund/audit
records, a disabled fixture-only policy, caller-scoped `commerce_resolution` and
service-only `commerce_refund_worker`. Browser writes to underlying tables and
worker calls are denied. The private security-definer routines use fixed empty
search paths and explicit current identity, session and workspace checks; public
wrappers remain invoker. See [Supabase function security](https://supabase.com/docs/guides/database/functions).

Customers cancel only their own pre-booking purchase; assigned order operators
can act on reviewed purchases. Packing/packed can cancel, but queued creation,
unknown booking, booked, transit, delivered and returning parcels require
fulfilment review. Cancelling an unpaid order releases its hold. Cancelling a
paid pre-booking order restores committed stock once, using the cancellation
record as the unique transaction guard. Neither operation changes captured funds
to refunded. Later capture of a cancelled reservation remains a payment review
case in the existing settlement contract.

Refund preparation is limited to `orders_admin`, `admin` and `super_admin`.
Confirmed captures require cancellation or completed delivery/return before a
refund request. Additional/late captures needing review can be resolved
independently. The payment attempt, capture receipt, payment ID and amount are
bound together by the server. Amounts are positive integer paise. Partial refunds
reserve their balance immediately; requested, creating, uncertain, pending and
processed amounts count against the capture. Only provider-confirmed failure
releases that reservation. Aggregate refunds cannot exceed the capture, even
under simultaneous requests.

The UI persists the exact reviewed payload and request UUID before sending. A
lost response resumes that same payload after remount. Changed retries are
rejected. Unavailable persistence disables submission. Accounts/workspaces have
separate saved requests, scoped caches and guarded routes. The customer page
shows captured amounts, confirmed refunds, amounts reserved and recent requests;
it exposes no operational approval controls, address, claim token, private
reason or session identity.

The provider-neutral worker has no network transport. It accepts only an
explicitly enabled fictional adapter. One claim is active per captured payment,
including unknown/pending outcomes. The provider's capture/order/amount/currency
and already-refunded balance are checked before creation. One immutable request
UUID binds the provider refund. Lost outcomes reconcile by that original
reference; zero or ambiguous matches remain uncertain, without another create
call. Pending/processed/failed evidence must match the original capture and
request; terminal conflicts require review. Bounded oldest-first batches rotate
checked times, with safe retry outcomes. There is no scheduled worker or hosted
webhook in this increment.

Only fully processed refunds of the confirmed capture set canonical payment
status to refunded. Partial refunds retain paid with explicit refund totals.
Refunds do not restock delivered/returned goods. Physical return inspection and
inventory disposition require a separately reviewed workflow. Minimal financial
references survive operational-order/account deletion so an in-flight accepted
refund can still reconcile. Retention duration/purge policy must be approved
before real use. Native tests clean only their own synthetic financial fixtures.

The legacy `razorpay-refund` source handler is now preview-contained; its
implementation is archived for review/rollback. This handler also served older
non-commerce paths, which are already behind functional previews. Existing live
handlers, including booking/therapy payment paths, were not deployed or repaired
by the new local candidates. Their audit/preflight obligations remain open.

## Verification

- **461 unit/contract/UI/route tests across 32 files pass.** New 3.7 coverage:
  26 PostgreSQL/service cases, 12 UI/intent/protocol cases, 43 all-role route cases.
- **40 standalone catalog/checkout PostgreSQL tests** and the seven-handler
  preview-containment check pass (41 Node assertions total).
- **Nine native local refund scenarios** pass using real Auth, PostgREST and
  PostgreSQL with an in-process fictional provider. They cover eight concurrent
  cancellations/restock-once, concurrent partial limits, six same-key retries,
  simultaneous worker claims, partial delivered-order handling, lost-response
  recovery, ownership/worker denial, genuine lock-wait revocation and revoked
  session/same-request reauthorization. [Native evidence](../release/refunds-local-result.json).
  Native delegated role verification remains limited to the available local
  `admin` enum; all canonical role mappings are separately fixture-tested.
- Strict commerce, payment, fulfilment and refund TypeScript and scoped lint pass.
  Vite production build passes with the existing large-chunk warning. Full-app
  schema/type debt and the earlier 56 dependency findings remain open; no broad
  application/production-security pass is claimed.
- Desktop 1280px and phone 390px refund operations: 27 axe passes. Phone customer
  view: 25. Zero violations/incomplete. Content width remains 390px. A fictional
  ₹100 request was observed requested, pending and processed against a ₹249
  capture; customer controls exclude approval. [Browser evidence](../release/refunds-browser-result.json).

## Capacity interpretation

The repeatable `npm run test:commerce:capacity` checkpoint uses the existing
loopback stack, 500 approved/50 unpublished products and at most 20 concurrent
requests. Budgets were set before the run: catalog p95 under 1000ms, independent
checkout p95 under 2000ms, no unintended data exposure, one final-item hold and
one order for repeated keys. Current measured p95: catalog 10ms (240 requests,
concurrency 8), checkout 12ms (24 reservations, concurrency 8). Twenty final-item
contenders produced one hold and 19 expected stock conflicts. Sixteen retries
returned one order; 40 foreign-account lookups all denied data. All five scenarios
passed. Test seeds/identity setup are outside measured request windows.

These short workstation measurements are a regression checkpoint. They establish
no sustained RPS, user-count, hosted-tier, cold-start, production latency or
end-to-end provider capacity claim. Representative business traffic and an
explicitly authorized deployed load test remain open.

## Cleanup and commit handoff

Fourteen obsolete reports, old credential/provisioning artifacts, debug images
and duplicate disabled implementation copies were hash-verified into
`/Users/sai/Codex/Ayuzee-Project-Handover/archive/phase3-cleanup-2026-11-05/`
and removed from the checkout. [Cleanup manifest](../release/cleanup-result.json).
Generated build output is removed after verification. Current source, tests,
canonical evidence, migrations, optional application modules and unrelated
uncommitted work are preserved. Removing a credential document does not erase
prior Git history or prove credential rotation.

The existing `Sai-Branch` still contains earlier Phase 0–2 work and generated
live-schema updates. The commit handoff inventories that complete working tree;
it does not silently stage only the newest commerce files. `main` is untouched.
The working tree is prepared for review, not committed/pushed. The Netlify/Lovable
branch publishing controls remain unverified: a non-main branch push must not be
assumed deployment-free. [Commit handoff](../release/commit-readiness.md).

## Still required for hosted phase closure

Review business rules, supported source/live roles, all legacy grants/RPCs and
order triggers/referral/commission effects. Reconcile schema/migration history
and prove a clean replay plus rollback. Configure existing provider test accounts
and verified capture/refund/courier transports, authenticated entrypoints,
webhook/scheduler/retry monitoring, uncertain/dead-letter/orphan-case operations,
retention, browser integration and actual business acceptance. Separately
authorize any no-cost hosted migration/release/test traffic; never enable paid
resources or real financial/courier operations from this checkpoint.

Phases 0–2 remain open for their documented local debt and hosted gates, including
hosting controls and SMTP. No Phase 4 work starts from this closeout automatically.
