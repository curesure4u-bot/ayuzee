# Ayuzee — login and feature scope review

Prepared 4 November 2026 for Sai and management. This is a decision inventory,
not authorization to remove features. No application code, settings, handlers,
accounts or stored documents were removed or changed for this review.

## Evidence and limits

- Current `Sai-Branch` source and relevant original Git source were inspected.
- The live `https://ayuzee.com/login` page was read without signing in. Its five
  entry choices and Telegram/voice/AI controls were directly observed.
- Existing Supabase Edge Function deployment metadata was refreshed read-only.
  Deployed/ACTIVE means a handler exists; it does not establish a working user
  journey, valid provider configuration, actual usage or a billing charge.
- The browser approval check initially hit an account usage limit while opening
  the live patient sign-in form; that action was not executed. After the stated
  limit window passed and Sai requested continuation, a read-only retry found the
  browser connection unavailable through both documented observation methods.
  No sign-in or form submission occurred. Live form/provider verification remains
  open; source inspection is not represented as a successful production login.
- Our branch's account and service routes remain behind the preview boundary.
  Existing production UI, proposed branch changes and deployed backend functions
  are therefore separate states. Source presence alone is not production readiness.

## Login methods versus account entry screens

| Item | Evidence/status |
| --- | --- |
| Email + password | Implemented sign-in method in current branch and inspected original account code; shared Supabase Auth backend |
| Email signup confirmation | Account lifecycle flow, not a second passwordless-login method; real production delivery remains unverified |
| Password reset by email link | Recovery flow, not a separate login method; keep separate from optional marketing/notification email |
| Email token/PKCE callback | Handles signup confirmation and recovery; `verifyOtp` here is not phone/SMS OTP sign-in |
| Google/Facebook/Apple login | No application sign-in flow found in current branch; live Supabase provider toggles were not verified in this review |
| Phone/SMS/WhatsApp OTP login | No application sign-in flow found; phone fields and ABHA-linking verification labels are not Ayuzee login methods |
| Telegram login | No application sign-in flow found; Telegram is a messaging/bot integration |
| Passwordless magic-link login | Shared email-template file exists, but no user-facing magic-link sign-in request flow was found |
| SSO/passkey login | No application sign-in flow found in current branch |
| Anonymous login | Disabled in the saved read-only Supabase dashboard inspection dated 4 November |

The live login picker currently groups entry screens into:

1. Patient / Individual.
2. Doctor / Chemist / Student / Retailer.
3. Hospital / Clinic / Resort.
4. Panchakarma Therapist.
5. Admin / Super Admin.

The new branch instead shares the account form across patient, doctor, student,
therapist, provider and venue owner entry links, plus administrator sign-in.
There is also an HMS entry route and a legacy Beyond module email/password form.
Manufacturer and delegated administrator permissions are assigned roles, not
public self-registration options. The system's 17 account roles and 12 hospital
membership roles are permission contracts, not separate authentication methods.

**Possible simplification:** one shared email/password sign-in page, signup and
password recovery, followed by role-appropriate workspaces. Consolidating entry
screens must preserve the role checks; choosing a screen must never grant access.

## Removal/defer/keep decision list

All decisions below are pending management review. IDs can be used in a reply,
for example: "Remove R01 and R02; defer R06; keep R04."

| ID | Feature group | What the decision covers | Verified scope/status |
| --- | --- | --- | --- |
| R01 | WhatsApp integration | Share/contact links, automated appointment/medicine/follow-up messages, prescription/report sharing, templates and notification settings | Present across source. Local Netlify send/webhook handlers are disabled preview stubs. `send-whatsapp` is not in the seven currently listed Supabase deployments. End-to-end WhatsApp delivery is not verified. |
| R02 | Telegram integration | Floating Telegram button, general health bot commands, bot documents/messages, webhook/send paths and spine pain/check-in bot | Floating link observed live. `telegram-webhook` and `swift-handler` are deployed; the latter was identified as a spine Telegram handler in the earlier narrow source inspection. Local Netlify Telegram handlers are disabled stubs. Bot delivery is not tested. |
| R03 | Optional custom PDF exports | Task lists, monthly calendars/Gantt charts, education/certificate exports, reference/disease handouts and nonessential report downloads | Custom `jsPDF` helpers and browser-print actions exist in source; no blanket released-workflow acceptance is claimed. |
| R04 | Operational document generation | Invoices/bills, prescriptions, diet/yoga plans, clinical assessments/reports and HR payslips | Source exists across operational modules. Decide per document type; deleting every PDF helper would affect more than optional downloads. |
| R05 | Browser/SMS push and external reminders | Browser notification permissions, local notifications, Firebase/SMS scaffolding and notification-channel choices | Some helper code is placeholder/simulated. In-app community notifications are a separate locally implemented feature and need not be removed with external push. |
| R06 | General AI chat widgets | Floating website assistant, general AI assistant and embeddable chat widgets | AI controls observed on the live login page; source includes multiple widget implementations. Their exact released routing/provider behaviour is not fully verified. |
| R07 | Clinical AI and scribe tools | AI notes/summaries, transcription, triage, guidance/plans, homeopathy analysis and AI-enabled reference/drug tools | Four related deployed functions are listed below. Many additional source handlers are not deployed. Manual clinical reference data should be considered separately from AI calls. |
| R08 | Voice controls | Site voice commands, speech responses, task-tracker dictation and AI voice-command backend code | Voice control observed live; browser speech and voice-command code exists. External transcription is a separate dependency from ordinary browser speech. |
| R09 | Video consultation integration | Jitsi room links/embed and video consultation UI | Source exists; no working production call/participant authorization claim is made. Removing it changes the consultation service scope. |
| R10 | Bulk data/report exports | CSV reports, backup/export screens and related operational exports | Source exists; FHIR export is listed separately under R12. PowerPoint library is installed as a dev dependency, but no application import was found. |
| R11 | QR and location tools | QR attendance, patient/medicine labels, QR utilities, map embeds/directions and geofence-related UI | Source exists; their production accuracy and user journeys are not fully verified. |
| R12 | Government health connectors | ABHA/ABDM linking, DigiLocker, consent, FHIR export and eSanjeevani bridge screens | Several inspected screens use sample content or local success handlers. They must not be described as verified government integrations. These are not alternative Ayuzee login methods. |
| R13 | Optional analytics/SEO services | Google Analytics/PostHog helper code, backlink/SEO dashboards and Semrush refresh integration | GA scripts were observed in the earlier public HTML inspection; other provider code alone does not prove configuration or use. Keep error monitoring as a separate decision. |
| R14 | Developer API platform | API-key management, external developer API endpoints, widget generation and integration tooling | Source exists; `dev-api` and `dev-api-keys` are not in the listed deployed function set. |
| R15 | Rewards and gamification | Points, coins, badges, leaderboards, streaks and reward redemption | Large source area; Phase 4 acceptance is pending. These are not necessary for ordinary account sign-in or RBAC. |
| R16 | Wallets, payouts and referral incentives | Wallet/reward balances, commissions, affiliate/referral credit and payouts | Source exists. If removed, separate it from essential customer order payment/refund reconciliation. No real financial operation was performed in this review. |
| R17 | Learning/certification subsystem | Courses, quizzes, competitions, progress, student certificates and related administration | Source exists; decide whether education is part of the business scope. |
| R18 | Jobs/recruitment subsystem | Job board, AI matching, job-description generation, fraud checks and job-alert digests | Source exists; optional if recruitment is outside the agreed product scope. |
| R19 | Standalone task/project tracker | Variable/monthly tasks, Gantt views, voice entry, calendars and messaging reminders | Source exists. This can be scoped independently of medical care/community; PDF exports overlap R03. |
| R20 | Demo/test deployment | `hyper-function` demonstration endpoint | Listed ACTIVE; earlier narrow source inspection identified a sample greeting handler. Confirm no dependency before removing its deployment. |

R15–R19 are broader product-scope choices rather than just third-party
integrations. This is a grouped management inventory, not a claim that every
button or provider configuration in the repository has been exercised.

## PDF decisions in more detail

Custom generation, ordinary browser printing, viewing an existing PDF and
uploading a document are distinct capabilities.

- Custom generation uses `jspdf`, `jspdf-autotable`, and in some screens
  `html2canvas`. It includes bills, prescriptions, reports and handouts.
- Print/Save PDF buttons call browser `window.print()` in certificates, reports,
  prescriptions, payslips and task/calendar screens. Those do not all require the
  custom PDF libraries.
- PDF viewing and professional-document uploads are separate from generation.
  A decision to remove PDF creation must not silently delete uploaded records,
  certificates or licence documents.
- A scoped decision might remove task/calendar/education PDFs while retaining
  invoices/prescriptions or ordinary printing. Management should specify which.

## Currently listed Supabase deployments

Read-only list checked 4 November; none were invoked, modified or deleted:

| Handler | Deployment | Relationship to review |
| --- | --- | --- |
| telegram-webhook | ACTIVE, v17 | R02 general Telegram bot |
| swift-handler | ACTIVE, v4 | R02 spine Telegram handler, per earlier source inspection |
| ai-gateway | ACTIVE, v4 | R06/R07 AI gateway |
| ai-scribe | ACTIVE, v3 | R07 clinical scribe |
| drug-interaction-check | ACTIVE, v3 | R07 drug/reference tooling; AI and database paths require separate dependency review |
| classical-reference-search | ACTIVE, v3 | R07 reference search; do not assume the entire search capability requires AI |
| hyper-function | ACTIVE, v2 | R20 demo endpoint |

A disabled button or local stub does not shut down a deployed webhook. Conversely,
a source directory does not prove that an endpoint is deployed or functioning.
No actual usage, costs, external bot registrations or provider credentials were
inspected. No messages, emails, medical records or provider test calls were sent.

## Core functions to distinguish from optional extras

Account sign-in/recovery, server-side RBAC, data isolation, security/audit records
and error monitoring should be reviewed independently from optional customer
features. Removing notification marketing does not require removing password
reset emails. Removing rewards does not settle ordinary customer payment/refunds.
Removing optional report exports does not require dropping clinical records.

Once IDs are approved, dependency mapping should cover navigation/components,
shared services, function deployments, scheduled work, provider webhooks and
unused packages. Retain existing data/files unless a separate data-removal scope
is explicitly approved. This review does not itself authorize any removal.

## Principal source references

- `src/features/accounts/actions.ts`, `AccountPicker.tsx`, `model.ts` and the
  existing account/role guards.
- `src/services/messagingService.ts`, `src/services/integrations.ts`,
  `src/components/common/TelegramFloat.tsx` and Netlify preview handlers.
- `supabase/functions/telegram-webhook`, `send-whatsapp`, `ai-gateway`, `ai-scribe`,
  `voice-command`, `drug-interaction-check` and `classical-reference-search`.
- `src/lib/pdfGenerator.ts`, `src/lib/pdf/ayuzeePdf.ts`, `src/lib/astg-search.ts`,
  `src/components/astg/PatientHandoutDialog.tsx` and
  `src/pages/task-tracker/exportPdf.ts`.
- `src/pages/abdm`, `src/hooks/useAbdm.ts`, `src/lib/previewPolicy.ts`,
  `docs/release/auth-dashboard-2026-11-04.json` and `package.json`.
