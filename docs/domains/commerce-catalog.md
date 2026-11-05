# Phase 3.1 — catalog and product approval

4 November 2026 · `Sai-Branch` · local source/candidate acceptance only.

This is the Phase 3.1 checkpoint. The later
[Phase 3.2–3.3 checkout increment](commerce-checkout.md) supersedes its next-step
and progress statements; current Phase 3 progress is 3/8 local, 0/8 hosted.
Sai authorized Phase 3 because Phase 0 still needs publishing dashboard access.
Earlier phases stay open. No hosting move, frontend deployment, hosted commerce
migration, purchase, payment/refund, provider email or courier call was performed.

## Hosting finding

The public `https://ayuzee.com/` HTTP/1.1 HEAD response on 4 November returned
200 OK, `Server: Netlify`, and `Cache-Status: "Netlify Edge"`. Netlify serving the
frontend is confirmed. Lovable may be an editor/publishing tool; that workflow,
the deployed branch/commit, dashboard configuration and release controls remain
unverified. See `docs/release/public-site-inspection-2026-11-04.json`.

## Inspected commerce contract and actual defects

Read-only inspection of the existing Supabase project found zero products and
zero orders. No customer or product records were exported. Only table metadata,
constraints, policy definitions, effective privileges and aggregate counts were
read. The checked-in fixture metadata records these table contracts.

The old shop assumes fields absent from the live table, including brand,
discount_price, unit, ratings and document/approval properties. It queries every
product without approval filtering and has category controls that do not filter
the request. The old approval workflow updates nonexistent fields and an
unsupported `info_requested` state. The existing schema supports only pending,
approved and rejected statuses.

Live product policies currently allow any authenticated account to manage
products. A live order SELECT policy has `USING(true)` for authenticated users;
owner INSERT/UPDATE policies also allow browser-authored totals and payment
states. Effective browser table grants were confirmed. These are real policy
problems even though the inspected tables are currently empty. The new scoped
repair is a tested candidate, **not an applied live fix**. The original P01–P05
purchase/payment findings must not be closed based on catalog work.

## Implemented source

- `src/features/commerce/model.ts`: explicit validated public/management fields,
  bounded filters, exact decimal-string to integer-paise conversion and safe
  image URL handling. Unknown private fields in public projections are rejected.
- `gateway.ts`: safe transport errors, selected-workspace protection, cancellation
  and runtime validation of reads and mutation acknowledgements.
- `Catalog.tsx`: search, category/system/stock filters, sorting, stable pagination,
  public detail, honest loading/empty/failure states and missing-image fallback.
  No invented brand, rating, certification, shipping threshold or purchase action.
- `ProductManagement.tsx` and `ProductEditor.tsx`: owned manufacturer submissions,
  pending/approved/rejected lists, draft retention on failure, recorded review
  reasons, rejection feedback and publication withdrawal.
- `CommerceRoutes.tsx` and `service.ts`: existing account/role guard, explicit
  workspace selection for multi-role accounts and scoped cache keys. The proposed
  RPC contract stays separate from generated hosted schema types.
- Existing Shop, ProductDetail and ProductApprovals pages now use these modules.
  A guarded `/shop/manage` route is prepared. All remain contained by the existing
  production preview boundary. The old cart/checkout are still unreleased and
  their pricing/payment issues are not claimed repaired.

## Database candidate and permission matrix

`supabase/review-candidates/phase3-catalog.sql` is additive and reuses the inspected
products/orders tables. It introduces an unexposed `ayuzee_commerce` schema, an
append-only audit table, a monotonic catalog revision and an invoker public view.
The public RPC is SECURITY INVOKER; its narrow private implementation derives
identity and uses canonical current roles plus the existing active-actor helper.
Every function uses a fixed search path. No editable Auth metadata grants access.

| Actor | Allowed scope |
| --- | --- |
| Anonymous/member | Active, approved public catalog fields only |
| Manufacturer workspace | Submit/edit own products; every edit returns to pending and removes public publication |
| Product admin/admin/super admin workspace | Review current product snapshots with a reason; approve, reject or withdraw; self-review is denied |
| Orders admin/admin/super admin | Read operational orders, through the scoped order fence |
| Customer | Read own orders; cannot set total, paid/refund or fulfilment state |
| Other delegated admin roles | No product approval or operational order access merely from an admin-like title |

Restrictive fences AND with the legacy permissive policies. Public base-table
reads receive only explicit public column grants, so seller/manufacturer identity
and revision are not public fields. Browser writes are revoked; restrictive
WITH CHECK(false) fences also block leftover column-level order write grants.
Approved-only public view predicates remain mandatory even for privileged readers.

Manufacturer and reviewer operations lock the product, compare the current
snapshot revision, persist the change and append the audit record atomically.
Every update advances a revision counter, including a return to a previous
publication state; an old approval snapshot cannot become valid again after a
withdrawal cycle. Audit failure rolls the product update/revision back. Review
feedback is visible only in owner/reviewer management responses, not the catalog.

## Verification

- 18 catalog UI/contract tests pass, covering search/filter/sort/paging, public
  detail, owned submissions, failed-draft retention, review/failure states,
  unauthorized management, exact paise, public-field isolation and cancellation.
- 16 PostgreSQL scenarios pass (17 Node tests including the parent suite). They
  recreate the inspected metadata and exact three earlier access migrations.
  Cases include spoofed ownership/publication, cross-owner access, stale/self
  review, rejection/resubmission/withdrawal, role removal/deleted actors, audit
  rollback, private-field isolation, order ownership and browser payment forgery,
  including deliberately retained column-level write grants as negative controls.
- Full unit suite: 231 tests across 22 files pass. Strict commerce TypeScript and
  focused lint pass. Production Vite build passes; existing large-chunk warning
  remains. These do not replace the still-failing whole-application schema gate.
- Mobile public catalog: viewport/content width 390px; 26 axe WCAG A/AA checks
  pass with zero violations and incomplete results. Desktop 1440px grid, reviewer
  workspace and manufacturer form were inspected. Screenshots are under
  `docs/release/catalog-*-2026-11-04.jpg`.
- Source CI checks now include local community/catalog tests and scoped types.
  Actual hosted CI enforcement has not been verified.

## Remaining work

Phase 3 is **1/8 local, 0/8 hosted**. This increment covers catalog/publication
controls. Native local REST/Auth integration, current schema/grant/RPC/trigger
preflight, rollback preparation, separately authorized deployment and real role
acceptance remain required. The fixture adapter under `tests/browser/commerce`
uses clearly fictional localStorage data; it is never imported by production.

The next part is authoritative cart pricing. Tax/delivery/discount/prescription
rules must be established rather than copied from inconsistent browser values.
Order reservation/idempotency, payment verification/recovery, courier outcomes,
cancellation/refunds and concurrent capacity checks remain pending. No missing
provider configuration will be replaced with fabricated successful outcomes.
Media/document uploads and credential verification are not implemented here;
catalog approval does not establish regulatory or clinical certification.

Run `npm run preview:commerce` from the existing checkout for the local review at
`http://127.0.0.1:4184/shop`. Review controls switch fictional guest/manufacturer/
reviewer views, simulate connection failure, reset local data and run axe.
