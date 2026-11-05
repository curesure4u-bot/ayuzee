# Phase 1 onboarding integration — 4 November 2026

Hosted migration `20261104040153_account_onboarding_contract` applies the
CLI-created source `supabase/migrations/20261104040057_account_onboarding_contract.sql`.
It adds the RPC contract already expected by the account UI, a private-by-policy
onboarding table and patient-only Auth bootstrap. Existing profile/RLS authority
rules and all previous role grants are preserved. Professional/admin selections
in editable signup metadata cannot grant permission. No existing account is
automatically marked as onboarded or publicly published.

The candidate was tested after the exact two applied scoped-access migrations:
ten PostgreSQL tests pass, including atomic rollback, protected clinical links,
owner isolation, rejected privileged role requests and Auth deletion cleanup.
The local live-stack test passes seven Auth/Mailpit/PKCE/API scenarios: signup,
email confirmation, role-request persistence, direct API denial, refresh/logout,
recovery/new-password re-entry and recovery-link reuse rejection. Emails remain
inside the loopback-only Mailpit test sink; no real recipient/provider is used.

Live read-only assertions passed after application: anonymous access to the two
RPCs is denied, Auth bootstrap cannot be executed by browsers, and an unknown
identity cannot read/write onboarding. There remain 36 role rows, 15 profiles,
zero onboarding rows initially. The security advisor still reports zero ERRORs.
No live test account was created and no hosted email was sent.

Generated TypeScript types were refreshed from live (430 public tables, 21
views). The account service now uses the real generated RPC types, retaining
runtime response validation. These are backend/source changes; the frontend has
not been published. Production confirmation/recovery email delivery, SMTP,
redirects, hosting/publishing controls and complete all-role workflows remain
acceptance work. This increment does not close Phase 1.

Repeat local checks with `node --test scripts/onboarding-integration.test.mjs`
and `node scripts/onboarding-local.mjs` after starting the existing local stack.
The latter uses one synthetic account and cleans it up. Do not run local fixture
SQL against the hosted project or replay the applied migration.

Read-only dashboard follow-up found custom SMTP and email confirmation disabled,
new-user signups allowed and anonymous sign-ins disabled. Site URL is
`https://ayuzee.com`; the sole redirect pattern is `https://ayuzee.com/**`.
No setting was changed or hosted email sent. Company SMTP availability and
coordinated confirmation/recovery delivery remain blockers. See
`auth-dashboard-2026-11-04.json`. No paid email service or upgrade is authorized.
