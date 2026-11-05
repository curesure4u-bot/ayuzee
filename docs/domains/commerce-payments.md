# Phase 3.4–3.5 — payment verification and recovery

Historical increment. For the latest 8/8 local checkpoint, read
[commerce closeout](commerce-closeout.md); hosted acceptance remains open.

4 November 2026 · `Sai-Branch` · **local test-mode acceptance only**.
Extends [checkout and stock reservations](commerce-checkout.md). Current Phase 3
progress is **5/8 local, 0/8 hosted**; earlier phase exit gates remain open.
No provider API request, charge, capture, refund, hosted migration, frontend
publishing or paid resource was used. Public documentation was read; all provider
responses in execution tests were fictional.

## Behavior and boundaries

A payment attempt belongs to one internal order and its real customer. Amount and
currency come from the saved server-priced reservation. A valid checkout signature
alone cannot mark another purchase paid. The worker independently reads the
provider order and payment, verifies their relationship, receipt, amount, currency
and captured state, then commits the payment/stock transaction once.

The customer sees three distinct outcomes: pending verification, verified payment,
or captured funds requiring review. A callback, an authorized payment or closing
the payment window does not manufacture payment success. Read-only status checking
is prepared in the reservation UI. Payment initiation buttons remain disabled.
The production preview boundary is unchanged.

This is ecommerce only. The legacy `razorpay-create-order`,
`razorpay-verify-payment` and refund handlers also serve bookings/therapy and were
not deployed or replaced by this candidate. Their earlier audit findings remain
open for those paths and for the current live backend. Do not infer a live repair
from the new local candidate. No optional integration was approved for removal.

## Structure

| Source | Responsibility |
| --- | --- |
| `supabase/review-candidates/phase3-payments.sql` | Private attempts, receipts, event inbox, audit and disabled policy; owned customer RPC; service-only worker RPC |
| `payment-service/contracts.ts` | Explicit canonical attempt/provider fields and strict callback request |
| `payment-service/service.ts` | Signature validation, bound capture verification, uncertain-create recovery, inbox processing and reconciliation |
| `payment-service/provider.ts` | Bounded test-key-only Razorpay transport; no capture/refund endpoint and no automatic POST retry |
| `payment-service/authenticator.ts` | Real Supabase bearer verification and caller-JWT-scoped customer RPC client; service keys are rejected as public-client keys |
| `payment-service/repository.ts` | Separate caller/worker RPC adapters with safe failure messages |
| `payment-service/http.ts` | Disabled-by-default request handler; method/origin/body limits, real auth dependency, strict fields and safe public responses |
| `src/features/commerce/paymentStatus.ts` | Runtime-checked public status and exact order identity validation |
| `PaymentStatusPanel.tsx` / `paymentStatusService.ts` | Account-scoped, read-only status with safe loading/error/retry states; no payment action |

The server modules are review candidates, with **no deployed Deno entrypoint**.
Service, HTTP handler, provider network access and database initiation each fail
closed unless explicitly enabled. Only `rzp_test_` integration keys are accepted.
There is no live-key activation path in this increment and no key was requested.

## Payment and stock transaction

1. The confirmed, current Auth session and granted workspace prepare an owned
   unpaid/pending order with a live stock hold. Browser-authored amounts, owners
   and paid/fulfilment states are rejected.
2. One attempt per internal order stores the exact integer-paise total, INR,
   workspace, session identity and integration context. Queued retries can refresh
   their verified session context. A worker rechecks the live session/grant before
   claiming initiation.
3. A durable claim allows a single provider create call. The attempt UUID is the
   provider receipt. A lost response leaves an uncertain attempt; it does not
   automatically repeat POST. Existing ready/verified attempts return their state.
4. A worker binds a provider order only when its amount, currency and receipt
   match the original attempt. Provider order IDs are unique across attempts.
5. Callback verification uses the **stored** provider order ID in HMAC-SHA256,
   constant-time comparison and independent provider payment/order reads. Provider
   payment ID, order ID, receipt, total, currency, captured flag and refunded amount
   are checked again before settlement.
6. Database locks use order → attempt → hold → products in stable UUID order.
   Receipt insertion, stock decrement, committed hold, paid/confirmed order and
   audit commit together. Duplicate callbacks/events cannot deduct stock twice.
7. Expired/released holds, unavailable products, a deleted order/account or an
   additional capture produce a recorded review case. They do not consume stock
   or falsely confirm a new fulfilment. Late captures are visible as captured funds
   needing review, even when the operational order remains unpaid/unconfirmed.
   Resolution/refunds belong to Phase 3.7; none are invented here.

The old live `orders` triggers, referral/commission effects and alternate writers
are not reproduced by the metadata-only fixture. Hosted preflight must reconcile
those effects before any release. No live payment finding is closed by these tests.

## Recovery without a browser

The signed webhook body is validated as raw bytes before JSON parsing. The
configured merchant account and integration must match. A bounded, private inbox
stores only normalized event/payment/order identifiers, event type and body hash;
addresses, contact details, card data, raw bodies and signatures are not stored.
Duplicate event IDs acknowledge an identical accepted body; a changed body with
the same event ID is rejected. Successful acknowledgement requires durable receipt.

Workers claim at most 20 events with leases and SKIP LOCKED. Expired leases can be
reclaimed; stale lease tokens cannot finish a new claim. Retryable failures and
unbound early events remain durable. After eight attempts, failures or a crash on
the final lease become visible dead-letter records. A delayed failure event cannot
regress a verified capture because workers read current provider state.

Bounded reconciliation checks saved attempts without a browser callback. An
uncertain create can be recovered by the exact receipt; zero/ambiguous/incomplete
results remain uncertain for review, with no automatic replacement create. Ready
attempts are checked for captured payments. Checked timestamps rotate the oldest
20-item batches so unpaid entries do not permanently starve later captures.
There is **no scheduler or hosted webhook configuration** in this increment; the
workers are invoked explicitly in tests. Monitoring, scheduling and dead-letter
operations are release requirements.

Financial references deliberately survive account/order deletion: the private
attempt retains the transaction UUID while its account FK becomes NULL. This
allows an in-flight capture to be reconciled to review after Auth deletion.
Receipts/audit contain minimal transaction data; the owned public API remains
inaccessible to the deleted account. Retention duration and authorized purge policy
must be agreed before real payments. Tests explicitly delete their disposable
financial fixtures; normal account deletion does not erase them.

## Evidence

- **306 automated unit/contract tests across 26 files**, including 22 new payment
  service/SQL/provider contract scenarios and seven status UI scenarios. The
  existing catalog/checkout Node database suites also pass **40 tests**.
- Payment cases cover cross-order/customer replay, amount/currency mismatch,
  authorization without capture, duplicate capture, atomic audit rollback, late
  capture, uncertain provider creation, raw-signature tampering, secret rotation,
  duplicate/event-ID collision, PII-free inbox data, out-of-order events,
  browser-independent reconciliation, bounded-batch rotation, retry exhaustion,
  account deletion, worker ACLs, HTTP guards/projection and live-key rejection.
- **10 native local Auth/PostgREST/PostgreSQL scenarios** pass. They include real
  bearer verification through the HTTP handler, concurrent initiation/callbacks,
  concurrent inbox insertion, direct paid-state forgery denial, revoked sessions,
  lost-create recovery, late capture and actual local Auth account deletion.
  Provider API requests: **zero**. Both policies are disabled after cleanup.
  See [native result](../release/payments-local-result.json).
- Strict commerce/payment TypeScript, focused lint and Vite production build pass.
  Existing large-chunk warning and inherited full-app schema/dependency debt remain
  open. The first unrestricted full-suite run had a worker-reporting timeout despite
  all assertions passing; the clean accepted run uses `--maxWorkers=4`.
- Desktop/mobile fictional pending, verified and review-required states were read.
  At 390px, content width is 390px; axe reports **21 passes, zero violations and
  zero incomplete**. [Browser evidence](../release/payments-browser-result.json).
  Temporary preview and tab were closed; viewport override was reset.

Native staging installation checks the existing checkout fingerprint and a separate
payment candidate fingerprint. The retention adjustment was a verified, empty-
fixture FK update with unchanged surrounding source. No reset, old candidate replay
or replay of the three applied hosted access migrations occurred.

## Open acceptance and next work

Next: Phase 3.6 fulfilment/delivery, Phase 3.7 cancellation/refund resolution, then
Phase 3.8 representative capacity. No courier call or financial transaction is
needed for the next isolated local fixtures. Hosted acceptance still needs reviewed
business rules, the correct provider test account/configuration, webhook routing,
worker scheduling/monitoring, all legacy trigger/RPC/grant preflight, rollback and
separately authorized deployment. No production throughput claim is made.

## Primary contract references

- [Razorpay Standard Checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps): server-created orders and signature binding to the stored order ID.
- [Razorpay webhook validation](https://razorpay.com/docs/webhooks/validate-test): raw-body signatures, duplicate event IDs and unordered delivery.
- [Fetch orders](https://razorpay.com/docs/api/orders/fetch-all): receipt filter and bounded pagination; exact receipt matching is additionally enforced here.
- [Fetch payment](https://razorpay.com/docs/api/payments/fetch-with-id): canonical payment/order/amount/capture fields.
- [Supabase function auth headers](https://supabase.com/docs/guides/functions/auth-headers): platform JWT checks and application authorization are separate layers. No hosted auth setting was changed.
