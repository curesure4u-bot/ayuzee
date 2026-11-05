# Phase 3.6 — fulfilment and delivery

Local implementation accepted on 5 November 2026. This extends the catalog,
checkout and payment candidates. It is not a hosted release or a real courier
integration. Phase 3's final local checkpoint is recorded in
[commerce closeout](commerce-closeout.md).

## Responsibilities

- `phase3-fulfilment.sql`: private shipments, packing audit, normalized delivery
  events, disabled courier policy, customer/staff RPC and service-only worker.
- `fulfilment-service/`: a provider-neutral, fixture-only courier contract,
  creation claims, exact-reference recovery and bounded tracking reconciliation.
  There is no network transport, deployed worker, webhook or scheduler.
- `fulfilmentModel/Gateway/Service`, `FulfilmentUI/Routes`: checked projections,
  explicit role selection, staff packing and account-owned tracking. Service
  credentials never enter the browser. Functional routes remain previews.

Customers in all 17 canonical account roles may read their own delivery summary.
Only an explicitly assigned `orders_admin`, `admin` or `super_admin` workspace can
operate orders or reveal their delivery address. Private tables and worker RPCs
reject browser access. Session/grant checks run again after database lock waits;
workers recheck the staff session that authorized a request.

## State and failure behavior

A financially eligible, committed-stock purchase enters packing, then packed
following measured whole-number parcel dimensions and a private packing note.
Missing configuration blocks booking. A saved request enters queued; a single
worker claim moves to creating. A lost response stays uncertain until the original
reference is found unambiguously. Reauthorization is allowed only for the same
unclaimed queued request. There is no automatic second booking POST.

A booking/waybill is not evidence of pickup. The order remains processing until
bound courier observations report transit. Exact shipment/booking/tracking
bindings, unique event IDs and body hashes reject substitution and changed
replays. Duplicate/stale events do not overwrite newer evidence. Delivered and
returned states cannot regress. Delivery exceptions can recover; return-to-sender
cannot jump back to delivery. Failed tracking preserves the previous scan and
shows the failed check. No delivery estimate, refund or restock is invented.

Minimal booking identity survives deletion of an operational order. Physical
observations after deletion, address changes or financial inconsistencies are
retained as review cases, without declaring operational success. Authorized
orphan-case triage and retention/purge policy remain release requirements.

The local `create-delhivery-shipment` and `delhivery-track` entrypoints now return
preview-unavailable before reading credentials. Their earlier implementations
could fabricate tracking/booking results. Originals are preserved in the cleanup
handover archive; the live deployed handlers were not changed.

## Evidence and limits

- 74 fulfilment unit/contract/role/UI cases: 18 service/SQL, 13 UI, 43 route cases.
- [10 native Auth/PostgREST/Postgres scenarios](../release/fulfilment-local-result.json)
  verify concurrent starts/claims, duplicate tracking, uncertain creation,
  ownership/worker ACLs, failed tracking, terminal delivery, actual lock-wait
  revocation and session reauthorization. The existing local enum supports
  `admin`; delegated `orders_admin` is covered in isolated fixtures, not native or
  hosted role verification. No enum or live account was promoted.
- Desktop and 390px buyer/staff screens were inspected. Phone content width is
  390px. Axe: buyer 26 passes, staff detail 23; zero violations/incomplete.
  [Browser evidence](../release/fulfilment-browser-result.json).
- Strict commerce/fulfilment types, lint and production build pass. The final
  whole unit suite has 461 tests in 32 files; this does not replace the unresolved
  full-application type/schema gate or certify hosted throughput/security.

Native installation is fingerprinted against the payment candidate. Do not replay
DDL, reset staging or edit already installed/applied sources. Synthetic records
are cleaned and checkout/payment/fulfilment policies are disabled after tests.
Hosted role-metadata verification remains pending: automatic approval review
rejected that lookup under the local-only restriction. It was not retried.
