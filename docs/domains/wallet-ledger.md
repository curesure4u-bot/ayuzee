# Phase 4.1 — wallet ledger foundation, 5 November 2026

First local increment only. **Phase 4 is in progress, not complete.**
The original six workstreams remain wallet accounting, rewards/redemptions,
payouts, memberships/digital access, quiz scoring and courses/content. Wallet UI
integration, old writers and trusted real event adapters remain unfinished; P4.1's
local checklist is intentionally still open.

## Implemented boundary

`supabase/review-candidates/phase4-wallet-ledger.sql` adds an unexposed private
`ayuzee_finance` schema. It is a local candidate, not a hosted migration. Event
registration/posting starts disabled and accepts only fictional `fixture_` event
sources. There is no payout, payment, conversion, top-up, reward approval or
provider transport. Old unverified balances are not copied or treated as opening
balances. No real financial event was generated.

Customer accounts are separate for INR integer paise and coins. There is no
writable balance field: balances are derived from committed, append-only journal
entries. Each event produces exactly one customer entry and one opposite clearing
entry in the same unit. Deferred constraints enforce a balanced two-entry journal;
failed entry/audit persistence rolls back the entire posting. Negative customer
balances and the declared upper limit are denied under sorted account row locks.
The clearing entry is accounting evidence, not proof of real funds in a bank.

Only a service-role worker can register/post a candidate event. The database binds
integration/reference, account, unit, signed amount and purpose. Identical event
and posting retries return the original event/journal; changed retries fail.
Browser users, including administrators, have no registration/posting permission,
no direct private-table privileges and no arbitrary balance override. Real event
eligibility must be supplied by separately verified source adapters before any
non-fixture implementation can be considered.

`wallet_ledger_status` validates a confirmed live Auth session and a currently
assigned workspace, then derives only that actor's own account. Admins have no
implicit read-all path. It returns at most 20 public history entries, without
owner/account IDs, private source references or the clearing balance. An absent
new ledger account returns uninitialized/null, not a fabricated zero or a claim
that legacy funds do not exist. Signed-out/removed/unconfirmed/deleted actors fail
closed. Financial history survives Auth deletion while account ownership becomes
NULL; pending new posts for a missing owner require review.

`src/features/wallet/model.ts` and `gateway.ts` provide a strict, read-only browser
contract. Large integer values remain decimal strings so precision is preserved.
Coin/money substitution, private response fields and unsupported pages are denied.
There is deliberately no public credit/debit method. These modules have not yet
replaced patient/doctor wallet pages or enabled any functional route.

## Verification

- **20 isolated tests**: 15 PostgreSQL/authority/transaction scenarios and five
  browser-contract scenarios. They cover disabled mutations, balanced entries,
  exact retries, changed owner/unit/amount rejection, unit separation,
  insufficient funds, denied browser/admin/worker table access, own-only status,
  revoked identity, deferred invariant failure, rollback, bounded history and
  Auth deletion/retention. Strict wallet types and lint pass.
- **Six native local Auth/PostgREST/Postgres scenarios** pass. Ten simultaneous
  duplicate registrations/posts produce one balanced credit. Five concurrent
  300-paise debits against 1000 paise permit exactly three, leaving 100 paise.
  Coins cannot cover money debits; foreign accounts/forged grants/workers deny
  access; a signed-out token cannot read the ledger. See
  [native evidence](../release/wallet-local-result.json).
- The native run exposed a deferred-trigger context issue: the checker runs
  after the API's security-definer context ends. The narrow private invariant
  checker now executes with fixed-path owner reads, without granting callers
  table access or public execute permission. This was applied as a body/hash-
  verified forward adjustment to an empty local fixture, not a reset or replay.
- The existing seven-container local stack was restarted. No cloud resource,
  upgrade, provider request, real money movement or hosted database change was
  used. Test identities/entries were cleaned and finance policy disabled.

The candidate has a `local_verification.wallet_install` fingerprint. Do not edit
installed SQL/replay it or reset staging; future changes need verified forward
updates. This candidate depends on the existing account/session foundation, not
on commerce settlement. Isolated tests reuse the shared synthetic foundation
fixture for convenience; this does not establish complete live-schema replay.

## Remaining work

Connect shared-session read-only wallet screens and all-role route tests; reconcile
legacy wallet/transaction tables, policies, SECURITY DEFINER RPCs, signup and
settlement triggers and alternate writers before replacing or fencing them.
Balances/units, migration of prior funds, reconciliation, retention and operational
ownership need reviewed business rules. S03/S04 and hosted wallet security remain
open. Later Phase 4 work must derive rewards, redemptions, payouts and entitlements
from verified server events rather than adding browser-controlled balances.
