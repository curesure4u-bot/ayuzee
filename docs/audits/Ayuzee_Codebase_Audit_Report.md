# Ayuzee — Complete Static Codebase Review

**Repository:** curesure4u-bot/ayuzee  
**Requested branch:** Sai-Branch  
**Reviewed commit:** [18c3c8580c665c6a711a12d5fda699b4a21da1f6](https://github.com/curesure4u-bot/ayuzee/commit/18c3c8580c665c6a711a12d5fda699b4a21da1f6)  
**Review dates:** 13–14 October 2026  
**Source supplied:** /Users/sai/ayuzee; analysis performed against an isolated Git export of Sai-Branch.  
**Method:** source review, whole-tree code parsing, lint, schema/API mapping, dependency advisories, production compilation and unit checks. The actual website was not launched or rendered. No production database, payment gateway or messaging service was exercised.

## 1. Overall assessment

Ayuzee contains a substantial interface and feature inventory, but the supplied branch is not a dependable production foundation for the complete portal described. The largest problems are authorization, patient-data correctness, financial integrity, inconsistent database setup, and pages that present prototypes as completed operations. A successful frontend build does not resolve these defects.

The audit identifies **79 grouped findings: 7 critical, 48 high, and 24 medium**. These are distinct issues or recurring issue families, not a count of every affected file. Severity reflects the potential impact of the supplied implementation; deployment-dependent risks are identified as such. No claim is made that a live exploit or data breach occurred.

The most consequential findings are:

- **Access can collapse across the portal:** supplied policies allow role changes, overly broad profile operations and cross-hospital data access (S01, S02, S05).
- **Money is not reliably controlled by trusted operations:** wallet owners can update balances, purchase prices originate in the browser, and payment signatures are not bound to the intended purchase (S03, P01, P02).
- **Some clinical information is fabricated:** empty allergy histories can become sample allergies, document parsing returns canned medical findings, and several “AI” pages show fixed personal results (C01–C03).
- **The database is not reproducible through one authoritative path:** hundreds of client dependencies rely on manual SQL, some definitions and backend endpoints are absent, and migration versions conflict (E03–E05).
- **Many actions are incomplete despite success messages:** consent, Health Locker, duplicate merge, security controls, some bookings and integrations have no corresponding durable result (F01–F08, O03).

There is useful work to retain: React/TypeScript components, lazy route organization, reference catalogs, a shared Supabase client, server-side identity helpers, some private storage policies, partial financial-field guards, and existing Zod schemas. Those foundations are unevenly used. This report does not recommend replacing every feature indiscriminately; it identifies where an existing interface is backed by trustworthy behavior and where that behavior must be established.

## 2. Scope and coverage

| Item | Count / observation |
|---|---|
| Tracked files in the branch snapshot | 2,100 |
| Files under src | 1,534 |
| JavaScript/TypeScript files parsed | 1,676 |
| JavaScript/TypeScript files under src | 1,528 |
| Files under src/pages | 1,181; includes helper files, not just screens |
| Source-code lines parsed under src | 359,367; includes comments and generated types |
| Route declarations | 1,174; includes layouts, aliases, index and fallback routes |
| Versioned SQL files | 199 |
| Supabase function entrypoints | 57 |
| Netlify handlers | 5 |
| Distinct database object names referenced by src | 550 |
| Referenced objects with literal definitions only in scripts | 277 |
| Referenced objects with no literal SQL definition found | 27; candidates requiring reconciliation |
| Unit-test files / browser-spec files | 4 / 65 |

All first-party code files were parsed and structurally scanned. SQL, configuration, deployment files, tests and prior documentation were inventoried and checked for policy, contract and completeness patterns. High-risk flows and representative implementations across the major modules received targeted source review. This is a comprehensive static audit with traceable findings, not a claim that every line was manually read or that every runtime defect can be discovered without running the system.

Source links in each finding use the exact reviewed commit, so they remain valid if Sai-Branch changes. The local main checkout advanced during the review with documentation/presentation changes; those later changes are outside this branch report. GitHub confirmed Sai-Branch still points to the reviewed commit on 14 October 2026. The original checkout was not edited by this audit.

## 3. Verification results

| Check | Result | Interpretation |
|---|---|---|
| Locked dependency installation in audit copy | Completed; lifecycle scripts disabled | No application/site started |
| Production Vite compilation | **Passed**, 6,527 modules transformed; approximately 15.85 seconds | This compiles the imported bundle, not the whole source tree or database |
| Advertised typecheck: tsc --noEmit | **Exited successfully without checking the referenced application** | False confidence from root files: [] configuration; E01 |
| Actual application check: tsc -p tsconfig.app.json --noEmit | **Failed** | Three syntax diagnostics in the unused Razorpay helper; E02 |
| Whole-tree parsing | Three diagnostics, all in that same helper; no unresolved literal local imports found | Does not verify database, external packages, runtime permissions or dynamic imports |
| ESLint | **3,142 errors; 147 warnings** | 3,097 errors concern explicit any; additional categories include invalid hook usage and empty blocks |
| Unit tests | **18 passed in four files** | Four assertions are placeholders; fourteen exercise actual component/data behavior |
| Full dependency advisory audit | **51 package entries: 2 critical, 20 high, 28 moderate, 1 low** | Includes development/build/test tools and transitive propagation; see appendix |
| Native Node import of Netlify Gemini handler | **Failed** with exports undefined in ES module scope | Hosted Netlify bundling was not executed; O02 |
| Browser, E2E, accessibility rendering, live APIs and database replay | **Not run** | Deliberately outside this source-only review |

The checks above were completed and captured during the 13 October review. The source snapshot was re-exported and reparsed on 14 October. A temporary diagnostic copy was prepared to look past the comment syntax error; no completed semantic result from that modified copy is used in this report. No fixes from that copy were applied to the project.

## 4. Module status map

“Partial real implementation” means the inspected paths contain actual backend operations but still have documented contract/security/integrity gaps. “Mixed” means functioning code, local samples and prototypes coexist. These are source-based implementation assessments, not runtime acceptance results or percentage-complete estimates.

| Module / feature family | Source assessment | Principal gap | Findings |
|---|---|---|---|
| Public website and provider discovery | Partial real implementation | Public directory views and search permissions conflict; role onboarding is inconsistent. | E13, F16 |
| Community feed and discussions | Real persistence with unsafe boundaries | Doctor-only visibility is not enforced; polls are incomplete and schema-incompatible. | F12–F13 |
| Public doctor booking | Partial financial workflow | Browser-controlled fees, fixed slots and fragile payment/consultation contracts. | P01–P04, C07 |
| Patient account and dashboard | Mixed real/prototype | Addresses and some lists persist; Health Locker is a demonstration with false action confirmations. | F03, C01 |
| Shop, checkout and orders | Partial real implementation | Order pricing, payment binding, status transitions, refunds and recovery need correction. | P01–P05, P10 |
| Hospital registration and OPD | Partial real implementation | Supplemental schema dependency, weak tenant isolation and multiple patient/appointment models. | S05, E03, E10 |
| Clinical records and prescriptions | Partial real implementation | Patient identity mismatches and non-atomic clinical writes can corrupt records. | C04, C06–C07 |
| IPD, nursing and bed management | Mixed real/prototype | Admission/bed transitions are not atomic; several operational hooks retain samples. | C05, F06 |
| Pharmacy, purchases and stock | Mixed real/prototype | GRN races, incomplete sale invoices, wrong batch matching and nonfunctional camera decoding. | P08–P09, O08 |
| Laboratory and radiology | Mixed real/prototype | Lab pricing/verification gaps; multiple PACS/QC/report pages include sample or simulated data. | C09, C02 |
| Accounts, commissions and payouts | Partial real implementation | Wallet mutability and payout/settlement consistency are serious financial risks. | S03, P06–P07, P11 |
| HRMS and payroll | Mixed real/prototype | Manual schema, competing permissions and sample payroll fallbacks. | S05, E03, E10, F06 |
| Panchakarma and therapy operations | Partial real implementation | Privileged endpoint checks and payment/settlement contracts need review. | S09, P01–P04, P11 |
| Spine clinical tools and rehabilitation | Mixed real/prototype | Some tools store the actor as patient, and several Spine tables have no literal SQL definition. | C03–C04, E03 |
| Vaidya, homeopathy and classical references | Mixed real/reference content | Useful reference content exists; shared authorization, identity and schema gaps still apply. | S06, E03, E10 |
| Learning, assessments and certificates | Partial real implementation | Client-visible answers and client-computed scores cannot certify assessed learning. | F14–F15 |
| Student community, research and careers | Partial implementations | Extensive manual-table dependencies and independent role/reward systems need consolidation. | E03, E10, F11, F14 |
| Jobs and employer tools | Partial real implementation | Fraud endpoint trusts caller-supplied records; support and notification APIs are incomplete. | S09, E05 |
| Beyond.Praxis membership and digital store | Mixed real/prototype | Paid tiers activate directly, expiry is not enforced by gates, assets are exposed and HTML is unsafe. | S10, F09–F11 |
| Task tracker and productivity | Competing implementations | Some persistence exists, but fallback/context/regeneration semantics can lose or mix work. | E11–E12 |
| Therapist, venue and provider portals | Partial real implementation | Role/assignment boundaries and settlement consistency need shared foundations. | S05, E10, P11 |
| ABDM, ABHA and consent | Prototype/partial local records | Consent controls do not enforce consent; the ABHA exchange handler is a stub. | F01–F02 |
| AI diagnostics, document parsing and devices | Mixed real AI/prototype | Some server AI calls exist; other pages invent personal findings or document values. | C01–C03, S17 |
| Messaging and external integrations | Fragmented partial integrations | Authenticity/authorization, missing APIs, obsolete helpers and simulated success. | S07–S09, S16, E05, O01–O03 |
| Admin, permissions and governance | Partial controls with major gaps | Role escalation, missing provider/context wiring and non-operational security controls. | S01–S02, S12–S14, F05, E07–E10 |
| International/global expansion | Mostly demonstrations in inspected pages | Fixed international providers/fees and local booking/device interactions. | F07 |

## 5. Findings register

Each finding includes its observed behavior, consequence, correction direction and exact source references. Correction directions describe the necessary outcome; they are not a phased implementation plan. Dependencies overlap: repairing role administration alone does not automatically repair tenant isolation or payment correctness.

| ID | Severity | Finding |
|---|---|---|
| S01 | Critical | Users can grant themselves administrator roles |
| S02 | Critical | Profile policies expose and permit modification of other users’ data |
| S03 | Critical | Wallet owners can directly edit their balance |
| S04 | High | Reward tables have unrestricted “service role” policies |
| S05 | Critical | Hospital data isolation is missing from supplied policies and incomplete in fix scripts |
| S06 | High | Clinical interpretation functions bypass patient assignment checks |
| S07 | High | Messaging proxies accept untrusted callers, including bot webhook changes |
| S08 | High | Incoming messaging webhooks do not verify provider authenticity |
| S09 | High | Several privileged functions lack application-level caller authorization |
| S10 | High | Database HTML and printable records are rendered without sanitization |
| S11 | High | Posture-photo setup makes medical images publicly accessible |
| S12 | High | HMS access is a broad frontend gate, not module-level enforcement |
| S13 | High | Doctor self-update protection omits newer permission fields |
| S14 | Medium | Session changes do not invalidate all role and query caches |
| S15 | High | Repository contains reusable test credentials and production-oriented test instructions |
| S16 | Medium | Legacy browser integrations still expect private API keys |
| S17 | Medium | AI endpoints have weak cost, payload and feature controls |
| S18 | Medium | Audit logs are client-authored and best-effort |
| S19 | Medium | Custom login throttling is bypassable and lacks committed server implementations |
| P01 | Critical | Prices and free-payment states are chosen by the browser |
| P02 | Critical | Valid payment signatures can be replayed against a different internal purchase |
| P03 | High | Successful shop payment writes an order status rejected by the supplied schema |
| P04 | High | Payment completion depends on a browser callback with no committed reconciliation handler |
| P05 | High | Refunds can be marked complete without returning money |
| P06 | High | Payout processing is not atomic or protected against concurrent processing |
| P07 | High | Billing creates paid invoices regardless of actual payment mode |
| P08 | High | Goods receipts can lose stock updates and prematurely close purchase orders |
| P09 | High | Pharmacy sales do not implement the promised invoice and stock operation |
| P10 | Medium | Coupons and checkout retries are not a coherent persisted transaction |
| P11 | High | Therapy settlement can record settled after partial or failed credits |
| C01 | Critical | Empty patient histories are replaced by fabricated allergies and conditions |
| C02 | High | Document parsing invents medical values instead of reading the uploaded document |
| C03 | High | Some AI risk, vital and posture results are fixed demonstrations presented as personal findings |
| C04 | High | Spine therapy records are attached to the logged-in clinician as the patient |
| C05 | High | Admission and bed occupancy are separate, unchecked writes |
| C06 | High | Prescription creation and dispensing can leave contradictory records |
| C07 | High | Consultation code confuses doctor profile IDs with authentication IDs |
| C08 | High | Teleconsultation links point to an incompatible record identifier |
| C09 | Medium | Lab orders have zero pricing and lose legitimate numeric zero results |
| C10 | High | Medical signing is not bound to an assigned case or an atomic signed record |
| C11 | High | Offline clinical operations can be dropped, duplicated or synchronized under another session |
| F01 | High | Consent management reports grants/revocations without implementing them |
| F02 | High | ABHA/ABDM linking is a stub even when credentials are configured |
| F03 | High | Health Locker shows fabricated records and claims actions that do not occur |
| F04 | Medium | Duplicate-patient merge does not merge or dismiss any records |
| F05 | High | Security Controls settings do not save or enforce the advertised protections |
| F06 | High | Some booking hooks report success when persistence fails |
| F07 | Medium | International booking and device connection features are local demonstrations |
| F08 | Medium | Developer MCP and voice agent features simulate execution |
| F09 | High | Paid membership activates directly and expired memberships still pass gates |
| F10 | High | Paid digital products expose their file location before purchase |
| F11 | High | Coin redemption trusts cached balances and client-supplied redemption amounts |
| F12 | High | Doctor-only feed visibility is not enforced in database reads |
| F13 | Medium | Feed poll UI has no voting workflow and conflicts with schema |
| F14 | Medium | Quiz answers and scoring are client-controlled |
| F15 | Medium | Quiz daily selection and streak progression do not implement their stated rules |
| F16 | Medium | User-type onboarding routes distinct roles into doctor registration |
| E01 | High | Advertised typecheck command does not check application files |
| E02 | Medium | Unused payment helper has a syntax error hidden from the production build |
| E03 | High | Database setup is split between migrations and hundreds of manual-script dependencies |
| E04 | High | Migration history contains duplicate version prefixes and unsafe setup scripts |
| E05 | High | Client calls backend functions that are absent from the repository |
| E06 | Medium | Type safety is bypassed on a large scale and lint cannot act as a release gate |
| E07 | High | Entity switching crashes because its provider is never mounted |
| E08 | High | Branch context is unmounted and cannot define a reliable tenant boundary |
| E09 | Medium | An unused booking helper calls React hooks from an ordinary async function |
| E10 | High | Role definitions and patient/appointment models are fragmented |
| E11 | Medium | Task tracking has competing stores, silent fallback and missing role scoping |
| E12 | Medium | Appointment preparation listens to a field not defined by the booking schema |
| E13 | High | Public provider views inherit restrictions that can empty the directory |
| O01 | High | Configured browser headers block integrations used by the code |
| O02 | High | Netlify handlers mix CommonJS with an ES-module package |
| O03 | High | Delivery and notification integrations claim success without their external action |
| O04 | Medium | Current tests and CI cannot establish portal correctness |
| O05 | High | Locked dependencies have current vulnerability advisories |
| O06 | Medium | Bundle structure and global UI create avoidable loading overhead |
| O07 | Medium | SEO prerendering is disconnected from the default deploy and crawler rules conflict |
| O08 | Medium | Admin layout and several interactive controls need accessibility/mobile work |
| O09 | Medium | Historical reports and setup documents are not reliable evidence of current readiness |

## Security

### S01 · Critical · Users can grant themselves administrator roles

The July role-policy files permit authenticated INSERT, UPDATE and DELETE with unconditional checks. The later setup file also creates a policy named “Service role full access roles” without restricting it to service_role. A policy name does not enforce a role. These policies undermine has_role and every admin operation that depends on it.

**Consequence:** An ordinary account can acquire powerful roles if these definitions are applied. Financial, clinical and account-management protections then collapse together.

**Correction direction:** Replace the complete effective policy set with restricted role administration and add database tests proving ordinary users cannot assign or edit roles.

**Evidence:** [supabase/migrations/20260715_fix_rls.sql:23](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/migrations/20260715_fix_rls.sql#L23); [supabase/migrations/20260715_user_setup.sql:65](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/migrations/20260715_user_setup.sql#L65)

**Verification boundary:** Confirmed in source; deployment not inspected.

### S02 · Critical · Profile policies expose and permit modification of other users’ data

profiles_select_anon allows anonymous reads, and the setup file adds an unrestricted FOR ALL policy to profiles. Earlier owner-only policies coexist with these permissive policies rather than cancelling them.

**Consequence:** Contact and other stored profile fields can be exposed; where normal table grants permit writes, other users’ profiles can also be changed.

**Correction direction:** Separate a deliberately limited public profile projection from private profiles, and restrict mutations by owner or authorized administrator.

**Evidence:** [supabase/migrations/20260715_fix_rls.sql:15](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/migrations/20260715_fix_rls.sql#L15); [supabase/migrations/20260715_user_setup.sql:61](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/migrations/20260715_user_setup.sql#L61)

**Verification boundary:** Confirmed in source; deployment not inspected.

### S03 · Critical · Wallet owners can directly edit their balance

The wallet UPDATE policy checks only user_id. It does not protect balance, lifetime_earned or lifetime_spent. The wallet’s update trigger only maintains timestamps; the supplied migrations do not add a financial-field guard for this table.

**Consequence:** A user can fabricate a wallet balance, and payout processing trusts the stored balance when checking whether a payout is affordable.

**Correction direction:** Make financial balances server-maintained from an immutable ledger and forbid direct customer updates to monetary columns.

**Evidence:** [supabase/migrations/20260420162523_b21f175b-8a4b-4f67-931c-08feb3cd2e74.sql:16](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/migrations/20260420162523_b21f175b-8a4b-4f67-931c-08feb3cd2e74.sql#L16); [supabase/functions/process-payout/index.ts:114](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/process-payout/index.ts#L114)

**Verification boundary:** Confirmed in source; deployment not inspected.

### S04 · High · Reward tables have unrestricted “service role” policies

user_coins, coin_transactions, user_badges and user_streaks each have FOR ALL USING (true) policies without TO service_role. The browser also writes coin totals and awards directly.

**Consequence:** Reward balances, earned badges and history can be fabricated or modified beyond the intended user boundary if these policies are deployed.

**Correction direction:** Restrict reward writes to verified server events and test ownership and role denial at the database boundary.

**Evidence:** [supabase/migrations/20260715_gamification_tables.sql:146](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/migrations/20260715_gamification_tables.sql#L146); [src/hooks/useGamification.ts:111](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useGamification.ts#L111)

**Verification boundary:** Confirmed in source; deployment not inspected.

### S05 · Critical · Hospital data isolation is missing from supplied policies and incomplete in fix scripts

Core HMS setup scripts grant all authenticated users access to clinical tables. The alternative FIX_hms_staff_rls script checks broad global roles, while FIX_rls_permissive_policies defines an entity helper but does not use entity ownership in its clinical/finance policies. A doctor or staff role is not a hospital or patient relationship.

**Consequence:** Patient records, stock, billing and employee data can cross clinic boundaries; applying a file labelled “FIX” does not establish tenant isolation.

**Correction direction:** Adopt one authoritative organization/branch membership model and enforce it for each row, operation and storage object. Reconcile every existing policy before rollout.

**Evidence:** [scripts/create_hms_patient_opd.sql:50](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/scripts/create_hms_patient_opd.sql#L50); [scripts/FIX_hms_staff_rls.sql:39](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/scripts/FIX_hms_staff_rls.sql#L39); [scripts/FIX_rls_permissive_policies.sql:121](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/scripts/FIX_rls_permissive_policies.sql#L121)

**Verification boundary:** Confirmed in source; deployment not inspected.

### S06 · High · Clinical interpretation functions bypass patient assignment checks

Jihva and Netra interpretation validate that a doctor row exists, then load arbitrary observation IDs and private images through the service-role client. Spine interpretation explicitly allows any doctor row. These checks do not establish that the caller treats this patient or belongs to the same organization.

**Consequence:** A doctor account that knows another record ID can process another patient’s records or photos and change their AI fields.

**Correction direction:** Validate verified clinical role, organization membership, patient assignment and record state before every privileged read or write.

**Evidence:** [supabase/functions/jihva-pariksha-interpret/index.ts:138](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/jihva-pariksha-interpret/index.ts#L138); [supabase/functions/netra-pariksha-interpret/index.ts:140](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/netra-pariksha-interpret/index.ts#L140); [supabase/functions/spine-interpret/index.ts:124](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/spine-interpret/index.ts#L124)

**Verification boundary:** Confirmed in source; deployment not inspected.

### S07 · High · Messaging proxies accept untrusted callers, including bot webhook changes

The Netlify Telegram and WhatsApp senders check HTTP method and configuration but do not authenticate users or authorize recipients. Telegram also exposes a setWebhook action controlled by the request body.

**Consequence:** If deployed with credentials, callers can send messages through the business account; Telegram’s webhook can be redirected to an attacker-controlled address.

**Correction direction:** Require authenticated, authorized sending and move bot configuration actions to restricted administration with recipient and rate limits.

**Evidence:** [netlify/functions/telegram-send.js:85](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/netlify/functions/telegram-send.js#L85); [netlify/functions/whatsapp-send.js:14](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/netlify/functions/whatsapp-send.js#L14)

**Verification boundary:** Confirmed in source; deployment not inspected.

### S08 · High · Incoming messaging webhooks do not verify provider authenticity

The Telegram handlers process caller-supplied chat/user IDs without a Telegram secret-token check. The WhatsApp task handler verifies the GET setup challenge but does not validate POST signatures. Its profile fallback returns profiles.id as user_id instead of profiles.user_id.

**Consequence:** Forged requests can impersonate message senders or alter check-in/task data when privileged credentials are configured. Legitimate profile-based task creation can fail or target the wrong identifier.

**Correction direction:** Verify provider signatures/secrets on incoming requests, make delivery IDs idempotent, and resolve verified account links using auth user IDs.

**Evidence:** [netlify/functions/telegram-webhook.js:64](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/netlify/functions/telegram-webhook.js#L64); [netlify/functions/whatsapp-task-webhook.js:124](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/netlify/functions/whatsapp-task-webhook.js#L124); [netlify/functions/whatsapp-task-webhook.js:97](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/netlify/functions/whatsapp-task-webhook.js#L97)

**Verification boundary:** Confirmed in source; deployment not inspected.

### S09 · High · Several privileged functions lack application-level caller authorization

check-badges accepts user_id from the body; job-fraud-detect can update a job from a supplied record; panchakarma-seed writes templates through the service key; panchakarma-check-conflicts reads schedules through the service key. They do not establish the required user role or record relationship in their handlers. Gateway JWT verification, if enabled, only narrows who can call them and does not replace these checks.

**Consequence:** Ordinary authenticated callers may perform maintenance operations, modify another job’s flags or query schedules beyond their authorized scope.

**Correction direction:** Give each function an explicit user, admin or internal-service contract and validate it before creating privileged clients.

**Evidence:** [supabase/functions/check-badges/index.ts:21](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/check-badges/index.ts#L21); [supabase/functions/job-fraud-detect/index.ts:182](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/job-fraud-detect/index.ts#L182); [supabase/functions/panchakarma-seed/index.ts:203](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/panchakarma-seed/index.ts#L203); [supabase/functions/panchakarma-check-conflicts/index.ts:31](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/panchakarma-check-conflicts/index.ts#L31)

**Verification boundary:** Confirmed in source; deployment not inspected.

### S10 · High · Database HTML and printable records are rendered without sanitization

Academy renders lesson HTML directly. Admin template/email previews also render raw HTML, and several print windows interpolate database fields into HTML strings. A DOMPurify helper exists but is not used by these sinks. The chart’s internal CSS and JSON-LD uses were distinguished from user-content sinks.

**Consequence:** Untrusted or compromised content can execute browser script or inject markup in a privileged user’s session.

**Correction direction:** Sanitize rich text consistently, escape plain text used in print templates, and test each actual content source.

**Evidence:** [src/pages/beyond/Academy.tsx:635](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/beyond/Academy.tsx#L635); [src/pages/admin/masters/TemplateMaster.tsx:212](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/admin/masters/TemplateMaster.tsx#L212); [src/pages/patient/PatientGuidance.tsx:107](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/patient/PatientGuidance.tsx#L107)

**Verification boundary:** Confirmed in source; deployment not inspected.

### S11 · High · Posture-photo setup makes medical images publicly accessible

The posture-photos setup script creates a public bucket and allows authenticated uploads without constraining the upload path to the owner. DoctorSpine obtains public URLs for these photos. This differs from the private ownership model used by some other photo buckets.

**Consequence:** Anyone holding a public image URL can retrieve the medical photo; upload ownership is also weaker than intended.

**Correction direction:** Use private buckets, constrained owner/organization paths and short-lived authorized access URLs for medical images.

**Evidence:** [scripts/create_posture_photos_bucket.sql:8](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/scripts/create_posture_photos_bucket.sql#L8); [src/pages/hms/doctor/DoctorSpine.tsx:97](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/hms/doctor/DoctorSpine.tsx#L97)

**Verification boundary:** Confirmed in source; deployment not inspected.

### S12 · High · HMS access is a broad frontend gate, not module-level enforcement

HmsLayout checks hasAccess and an owner email, then renders the common Outlet. It does not apply the hms_modules permission list to each child route. The named canAccessModule helper is not used by this layout. Several incompatible role models exist in other guards.

**Consequence:** A user approved for one HMS function can reach other module pages by URL; actual data protection then depends entirely on already inconsistent backend policies.

**Correction direction:** Use one role/permission registry and enforce operation-level permissions on the server, with frontend gates reflecting those same rules.

**Evidence:** [src/pages/hms/HmsLayout.tsx:575](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/hms/HmsLayout.tsx#L575); [src/pages/hms/HmsLayout.tsx:791](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/hms/HmsLayout.tsx#L791); [src/hooks/useHmsAccess.ts:132](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useHmsAccess.ts#L132)

**Verification boundary:** Confirmed in source; deployment not inspected.

### S13 · High · Doctor self-update protection omits newer permission fields

The doctors guard protects hms_access and approval fields, but does not preserve hms_role, hms_modules, hms_branches, vaidya_access or hms_access_expiry. Owner UPDATE is otherwise permitted. useHmsAccess reads those fields to grant capabilities. This is conditional on the supplemental schema that introduces them.

**Consequence:** A doctor with an editable profile and existing access can attempt to expand module/branch privileges or change access expiry.

**Correction direction:** Keep authorization fields outside self-editable profiles, or enforce a complete server-maintained allowlist of editable columns.

**Evidence:** [supabase/migrations/20260702164743_e2310006-6030-4280-b656-6fafa09bfad8.sql:25](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/migrations/20260702164743_e2310006-6030-4280-b656-6fafa09bfad8.sql#L25); [src/hooks/useHmsAccess.ts:61](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useHmsAccess.ts#L61)

**Verification boundary:** Confirmed in source; deployment not inspected.

### S14 · Medium · Session changes do not invalidate all role and query caches

HmsRoleGuard has a module-level role cache and initializes new hooks from it before checking the current user. useHmsAccess loads only once. Several admin query keys omit the user, and no global query-cache clearing on sign-out is present in the supplied source.

**Consequence:** Account switching or permission revocation can leave stale permissions or previously fetched administrative data visible until a reload or refetch.

**Correction direction:** Centralize session state, clear sensitive caches on identity change and reload authorization when roles are changed or revoked.

**Evidence:** [src/components/hms/HmsRoleGuard.tsx:24](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/components/hms/HmsRoleGuard.tsx#L24); [src/hooks/useHmsAccess.ts:126](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useHmsAccess.ts#L126); [src/hooks/usePayouts.ts:45](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/usePayouts.ts#L45)

**Verification boundary:** Confirmed in source; deployment not inspected.

### S15 · High · Repository contains reusable test credentials and production-oriented test instructions

Test setup utilities, role-journey tests and reports contain fixed or fallback passwords. A consolidated report describes production testing and privileged test accounts. This audit does not establish whether those accounts still exist or those passwords work; credentials are intentionally not reproduced here.

**Consequence:** If the documented accounts are still active, repository access can become account access, including privileged roles.

**Correction direction:** Use isolated test projects and ephemeral credentials; identify and revoke or rotate any deployed accounts matching the committed setup.

**Evidence:** [create-test-accounts.mjs:7](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/create-test-accounts.mjs#L7); [e2e/superadmin-journey-complete.spec.ts:19](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/e2e/superadmin-journey-complete.spec.ts#L19); [TEST_REPORT_CONSOLIDATED.md:4](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/TEST_REPORT_CONSOLIDATED.md#L4)

**Verification boundary:** Confirmed in source; deployment not inspected.

### S16 · Medium · Legacy browser integrations still expect private API keys

integrations.ts and messagingService.ts use VITE_OPENAI_API_KEY or VITE_WHATSAPP_API_KEY in browser requests. Import analysis found no current importers for these two legacy services, so this is a dormant hazard rather than proof of a secret in the current bundle. .env.example also recommends a VITE_TELEGRAM_BOT_TOKEN even though the current Telegram path uses a server proxy.

**Consequence:** Following these setup instructions or reusing the helpers can expose billing or messaging secrets in public JavaScript.

**Correction direction:** Remove unsafe legacy helpers and align examples with one authenticated server-side integration path.

**Evidence:** [src/services/integrations.ts:289](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/services/integrations.ts#L289); [src/services/messagingService.ts:198](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/services/messagingService.ts#L198); [.env.example:10](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/.env.example#L10)

**Verification boundary:** Confirmed in source; deployment not inspected.

### S17 · Medium · AI endpoints have weak cost, payload and feature controls

ai-gateway accepts caller-selected feature, system prompt, model, max_tokens and messages without a feature allowlist, per-user budget or bounded payload policy. The Gemini proxy has only an in-memory IP limiter that resets on cold starts and accepts caller-supplied system instructions.

**Consequence:** Accounts can consume expensive provider capacity; medical guardrails supplied by normal clients can be bypassed by constructing a different request.

**Correction direction:** Enforce feature-specific server prompts, approved models, request/attachment limits, durable quotas and request timeouts.

**Evidence:** [supabase/functions/ai-gateway/index.ts:83](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/ai-gateway/index.ts#L83); [supabase/functions/ai-gateway/index.ts:82](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/ai-gateway/index.ts#L82); [netlify/functions/gemini-proxy.js:21](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/netlify/functions/gemini-proxy.js#L21)

**Verification boundary:** Confirmed in source; deployment not inspected.

### S18 · Medium · Audit logs are client-authored and best-effort

useAuditTrail trusts browser-supplied action, entity and details, and does not inspect the returned insert error. It is described as immutable, but its own code neither couples logging to the business transaction nor guarantees recording. Supplemental policies vary.

**Consequence:** Important operations can complete without a trustworthy audit entry, and browser-produced records are not reliable proof that an operation occurred.

**Correction direction:** Record critical audit events in the same server/database transaction, enforce append-only access and monitor audit failures.

**Evidence:** [src/hooks/useAuditTrail.ts:47](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useAuditTrail.ts#L47); [src/hooks/useAuditTrail.ts:60](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useAuditTrail.ts#L60)

**Verification boundary:** Confirmed in source; deployment not inspected.

### S19 · Medium · Custom login throttling is bypassable and lacks committed server implementations

The hook calls check_login_rate_limit and record_login_attempt, but no literal SQL definition for either was found in migrations or setup scripts. It fails open if the first call errors; callers can also bypass the browser entirely. Supabase’s separate provider-level protections were not inspected.

**Consequence:** The claimed custom layers cannot be relied on as deployed account protection from this repository.

**Correction direction:** Verify the real provider configuration and implement any additional enforcement in a trusted authentication path, with committed definitions and negative tests.

**Evidence:** [src/hooks/useLoginThrottle.ts:70](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useLoginThrottle.ts#L70); [src/hooks/useLoginThrottle.ts:167](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useLoginThrottle.ts#L167)

**Verification boundary:** Confirmed in source; deployment not inspected.


## Payments and financial integrity

### P01 · Critical · Prices and free-payment states are chosen by the browser

Checkout inserts subtotal, shipping, total and line prices from cart state. BookingDialog inserts fee and even paid/confirmed states for a free follow-up. Existing guards preserve financial fields on UPDATE, not INSERT. razorpay-create-order then treats these stored browser-originated totals as authoritative.

**Consequence:** A caller can create a cheaper order/appointment or claim a free booking without the trusted server recalculating product prices or follow-up eligibility.

**Correction direction:** Create purchases/bookings through a server transaction that derives prices, discounts, eligibility, stock and initial states from trusted records.

**Evidence:** [src/pages/Checkout.tsx:234](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/Checkout.tsx#L234); [src/components/site/BookingDialog.tsx:98](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/components/site/BookingDialog.tsx#L98); [supabase/functions/razorpay-create-order/index.ts:56](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/razorpay-create-order/index.ts#L56); [supabase/migrations/20260705064415_25d8f0ae-cd5b-4916-be04-3f71e3681218.sql:54](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/migrations/20260705064415_25d8f0ae-cd5b-4916-be04-3f71e3681218.sql#L54)

**Verification boundary:** Confirmed in source; deployment not inspected.

### P02 · Critical · Valid payment signatures can be replayed against a different internal purchase

Verification computes HMAC from the request’s Razorpay order ID and payment ID, then updates the caller-owned internal_id. It does not compare the supplied Razorpay order ID with the one already stored on that internal record, or make the payment ID unique. It also reports success if an UPDATE matches no row.

**Consequence:** One genuine payment can be reused to mark another caller-owned order, appointment or therapy record paid; mismatched/no-op updates can also be presented as success.

**Correction direction:** Load and bind the server-stored payment order, enforce unique payment consumption, verify amount/currency/state, and require exactly one valid transition.

**Evidence:** [supabase/functions/razorpay-verify-payment/index.ts:49](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/razorpay-verify-payment/index.ts#L49); [supabase/functions/razorpay-verify-payment/index.ts:81](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/razorpay-verify-payment/index.ts#L81)

**Verification boundary:** Confirmed in source; deployment not inspected.

### P03 · High · Successful shop payment writes an order status rejected by the supplied schema

razorpay-verify-payment sets order_status to confirmed. The orders CHECK constraint permits placed, processing, shipped, delivered and cancelled, and no supplied migration changes this constraint to allow confirmed.

**Consequence:** A real payment can succeed at the gateway while the application’s order update fails under the committed schema.

**Correction direction:** Define one order state machine shared by schema, APIs and clients, and test the full paid transition against a rebuilt database.

**Evidence:** [supabase/functions/razorpay-verify-payment/index.ts:74](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/razorpay-verify-payment/index.ts#L74); [supabase/migrations/20260420154547_65da4b37-2c31-481d-9c87-98f4c4e4aee7.sql:41](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/migrations/20260420154547_65da4b37-2c31-481d-9c87-98f4c4e4aee7.sql#L41)

**Verification boundary:** Confirmed in source; deployment not inspected.

### P04 · High · Payment completion depends on a browser callback with no committed reconciliation handler

The verification handler marks paid after checking a signature, without checking provider capture status. The checkout flow relies on the browser callback; no Razorpay payment webhook or reconciliation job is included in the supplied server functions.

**Consequence:** Closed tabs, lost connectivity or delayed capture can leave financial and order states inconsistent.

**Correction direction:** Make provider events and reconciliation authoritative, retain idempotent callback handling, and support recovery from interrupted checkout.

**Evidence:** [src/pages/Checkout.tsx:305](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/Checkout.tsx#L305); [supabase/functions/razorpay-verify-payment/index.ts:70](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/razorpay-verify-payment/index.ts#L70)

**Verification boundary:** Confirmed in source; deployment not inspected.

### P05 · High · Refunds can be marked complete without returning money

razorpay-refund skips the provider API if credentials are absent but still marks an order refunded. It accepts a payment_id separately from order_id, does not bind them to the stored purchase, and marks the entire order refunded even for a partial amount.

**Consequence:** Customer money and the database can disagree; an administrator mistake can refund one payment while marking a different order.

**Correction direction:** Validate the stored payment, amount and remaining refundable balance; persist provider refund IDs and pending/partial/final states only after verified outcomes.

**Evidence:** [supabase/functions/razorpay-refund/index.ts:25](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/razorpay-refund/index.ts#L25); [supabase/functions/razorpay-refund/index.ts:35](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/razorpay-refund/index.ts#L35)

**Verification boundary:** Confirmed in source; deployment not inspected.

### P06 · High · Payout processing is not atomic or protected against concurrent processing

The handler reads approved status and wallet balance, optionally issues the provider payout, inserts a debit, then updates the request in separate operations. There is no conditional status claim/lock or provider idempotency header. Reject and hold can also overwrite inappropriate terminal states.

**Consequence:** Concurrent/retried requests can pay twice, overdraw a wallet or leave a successful external transfer unrecorded after a later failure.

**Correction direction:** Reserve a payout atomically, use durable idempotency and a recoverable payout state machine, and reconcile external transfers with ledger entries.

**Evidence:** [supabase/functions/process-payout/index.ts:60](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/process-payout/index.ts#L60); [supabase/functions/process-payout/index.ts:128](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/process-payout/index.ts#L128); [supabase/functions/process-payout/index.ts:173](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/process-payout/index.ts#L173)

**Verification boundary:** Confirmed in source; deployment not inspected.

### P07 · High · Billing creates paid invoices regardless of actual payment mode

useBilling sets paid_amount equal to total_amount, balance_amount to zero and payment_status to paid for every bill, including credit/insurance modes. It trusts item totals, ignores errors on line items and receipts, and updates the visit separately.

**Consequence:** Receivables and collection reports can be wrong, and incomplete invoices can appear fully paid.

**Correction direction:** Separate invoice creation from receipt posting, recompute totals on the server and commit header, lines, receipts and visit links transactionally.

**Evidence:** [src/hooks/useBilling.ts:61](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useBilling.ts#L61); [src/hooks/useBilling.ts:91](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useBilling.ts#L91); [src/lib/validations.ts:30](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/lib/validations.ts#L30)

**Verification boundary:** Confirmed in source; deployment not inspected.

### P08 · High · Goods receipts can lose stock updates and prematurely close purchase orders

GRN header, lines, stock and PO status are separate writes. Stock is updated by reading current_stock and replacing it, which loses concurrent increments. Any linked PO is marked fully_received without comparing outstanding quantities.

**Consequence:** Partial receipts can be treated as complete; inventory can be inaccurate or only partly updated.

**Correction direction:** Use atomic per-batch stock movements and server-side receipt transactions that derive partial/full PO status from accepted quantities.

**Evidence:** [src/hooks/useStockGrn.ts:125](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useStockGrn.ts#L125); [src/hooks/useStockGrn.ts:137](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useStockGrn.ts#L137)

**Verification boundary:** Confirmed in source; deployment not inspected.

### P09 · High · Pharmacy sales do not implement the promised invoice and stock operation

SaleBillNew writes ward consumption rows rather than a complete sale invoice. It matches stock by product name, falls back to the first stock item for unmatched rows, and sets quantity_available to undefined in its “deduct stock” update. Amount, payment and patient details largely remain free text in notes.

**Consequence:** A sale can be saved against the wrong product/batch without reducing stock or producing a coherent receivable/receipt.

**Correction direction:** Use explicit product, batch, store and patient IDs and an atomic sale/stock/receipt transaction.

**Evidence:** [src/pages/hms/stock/sale/SaleBillNew.tsx:133](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/hms/stock/sale/SaleBillNew.tsx#L133); [src/pages/hms/stock/sale/SaleBillNew.tsx:158](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/hms/stock/sale/SaleBillNew.tsx#L158); [src/pages/hms/stock/sale/SaleManage.tsx:90](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/hms/stock/sale/SaleManage.tsx#L90)

**Verification boundary:** Confirmed in source; deployment not inspected.

### P10 · Medium · Coupons and checkout retries are not a coherent persisted transaction

Coupon discounts are calculated and retained in browser state, with redemption logged before payment. Checkout creates a new order and items before loading the gateway; cancelled or failed payment initialization leaves that order behind. Stock reservation and a resumable checkout record are not established here.

**Consequence:** Coupon usage may count unpaid purchases, repeated attempts accumulate abandoned orders, and price/stock changes during checkout are not handled reliably.

**Correction direction:** Evaluate coupon rules and reserve stock in the trusted checkout transaction; persist a resumable payment attempt and expire unpaid reservations.

**Evidence:** [src/pages/Checkout.tsx:256](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/Checkout.tsx#L256); [src/pages/Checkout.tsx:230](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/Checkout.tsx#L230); [src/pages/Checkout.tsx:289](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/Checkout.tsx#L289)

**Verification boundary:** Confirmed in source; deployment not inspected.

### P11 · High · Therapy settlement can record settled after partial or failed credits

settle-therapy-session checks a final status then issues wallet/revenue inserts and a status update separately, without inspecting all returned errors. Concurrent calls can pass the initial check. The “Idempotent” comment does not supply a database uniqueness/transaction guarantee.

**Consequence:** A session can be settled with missing credits, or retries/concurrency can duplicate earnings.

**Correction direction:** Settle once in a transaction with unique ledger keys per session and beneficiary, and reconcile any external effects separately.

**Evidence:** [supabase/functions/settle-therapy-session/index.ts:78](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/settle-therapy-session/index.ts#L78); [supabase/functions/settle-therapy-session/index.ts:121](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/settle-therapy-session/index.ts#L121)

**Verification boundary:** Confirmed in source; deployment not inspected.


## Clinical and patient-data integrity

### C01 · Critical · Empty patient histories are replaced by fabricated allergies and conditions

usePatientAllergies initializes with specific mock allergies and diagnoses, keeps them when no records exist, and substitutes mock categories when a real patient has no entries in that category. This is operational patient data, not a labelled reference example.

**Consequence:** A patient can appear to have allergies, anaphylaxis history or conditions they never reported, misleading clinical decisions.

**Correction direction:** Represent absent, unknown, loading and failed data distinctly; never substitute demonstration clinical history for a patient record.

**Evidence:** [src/hooks/usePatientAllergies.ts:81](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/usePatientAllergies.ts#L81); [src/hooks/usePatientAllergies.ts:156](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/usePatientAllergies.ts#L156)

**Verification boundary:** Confirmed in source; deployment not inspected.

### C02 · High · Document parsing invents medical values instead of reading the uploaded document

The parser chooses canned laboratory/prescription results based on filename/type after a timeout. HmsDocumentParser passes file.name rather than document content and shows extracted values and confidence as a successful parse.

**Consequence:** Arbitrary uploaded files can appear to contain the same fabricated laboratory findings or medicines.

**Correction direction:** Disable the operational claim until extraction exists; preserve actual source content and require verified provenance and human review.

**Evidence:** [src/services/documentParsingService.ts:72](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/services/documentParsingService.ts#L72); [src/pages/hms/HmsDocumentParser.tsx:59](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/hms/HmsDocumentParser.tsx#L59)

**Verification boundary:** Confirmed in source; deployment not inspected.

### C03 · High · Some AI risk, vital and posture results are fixed demonstrations presented as personal findings

PredictiveRiskEngine uses fixed disease percentages and treatment tips without reading patient inputs. SmartHomeVitals shows hardcoded connected devices/vitals. DoctorSpine writes overall_score 62 and moderate severity, then simulates analysis, even following upload failure.

**Consequence:** Users can mistake demonstrations for measured or individualized health information, and fake scores can enter stored assessments.

**Correction direction:** Clearly isolate non-operational demonstrations; only persist results derived from the patient’s actual source data with validated interpretation.

**Evidence:** [src/pages/ai/PredictiveRiskEngine.tsx:7](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/ai/PredictiveRiskEngine.tsx#L7); [src/pages/ai/SmartHomeVitals.tsx:15](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/ai/SmartHomeVitals.tsx#L15); [src/pages/hms/doctor/DoctorSpine.tsx:107](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/hms/doctor/DoctorSpine.tsx#L107)

**Verification boundary:** Confirmed in source; deployment not inspected.

### C04 · High · Spine therapy records are attached to the logged-in clinician as the patient

The therapy form accepts a patient name/ID but inserts patient_id: user.id and doctor_id: user.id. The code itself contains a TODO to replace the patient lookup.

**Consequence:** Treatment history is recorded against the wrong person, breaking patient timelines and outcome analysis.

**Correction direction:** Resolve and validate the selected patient’s canonical record ID independently from the acting clinician’s auth ID.

**Evidence:** [src/pages/hms/spine/SpineTherapySession.tsx:210](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/hms/spine/SpineTherapySession.tsx#L210)

**Verification boundary:** Confirmed in source; deployment not inspected.

### C05 · High · Admission and bed occupancy are separate, unchecked writes

useIpdAdmission creates an admission, then updates the bed without verifying the update result or atomically claiming availability. Discharge changes the admission before separately freeing the bed.

**Consequence:** Failures or concurrent admissions can leave bed/admission states inconsistent; database constraints in the actual deployment still need to be checked.

**Correction direction:** Atomically reserve/release the bed with admission transitions and enforce one active admission per bed in the schema.

**Evidence:** [src/hooks/useIpdAdmission.ts:53](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useIpdAdmission.ts#L53); [src/hooks/useIpdAdmission.ts:85](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useIpdAdmission.ts#L85)

**Verification boundary:** Confirmed in source; deployment not inspected.

### C06 · High · Prescription creation and dispensing can leave contradictory records

The prescription header is inserted before items; an item failure leaves the header behind. Dispensing marks the header first, then updates all items without checking the returned error. The provided validation schemas are not invoked by this hook.

**Consequence:** A prescription can exist without its medicines, or appear dispensed while items remain undispensed.

**Correction direction:** Use server-side validation and an atomic prescription/dispensing workflow with per-item quantities and an auditable final state.

**Evidence:** [src/hooks/usePrescription.ts:91](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/usePrescription.ts#L91); [src/hooks/usePrescription.ts:143](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/usePrescription.ts#L143)

**Verification boundary:** Confirmed in source; deployment not inspected.

### C07 · High · Consultation code confuses doctor profile IDs with authentication IDs

appointments.doctor_id references doctors.id, but ConsultationRoom compares it to auth.user.id, queries profiles.user_id with it and assigns it to doctor_user_id. Public booking inserts the doctor profile ID. The completion function also tries to update appointments.status from the browser, while the financial guard preserves OLD.status.

**Consequence:** The legitimate doctor can be treated as a patient, doctor details can be missing, assessment writes can fail and completion can report success while status stays unchanged.

**Correction direction:** Resolve doctor profile and auth identities explicitly and complete consultations through an authorized server transition aligned with schema guards.

**Evidence:** [src/pages/consultation/ConsultationRoom.tsx:64](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/consultation/ConsultationRoom.tsx#L64); [src/pages/consultation/ConsultationRoom.tsx:182](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/consultation/ConsultationRoom.tsx#L182); [supabase/migrations/20260705045447_8f2b927e-65ba-4882-b1b9-4ca3cea064c6.sql:30](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/migrations/20260705045447_8f2b927e-65ba-4882-b1b9-4ca3cea064c6.sql#L30)

**Verification boundary:** Confirmed in source; deployment not inspected.

### C08 · High · Teleconsultation links point to an incompatible record identifier

useTeleconsult creates room URLs using a generated tc-... room ID. The route /consultation/:id/room loads appointments by that :id, not hms_teleconsult_sessions or room_id. The hook does not create the appointment that the room expects.

**Consequence:** A scheduled HMS teleconsult can open a room that cannot find its appointment.

**Correction direction:** Use one consultation/session contract and validate room participants and appointment/session mapping on the server.

**Evidence:** [src/hooks/useTeleconsult.ts:22](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useTeleconsult.ts#L22); [src/pages/consultation/ConsultationRoom.tsx:61](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/consultation/ConsultationRoom.tsx#L61)

**Verification boundary:** Confirmed in source; deployment not inspected.

### C09 · Medium · Lab orders have zero pricing and lose legitimate numeric zero results

useLabOrders hardcodes totalAmount to zero and stores result_numeric as resultNumeric || null. It also accepts verifiedBy from the caller and completes orders without checking that every required result has been verified.

**Consequence:** Lab revenue and result values can be incorrect; incomplete or unverified work can be marked complete.

**Correction direction:** Derive test prices and verifier identity from trusted records, preserve zero with null-aware handling and enforce result completion rules.

**Evidence:** [src/hooks/useLabOrders.ts:33](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useLabOrders.ts#L33); [src/hooks/useLabOrders.ts:98](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useLabOrders.ts#L98); [src/hooks/useLabOrders.ts:117](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useLabOrders.ts#L117)

**Verification boundary:** Confirmed in source; deployment not inspected.

### C10 · High · Medical signing is not bound to an assigned case or an atomic signed record

atmri-doctor-sign requires a verified doctor but accepts any case_id. It does not establish case assignment or an explicit declaration-acceptance input. It ignores signature/update errors and increments donation counters separately, without a once-only signing transition.

**Consequence:** A case can be signed by an unrelated verified doctor; the case, signature and donation counts can disagree or be repeated.

**Correction direction:** Require case assignment and explicit acceptance of a versioned declaration, then persist the signature, case transition and counters atomically.

**Evidence:** [supabase/functions/atmri-doctor-sign/index.ts:13](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/atmri-doctor-sign/index.ts#L13); [supabase/functions/atmri-doctor-sign/index.ts:78](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/atmri-doctor-sign/index.ts#L78); [supabase/functions/atmri-doctor-sign/index.ts:108](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/atmri-doctor-sign/index.ts#L108)

**Verification boundary:** Confirmed in source; deployment not inspected.

### C11 · High · Offline clinical operations can be dropped, duplicated or synchronized under another session

useOfflineQueue stores unencrypted payloads by queue name rather than user/organization, retries inserts without an idempotent database key and deletes failed items after three tries. It reads a queue snapshot and later replaces the queue, so items added during synchronization can also be lost.

**Consequence:** Vitals or other queued operations can disappear, duplicate or be replayed after account switching; sensitive data remains on shared-device storage.

**Correction direction:** Use identity-scoped encrypted storage, durable failure/review states, serialized synchronization and server-side idempotency. Do not silently discard clinical writes.

**Evidence:** [src/hooks/useOfflineQueue.ts:25](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useOfflineQueue.ts#L25); [src/hooks/useOfflineQueue.ts:118](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useOfflineQueue.ts#L118); [src/hooks/useOfflineQueue.ts:129](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useOfflineQueue.ts#L129)

**Verification boundary:** Confirmed in source; deployment not inspected.


## Feature completeness and community

### F01 · High · Consent management reports grants/revocations without implementing them

NdhmConsentManager initializes canned consents. Revoke changes local state; granting only closes the form and shows a success message. There is no durable consent record or data-sharing authorization change in these actions.

**Consequence:** Users can believe they have controlled health-data access when no actual access change occurred.

**Correction direction:** Connect consent actions to durable, enforced permissions with expiry, scope and revocation; label the page as a prototype until then.

**Evidence:** [src/pages/abdm/NdhmConsentManager.tsx:19](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/abdm/NdhmConsentManager.tsx#L19); [src/pages/abdm/NdhmConsentManager.tsx:76](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/abdm/NdhmConsentManager.tsx#L76)

**Verification boundary:** Confirmed in source; deployment not inspected.

### F02 · High · ABHA/ABDM linking is a stub even when credentials are configured

abdm-link validates ID format and stores a local record. Without credentials it says mock_success; with credentials it says pending_real_push and explicitly leaves the real push unimplemented.

**Consequence:** The portal cannot establish that a health record was linked or exchanged through ABDM from this implementation.

**Correction direction:** Define and implement verified identity/consent/exchange flows; expose truthful queued, failed and completed states.

**Evidence:** [supabase/functions/abdm-link/index.ts:40](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/abdm-link/index.ts#L40); [supabase/functions/abdm-link/index.ts:46](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/abdm-link/index.ts#L46)

**Verification boundary:** Confirmed in source; deployment not inspected.

### F03 · High · Health Locker shows fabricated records and claims actions that do not occur

PatientHealthLocker uses a fixed document list. Email backup, share-with-doctor, download-all and offline caching handlers only show toasts. Upload does not open a file input or persist a document.

**Consequence:** Patients may believe their records are backed up, available offline or shared securely when they are not.

**Correction direction:** Implement a private document store with real download, consent and backup results, or clearly remove unsupported operational actions.

**Evidence:** [src/pages/patient/PatientHealthLocker.tsx:60](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/patient/PatientHealthLocker.tsx#L60); [src/pages/patient/PatientHealthLocker.tsx:81](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/patient/PatientHealthLocker.tsx#L81); [src/pages/patient/PatientHealthLocker.tsx:97](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/patient/PatientHealthLocker.tsx#L97)

**Verification boundary:** Confirmed in source; deployment not inspected.

### F04 · Medium · Duplicate-patient merge does not merge or dismiss any records

HmsPatientMerge holds static candidates without a setter. Merge and “not duplicate” actions show messages but do not change state or the database. The chosen primaryId is not used to perform the claimed transfer.

**Consequence:** Staff receive a false confirmation that appointments, prescriptions and bills moved to the surviving record.

**Correction direction:** Use a validated, transactional merge with an auditable survivor mapping and reversible review; disable the success claim until implemented.

**Evidence:** [src/pages/hms/HmsPatientMerge.tsx:44](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/hms/HmsPatientMerge.tsx#L44); [src/pages/hms/HmsPatientMerge.tsx:56](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/hms/HmsPatientMerge.tsx#L56)

**Verification boundary:** Confirmed in source; deployment not inspected.

### F05 · High · Security Controls settings do not save or enforce the advertised protections

The page displays IP restrictions, idle logout, concurrent sessions, phone masking and two-factor settings. saveConfig only shows success. Mock login/unmask logs drive alerts; no enforcement path is connected by these controls.

**Consequence:** Administrators can believe sensitive security protections are enabled when these switches have no operational effect.

**Correction direction:** Expose only implemented controls, persist real settings and verify server-side enforcement separately from the UI.

**Evidence:** [src/pages/hms/HmsSecurityControls.tsx:94](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/hms/HmsSecurityControls.tsx#L94); [src/pages/hms/HmsSecurityControls.tsx:42](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/hms/HmsSecurityControls.tsx#L42)

**Verification boundary:** Confirmed in source; deployment not inspected.

### F06 · High · Some booking hooks report success when persistence fails

usePatientAppointments adds a local appointment and returns true when the insert errors. Other operational hooks initialize with mock records and retain them on empty responses or failures; payroll is a concrete example.

**Consequence:** Users can receive a booked confirmation for an appointment that does not exist, and staff can mistake sample payroll for real results.

**Correction direction:** Make failure explicit, distinguish demo/empty/error modes, and display success only after durable confirmation.

**Evidence:** [src/hooks/usePatientAppointments.ts:93](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/usePatientAppointments.ts#L93); [src/hooks/usePatientAppointments.ts:95](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/usePatientAppointments.ts#L95); [src/hooks/hrms/useHrmsPayroll.ts:114](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/hrms/useHrmsPayroll.ts#L114)

**Verification boundary:** Confirmed in source; deployment not inspected.

### F07 · Medium · International booking and device connection features are local demonstrations

InternationalTeleconsult uses fixed doctors, fees and slots and only toasts on booking. SmartHomeVitals toggles a local connected boolean. Neither performs timezone-aware reservation or device authorization/synchronization.

**Consequence:** The promised booking or connection is not created, and the displayed vitals/availability are not live.

**Correction direction:** Mark these pages as demonstrations or connect them to actual partner/device systems with durable outcomes.

**Evidence:** [src/pages/global/InternationalTeleconsult.tsx:35](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/global/InternationalTeleconsult.tsx#L35); [src/pages/ai/SmartHomeVitals.tsx:36](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/ai/SmartHomeVitals.tsx#L36)

**Verification boundary:** Confirmed in source; deployment not inspected.

### F08 · Medium · Developer MCP and voice agent features simulate execution

executeMcpTool delays and returns simulated results; it is not a remote MCP service. HmsVoiceAgent adds predetermined transcripts on timers and announces an auto-booked appointment when a local call is ended.

**Consequence:** Integrations and clinical operations advertised as available cannot be relied on by partners or patients.

**Correction direction:** Keep discovery schemas separate from functioning integrations, and report real tool/booking execution outcomes only.

**Evidence:** [src/services/mcpServerService.ts:161](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/services/mcpServerService.ts#L161); [src/pages/hms/HmsVoiceAgent.tsx:72](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/hms/HmsVoiceAgent.tsx#L72)

**Verification boundary:** Confirmed in source; deployment not inspected.

### F09 · High · Paid membership activates directly and expired memberships still pass gates

Membership upserts active subscriptions for paid plans without payment or administrator confirmation. useMembershipGate calculates isExpired separately, but canAccess only compares tier levels. The membership write result is not checked before local activation.

**Consequence:** Premium access can be activated without payment and continue after expiry, or appear active despite a failed save.

**Correction direction:** Derive entitlements from verified payments/approved grants and enforce validity and expiry on the server and in the common gate.

**Evidence:** [src/pages/beyond/Membership.tsx:101](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/beyond/Membership.tsx#L101); [src/hooks/useMembershipGate.ts:90](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useMembershipGate.ts#L90); [src/hooks/useMembershipGate.ts:118](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useMembershipGate.ts#L118)

**Verification boundary:** Confirmed in source; deployment not inspected.

### F10 · High · Paid digital products expose their file location before purchase

DigitalStore selects all published product columns, including file_url. The supplied setup policy allows authenticated users to read published products; a separate policy called “Admins can manage products” merely checks that the caller is authenticated.

**Consequence:** Users can obtain paid asset locations without unlocking them, and any authenticated user can manage the catalog under the supplied policy.

**Correction direction:** Separate public catalog metadata from private assets and release short-lived download access only after server-validated entitlement.

**Evidence:** [src/pages/beyond/DigitalStore.tsx:134](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/beyond/DigitalStore.tsx#L134); [scripts/create_beyond_digital_store_tables.sql:50](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/scripts/create_beyond_digital_store_tables.sql#L50)

**Verification boundary:** Confirmed in source; deployment not inspected.

### F11 · High · Coin redemption trusts cached balances and client-supplied redemption amounts

useCoinStore deducts a cached coin balance, logs a transaction and creates a redemption in separate writes, with best-effort rollback. The supplied redemption policy only checks user_id; its trigger decrements stock without verifying coin payment or reserving availability.

**Consequence:** Concurrent redemptions can overspend; direct inserts can claim rewards without a trusted debit, and inventory can be exhausted incorrectly.

**Correction direction:** Implement one atomic server-side redemption that derives price, checks funds/stock and issues a uniquely recorded entitlement.

**Evidence:** [src/hooks/useCoinStore.ts:101](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useCoinStore.ts#L101); [scripts/create_coin_store_tables.sql:45](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/scripts/create_coin_store_tables.sql#L45); [scripts/create_coin_store_tables.sql:65](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/scripts/create_coin_store_tables.sql#L65)

**Verification boundary:** Confirmed in source; deployment not inspected.

### F12 · High · Doctor-only feed visibility is not enforced in database reads

The public feed policy checks only is_published. The later visibility column/constraint does not change this SELECT policy. Comment SELECT is also public without checking the parent post visibility.

**Consequence:** A post labelled visible only to doctors and its discussion can be read publicly under the supplied policies.

**Correction direction:** Enforce audience access on posts and all related comments/media, including direct API reads, before allowing confidential clinical discussions.

**Evidence:** [supabase/migrations/20260421064017_ee615dc0-cb4d-4fa8-9f7f-020552155f06.sql:19](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/migrations/20260421064017_ee615dc0-cb4d-4fa8-9f7f-020552155f06.sql#L19); [supabase/migrations/20260421065546_aa2b58c5-2570-4352-a437-27285a9e2fd1.sql:11](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/migrations/20260421065546_aa2b58c5-2570-4352-a437-27285a9e2fd1.sql#L11); [src/pages/Feed.tsx:80](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/Feed.tsx#L80)

**Verification boundary:** Confirmed in source; deployment not inspected.

### F13 · Medium · Feed poll UI has no voting workflow and conflicts with schema

The feed offers poll as a post type and renders vote counts, but no vote handler/persistence exists in the page. The supplied feed_posts_type_check permits only doctor_post, public_post and patient_question; the insert policy also omits poll.

**Consequence:** Poll creation can fail, and the displayed poll interface does not let a user cast a recorded vote.

**Correction direction:** Define a poll/vote schema with one vote per eligible user and align the client, constraints and policies.

**Evidence:** [src/pages/Feed.tsx:233](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/Feed.tsx#L233); [supabase/migrations/20260421065546_aa2b58c5-2570-4352-a437-27285a9e2fd1.sql:15](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/migrations/20260421065546_aa2b58c5-2570-4352-a437-27285a9e2fd1.sql#L15)

**Verification boundary:** Confirmed in source; deployment not inspected.

### F14 · Medium · Quiz answers and scoring are client-controlled

CourseQuiz selects correct_index with all question fields and submits its own score/passed boolean. useStudentQuiz accepts correct booleans in the submitted answers and awards coins from them. This is unsuitable as a trusted exam/reward source.

**Consequence:** Scores, certificates and quiz-derived rewards can be fabricated. This may be acceptable only for explicitly non-authoritative practice.

**Correction direction:** Keep answer keys server-side for assessed learning, calculate scores from submitted selections and issue rewards/certificates from verified attempts.

**Evidence:** [src/pages/learning/CourseQuiz.tsx:28](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/learning/CourseQuiz.tsx#L28); [src/pages/learning/CourseQuiz.tsx:45](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/learning/CourseQuiz.tsx#L45); [src/hooks/useStudentQuiz.ts:56](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useStudentQuiz.ts#L56)

**Verification boundary:** Confirmed in source; deployment not inspected.

### F15 · Medium · Quiz daily selection and streak progression do not implement their stated rules

The daily quiz limits the first active questions before shuffling, so it does not choose a new random set from the full bank. Streak progression increments for any new date without checking that the previous quiz was yesterday.

**Consequence:** Learners repeatedly see the same small set and can accumulate a “daily” streak after long gaps.

**Correction direction:** Select a defined daily question set server-side and calculate streaks using the chosen user timezone and consecutive-date rules.

**Evidence:** [src/hooks/useStudentQuiz.ts:32](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useStudentQuiz.ts#L32); [src/hooks/useStudentQuiz.ts:93](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useStudentQuiz.ts#L93)

**Verification boundary:** Confirmed in source; deployment not inspected.

### F16 · Medium · User-type onboarding routes distinct roles into doctor registration

WelcomeUserTypeDialog routes both Doctor/Student and Chemist/Retailer to /doctor/auth despite separate student/provider routes elsewhere. Doctor signup also requires a session immediately after signUp, which fails in projects requiring email confirmation before login.

**Consequence:** Users can enter the wrong onboarding process; confirmation-enabled signup can leave an auth account without its intended role/profile.

**Correction direction:** Define a shared, resumable onboarding state machine for each supported role, including email confirmation and document review.

**Evidence:** [src/components/auth/WelcomeUserTypeDialog.tsx:19](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/components/auth/WelcomeUserTypeDialog.tsx#L19); [src/pages/doctor/DoctorAuth.tsx:107](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/doctor/DoctorAuth.tsx#L107)

**Verification boundary:** Confirmed in source; deployment not inspected.


## Engineering and data architecture

### E01 · High · Advertised typecheck command does not check application files

package.json runs tsc --noEmit against the root config, which has files: [] and project references. This invocation does not build/check the referenced application project. In this audit the declared command exited successfully with no output while tsc -p tsconfig.app.json failed.

**Consequence:** Developers and CI can receive a false green signal while application source contains errors.

**Correction direction:** Make the check cover each application/config/server project explicitly and run it automatically on changes.

**Evidence:** [package.json:25](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/package.json#L25); [tsconfig.json:2](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/tsconfig.json#L2)

**Verification boundary:** Reproduced by command-line checks.

### E02 · Medium · Unused payment helper has a syntax error hidden from the production build

A nested block comment in src/lib/razorpay.ts ends the surrounding documentation comment early. The full compiler reports TS1128, TS1109 and TS1161. Import analysis found no importer, which explains why the production Vite bundle still builds.

**Consequence:** The source tree cannot pass a real application type check, and reusing this helper would break compilation.

**Correction direction:** Correct or remove the unused helper and keep the full source project in verification scope.

**Evidence:** [src/lib/razorpay.ts:7](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/lib/razorpay.ts#L7)

**Verification boundary:** Reproduced by parser and application compiler.

### E03 · High · Database setup is split between migrations and hundreds of manual-script dependencies

Static mapping found 550 source-referenced database object names. 277 have literal definitions only in manual scripts, while 27 have no literal table/view definition in supplied SQL. Examples include the HMS operational tables, HRMS, Beyond.Praxis and several Spine tables. These are definition-gap candidates, not proof that the live database lacks them.

**Consequence:** A new developer cannot reliably recreate the database from the migration path alone; environments can differ substantially.

**Correction direction:** Reconcile the deployed schema with versioned migrations, document one reproducible setup path and generate types from that schema.

**Evidence:** [scripts/create_hms_patient_opd.sql:7](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/scripts/create_hms_patient_opd.sql#L7); [scripts/RUN_ALL_BEYOND_PRAXIS.sql:1](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/scripts/RUN_ALL_BEYOND_PRAXIS.sql#L1)

**Verification boundary:** Confirmed in source; deployment not inspected.

### E04 · High · Migration history contains duplicate version prefixes and unsafe setup scripts

Four files use the same 20260715 version prefix, unlike the normal timestamped migration history. They include CREATE POLICY statements without idempotent drops and a setup script that automatically grants all roles to a fixed account. Their order and replay behavior are not a trustworthy migration sequence.

**Consequence:** Schema replay/history tracking can fail or differ from manual execution; setup can unexpectedly reintroduce insecure policies or privileged roles.

**Correction direction:** Use unique ordered migration versions, remove account-specific bootstrap logic from shared migrations and verify clean replay in an isolated database.

**Evidence:** [supabase/migrations/20260715_user_setup.sql:70](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/migrations/20260715_user_setup.sql#L70); [supabase/migrations/20260715_fix_rls.sql:14](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/migrations/20260715_fix_rls.sql#L14)

**Verification boundary:** Confirmed in source; deployment not inspected.

### E05 · High · Client calls backend functions that are absent from the repository

The client invokes extract-product-url and send-transactional-email, but neither has an implementation under supabase/functions. Literal SQL mapping also found no implementation for increment_usage, in addition to the missing custom-login functions.

**Consequence:** Product URL extraction, approval/account emails and some usage tracking cannot be reproduced from this codebase.

**Correction direction:** Commit the actual backend implementations or remove/feature-gate unsupported calls; maintain an API contract inventory.

**Evidence:** [src/pages/admin/AdminProductBuilder.tsx:131](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/admin/AdminProductBuilder.tsx#L131); [src/hooks/useProductApprovals.ts:90](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useProductApprovals.ts#L90)

**Verification boundary:** Confirmed in source; deployment not inspected.

### E06 · Medium · Type safety is bypassed on a large scale and lint cannot act as a release gate

Application strictness, unused checks and implicit-any checking are disabled. Lint reports 3,142 errors and 147 warnings, including 3,097 no-explicit-any errors. Casting the Supabase client to any bypasses the generated schema in many operational modules.

**Consequence:** Broken schema contracts and unchecked data shapes survive development; the current lint baseline is too noisy to be an effective gate.

**Correction direction:** Introduce typed domain contracts and a controlled lint baseline, restoring stricter checks incrementally as modules are validated.

**Evidence:** [tsconfig.app.json:19](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/tsconfig.app.json#L19); [src/hooks/useBilling.ts:37](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useBilling.ts#L37)

**Verification boundary:** Configuration confirmed; lint counts reproduced.

### E07 · High · Entity switching crashes because its provider is never mounted

HmsSwitchEntity calls useEntity, which throws outside EntityProvider. No EntityProvider usage exists in AppProviders, AppRoutes or HmsLayout. The provider itself starts with an empty array and exposes no load/add operation.

**Consequence:** The entity-switch page fails at render, and even adding the wrapper alone would not supply working organization switching.

**Correction direction:** Mount a real organization context backed by authorized memberships and ensure switching affects queries and writes.

**Evidence:** [src/pages/hms/HmsSwitchEntity.tsx:13](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/hms/HmsSwitchEntity.tsx#L13); [src/contexts/EntityContext.tsx:54](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/contexts/EntityContext.tsx#L54); [src/providers/AppProviders.tsx:18](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/providers/AppProviders.tsx#L18)

**Verification boundary:** Confirmed in source; deployment not inspected.

### E08 · High · Branch context is unmounted and cannot define a reliable tenant boundary

No BranchProvider usage exists in the supplied app. Consumers therefore receive the default Main Branch context. Even if mounted, it discovers branches from the first 100 patient rows, persists a freely chosen branch name in localStorage and does not validate membership.

**Consequence:** Branch selection is incomplete and can show or write data under the wrong branch label; a display name cannot provide organization security.

**Correction direction:** Use canonical organization/branch IDs and authorized memberships throughout queries, mutation payloads and database policies.

**Evidence:** [src/contexts/BranchContext.tsx:12](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/contexts/BranchContext.tsx#L12); [src/contexts/BranchContext.tsx:38](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/contexts/BranchContext.tsx#L38); [src/contexts/BranchContext.tsx:58](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/contexts/BranchContext.tsx#L58)

**Verification boundary:** Confirmed in source; deployment not inspected.

### E09 · Medium · An unused booking helper calls React hooks from an ordinary async function

BookAppointmentAction calls useAppointments and useNotifications from bookAppointmentWithNotification rather than a component/custom hook. Lint flags both calls. No current importer was found, so this is a broken dormant integration helper, not a reproduced live crash.

**Consequence:** Following the file’s instructions to use it from a click handler can trigger invalid hook behavior.

**Correction direction:** Expose a proper custom hook or pass plain service functions into the utility.

**Evidence:** [src/components/hms/BookAppointmentAction.ts:20](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/components/hms/BookAppointmentAction.ts#L20)

**Verification boundary:** Lint-confirmed; dormant in current import graph.

### E10 · High · Role definitions and patient/appointment models are fragmented

AppRole, HmsRole, RoleBasedGuard, HRMS roles, doctors permission fields, hms_staff and student admin roles use overlapping but different names and sources. The HMS fix script allows doctor/admin/therapist roles while UI guards describe nurses, pharmacists and lab staff. Public appointments, hms_appointments and hms_appointment_bookings are separate contracts.

**Consequence:** Access and workflow behavior depends on which page/helper is used; legitimate users can be denied and broad roles can receive excessive access.

**Correction direction:** Define one identity/permission model and explicit mappings for clinic patients, auth users, providers, appointments and encounters.

**Evidence:** [src/hooks/useUserRole.ts:4](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useUserRole.ts#L4); [src/hooks/useHmsAccess.ts:4](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useHmsAccess.ts#L4); [scripts/FIX_hms_staff_rls.sql:26](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/scripts/FIX_hms_staff_rls.sql#L26); [src/hooks/usePatientAppointments.ts:37](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/usePatientAppointments.ts#L37)

**Verification boundary:** Confirmed in source; deployment not inspected.

### E11 · Medium · Task tracking has competing stores, silent fallback and missing role scoping

useTaskData can silently fall back to in-memory sample tasks and loads tasks/recurring/schedules without role_context filtering; settings are hardcoded to general. The separate query-based store generates schedules by deleting all schedule rows for the user before recreating occurrences.

**Consequence:** Doctor/patient/general task contexts can mix, user work can disappear on refresh, and regeneration can destroy completion history.

**Correction direction:** Use one persisted task store with explicit context boundaries and incremental, idempotent recurring-occurrence generation.

**Evidence:** [src/pages/task-tracker/useTaskData.ts:10](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/task-tracker/useTaskData.ts#L10); [src/pages/task-tracker/useTaskData.ts:93](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/task-tracker/useTaskData.ts#L93); [src/pages/task-tracker/useTaskTrackerSupabase.ts:249](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/task-tracker/useTaskTrackerSupabase.ts#L249)

**Verification boundary:** Confirmed in source; deployment not inspected.

### E12 · Medium · Appointment preparation listens to a field not defined by the booking schema

useAutoLinkAppointments subscribes with doctor_user_id, whereas public appointments uses doctor_id referencing doctors.id. It also relies on an open browser subscription rather than a durable server event to create preparation tasks.

**Consequence:** New bookings can fail to generate preparation tasks, and no task is created while the relevant browser is closed.

**Correction direction:** Use the canonical doctor relationship and a durable, idempotent server-side event for booking side effects.

**Evidence:** [src/hooks/useAutoLinkAppointments.ts:34](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/hooks/useAutoLinkAppointments.ts#L34); [src/components/site/BookingDialog.tsx:91](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/components/site/BookingDialog.tsx#L91)

**Verification boundary:** Confirmed in source; deployment not inspected.

### E13 · High · Public provider views inherit restrictions that can empty the directory

A migration removes broad reads on doctors and creates limited public views. The next migration makes these views security_invoker, so the caller still needs access to the underlying restricted rows. Public search additionally queries doctors directly. No later doctor-wide public SELECT restoration appears in the supplied history.

**Consequence:** Anonymous directory/profile/search reads can return no providers under the supplied effective schema, even for approved public doctors.

**Correction direction:** Design a deliberately safe public projection with the intended permissions and test it as anonymous and authenticated non-provider users.

**Evidence:** [supabase/migrations/20260623112259_70f2a00e-af36-43b0-843a-be71dde04cb8.sql:7](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/migrations/20260623112259_70f2a00e-af36-43b0-843a-be71dde04cb8.sql#L7); [supabase/migrations/20260623112420_88a64671-f251-4dcb-a235-2460b577c185.sql:2](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/migrations/20260623112420_88a64671-f251-4dcb-a235-2460b577c185.sql#L2); [src/components/site/GlobalSearch.tsx:35](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/components/site/GlobalSearch.tsx#L35)

**Verification boundary:** Confirmed in source; deployment not inspected.


## Deployment, verification and operability

### O01 · High · Configured browser headers block integrations used by the code

Netlify CSP does not allow checkout.razorpay.com in script-src or Razorpay API requests in connect-src. It also omits Jitsi and MediaPipe CDN/model hosts. Permissions-Policy disables camera and geolocation globally while camera/scanner/posture/location features request them.

**Consequence:** Under these deployed headers, payment checkout and several video, image-analysis and location features are blocked by the browser.

**Correction direction:** Build a narrowly scoped policy from the actual integration inventory and verify headers and required browser capabilities in a later runtime phase.

**Evidence:** [netlify.toml:17](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/netlify.toml#L17); [netlify.toml:15](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/netlify.toml#L15); [src/pages/Checkout.tsx:48](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/Checkout.tsx#L48); [src/lib/posture/poseDetector.ts:10](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/lib/posture/poseDetector.ts#L10)

**Verification boundary:** Confirmed in source; deployment not inspected.

### O02 · High · Netlify handlers mix CommonJS with an ES-module package

All five Netlify .js handlers use exports.handler, and two use require, while the root declares type: module. A direct import of gemini-proxy reproduces “exports is not defined in ES module scope.” The final Netlify bundling configuration was not executed, so its packaging behavior remains a deployment check.

**Consequence:** Native Node loading fails; deployment packaging must explicitly transform or correctly identify these handlers.

**Correction direction:** Use consistent ESM handlers or a CommonJS extension/package boundary and validate a Netlify function build in CI.

**Evidence:** [package.json:5](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/package.json#L5); [netlify/functions/gemini-proxy.js:37](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/netlify/functions/gemini-proxy.js#L37)

**Verification boundary:** Native Node failure reproduced; hosted packaging unverified.

### O03 · High · Delivery and notification integrations claim success without their external action

create-delhivery-shipment generates a SIM waybill and dispatched timestamp when no token exists. The Netlify WhatsApp sender returns success: true in its unconfigured mode and logs phone/message content. The caller can therefore treat an absent integration as a successful dispatch/send.

**Consequence:** Orders or communications can appear completed without shipment/message delivery; patient details can enter logs.

**Correction direction:** Fail explicitly in production when an integration is unavailable, separate labelled sandbox behavior and minimize sensitive logging.

**Evidence:** [supabase/functions/create-delhivery-shipment/index.ts:56](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/supabase/functions/create-delhivery-shipment/index.ts#L56); [netlify/functions/whatsapp-send.js:31](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/netlify/functions/whatsapp-send.js#L31)

**Verification boundary:** Confirmed in source; deployment not inspected.

### O04 · Medium · Current tests and CI cannot establish portal correctness

The 18 unit tests pass, but four only assert true. The access-control “tests” do not exercise access control. The E2E workflow is manual-only and does not gate PRs; the repository has 65 browser spec files, but they were not executed because this review excludes site rendering/live workflows.

**Consequence:** A green unit result says little about the high-risk financial, permission or patient-data defects documented here.

**Correction direction:** Use meaningful database authorization/transaction tests and automatically gated checks, then add isolated feature journeys when runtime testing is authorized.

**Evidence:** [src/test/hooks/useAccessControl.test.ts:15](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/test/hooks/useAccessControl.test.ts#L15); [src/test/example.test.ts:5](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/test/example.test.ts#L5); [.github/workflows/e2e.yml:9](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/.github/workflows/e2e.yml#L9)

**Verification boundary:** Unit result reproduced; CI/test source reviewed.

### O05 · High · Locked dependencies have current vulnerability advisories

The full locked-graph npm audit returned 51 affected package entries: 2 critical, 20 high, 28 moderate and 1 low. Critical entries are Vitest/Tinypool in the test toolchain. Other entries include Vite, Lighthouse-related packages, CSS tooling and DOMPurify. These counts include propagated/transitive package entries, not 51 independent exploitable application vulnerabilities.

**Consequence:** Development/build/test tools and some dependencies need triage. Severity in npm audit alone does not establish a browser production exploit.

**Correction direction:** Assess reachability by tool/runtime, update deliberately, and recheck with regression coverage; do not blindly apply suggested major upgrades or downgrades.

**Evidence:** [package-lock.json:12387](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/package-lock.json#L12387); [package-lock.json:6205](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/package-lock.json#L6205)

**Verification boundary:** Registry audit captured on 13 October 2026.

### O06 · Medium · Bundle structure and global UI create avoidable loading overhead

The successful build emits 1,411 JavaScript asset files. Main CSS is approximately 527 kB before gzip; the main index chunk is about 451 kB, PDF vendor about 624 kB and task-tracker chunk about 357 kB. App mounts several assistants/search/notification overlays globally. These are build measurements, not measured user-load times.

**Consequence:** A very broad feature inventory increases payload, route maintenance and request complexity, especially on slower devices.

**Correction direction:** Measure real route loading later, isolate portal shells and load optional assistants/export tooling only where needed.

**Evidence:** [src/App.tsx:42](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/App.tsx#L42); [src/routes/lazyPages.ts:1](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/routes/lazyPages.ts#L1); [vite.config.ts:28](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/vite.config.ts#L28)

**Verification boundary:** Build output measured; runtime performance not tested.

### O07 · Medium · SEO prerendering is disconnected from the default deploy and crawler rules conflict

Netlify runs build rather than build:prerender, so public routes get the SPA HTML shell in this setup. robots.txt gives Googlebot/Bingbot their own Allow: / groups; exclusions in the wildcard group do not apply to those specific groups. /hms is also absent from those wildcard exclusions.

**Consequence:** Social previews and non-JavaScript consumers may receive generic metadata, while intended private-route crawler exclusions are inconsistent. Robots rules are not access control.

**Correction direction:** Align the public rendering/deploy strategy and explicit crawler groups, retaining authenticated server access protection for private data.

**Evidence:** [netlify.toml:2](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/netlify.toml#L2); [public/robots.txt:1](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/public/robots.txt#L1); [scripts/prerender.mjs:61](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/scripts/prerender.mjs#L61)

**Verification boundary:** Confirmed in source; deployment not inspected.

### O08 · Medium · Admin layout and several interactive controls need accessibility/mobile work

AdminLayout has a fixed w-64 sidebar and unconditional ml-64 content without a mobile alternative. Many operational pages use tiny text, icon-only actions and labels without an explicit control association. QRBarcodeScanner’s camera interval never actually decodes a frame.

**Consequence:** Mobile and keyboard/screen-reader use is fragile, and camera scanning cannot complete as advertised. Contrast and rendered layout were not measured.

**Correction direction:** Validate named controls, associated labels, keyboard flows and responsive portal navigation; implement a real decoder or remove the inactive camera mode.

**Evidence:** [src/pages/admin/AdminLayout.tsx:245](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/admin/AdminLayout.tsx#L245); [src/pages/hms/stock/ai/QRBarcodeScanner.tsx:62](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/src/pages/hms/stock/ai/QRBarcodeScanner.tsx#L62)

**Verification boundary:** Confirmed in source; deployment not inspected.

### O09 · Medium · Historical reports and setup documents are not reliable evidence of current readiness

The repository’s prior reports claim production test/build successes or describe older secret-exposure paths. Current source and reproducible checks show different behavior: dormant helpers, moved proxies, placeholder tests and later insecure SQL. Setup examples also use inconsistent environment-variable names.

**Consequence:** Future work can inherit false assurances or revive obsolete integration instructions.

**Correction direction:** Tie reports and setup guidance to a branch, commit, environment and actual check artifacts, and consolidate the supported deployment configuration.

**Evidence:** [TEST_REPORT_CONSOLIDATED.md:16](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/TEST_REPORT_CONSOLIDATED.md#L16); [VAPT_REPORT.md:26](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/VAPT_REPORT.md#L26); [.env.example:7](https://github.com/curesure4u-bot/ayuzee/blob/18c3c8580c665c6a711a12d5fda699b4a21da1f6/.env.example#L7)

**Verification boundary:** Confirmed in source; deployment not inspected.


## 6. Cross-cutting architectural diagnosis

The central problem is that the portal has accumulated independently generated screens faster than it has developed consistent domain contracts. Hospital operations, the public marketplace, patient accounts, education, community, productivity and personal-development products share a frontend and database client but often use separate patient identifiers, appointments, roles, reward balances and settings.

Direct database mutations in pages/hooks make simple CRUD convenient, but critical multi-record operations require trusted authorization, validation, atomic state transitions and recovery. Row-level security is the actual boundary when the browser has database access. The supplied policies and manual fixes do not consistently establish that boundary.

The size of the interface is therefore not a useful measure of readiness. A clinical or financial module is only complete when its data ownership, authorization, state transitions, error handling and evidence are coherent from input through persistence and later reads. The mock/fallback pattern currently hides gaps in several of those layers.

For the intended Ayurveda community portal, the public community/discovery/account flows need clear ownership and purpose. The hospital system alone occupies hundreds of files and introduces much stronger data and workflow requirements. Future phase boundaries should be based on those domain boundaries and shared dependencies. The detailed phase plan is intentionally deferred until this report is reviewed.

## 7. What remains unverified

The following cannot be established from source alone:

- Which migrations and manual SQL fixes were actually executed, their order, effective grants/policies and any uncommitted database objects.
- Which functions are deployed, whether their gateway JWT settings differ from the repository, and whether missing implementations exist outside Git.
- Current privileged accounts, test credentials, email-confirmation settings, provider rate limits and administrative security settings.
- Live payment capture/refund/settlement behavior, real integration credentials, webhook configuration and hosted function packaging.
- Actual browser headers, camera/video/device behavior, mobile layout, accessibility, loading time and full user journeys.
- Clinical validity of medical reference content and AI outputs; this report flags implementation/provenance problems rather than providing a medical validation or a legal compliance certification.

The next planning discussion can use the finding IDs and module map without losing these boundaries. No deployment, database migration, account change, payment, external message or source-code repair was performed.

## 8. Supporting files

- **Ayuzee_Technical_Appendix.md:** folder coverage, schema gaps, function/API inventory, advisory references and check details.
- **Ayuzee_Findings.json:** the 79 findings in a structured form, retaining severity, impact, correction direction and source references.
- **Ayuzee_Review_Inventory.json:** per-file static coverage, queries, function calls, route declarations and evidence mapping. Automated markers are candidates, not standalone confirmed bugs.

Technical reference basis: [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security), [Supabase API keys and service-role behavior](https://supabase.com/docs/guides/getting-started/api-keys), and [Node package module formats](https://nodejs.org/api/packages.html). These explain the framework behavior used in the policy and module-format findings; the findings themselves are supported by the pinned source.
