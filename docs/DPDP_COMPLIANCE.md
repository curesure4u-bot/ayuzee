# DPDP compliance guide

Ayuzee aligns with India's **Digital Personal Data Protection Act, 2023 (DPDP)** and existing IT rules. This document maps platform controls to data-principal rights.

## Data Fiduciary

- **Entity:** AL SHIFA AYUSH HEALTH CARE PVT LTD (Ayuzee)
- **Grievance Officer:** `company_info.grievance_email` (default `complaints@ayuzee.com`)
- **Policy source of truth:** `company_content` slug `privacy` (rendered on `/privacy-policy`)

## Consent ledger

Table: `user_consent_records`

| Purpose | When recorded |
| --- | --- |
| `terms`, `privacy` | Signup (`Auth.tsx`) |
| `health_processing` | Patient onboarding step 2 |
| `marketing` | Newsletter / app waitlist |
| `cookies_essential`, `cookies_analytics` | Cookie banner |

Client helper: `src/lib/consent.ts`  
Policy version: `POLICY_VERSION` in code + `policy_version` column.

## Data principal rights

| Right | Implementation |
| --- | --- |
| Access / correction | `PatientProfile.tsx` |
| Portability | `downloadUserDataExport()` in `src/lib/dataExport.ts` |
| Erasure | `deletion_requests` table + profile UI |
| Withdraw consent | Marketing opt-out via grievance email; analytics via cookie banner |
| Grievance | Privacy page + profile link to Grievance Officer |

## Cookie & analytics

- Banner: `src/components/legal/CookieConsentBanner.tsx`
- Sentry (`VITE_SENTRY_DSN`) initializes only after analytics consent
- Essential cookies: session, sidebar state

## Clinical disclaimers

Shared component: `src/components/legal/ClinicalDisclaimer.tsx`

Variants: `wellness`, `ai-cds`, `ayush` — applied on diagnosis flows; extend to remaining AI/clinical modules incrementally.

## Newsletter

`newsletter_subscribers.marketing_consent` must be `true` (enforced by RLS). Footer forms require explicit checkbox.

## Admin workflows

1. **Deletion requests:** Review `deletion_requests` where `status = 'pending'`
2. **Consent audit:** Query `user_consent_records` by `user_id` or `email`
3. **Policy updates:** Edit via Admin → Company (`DoctorCompany.tsx`) or SQL migration

## Staging checklist

```bash
npm run audit:security
npm test
```

Manual checks:

- [ ] Signup records `terms` + `privacy` consent
- [ ] Cookie banner blocks Sentry until accepted
- [ ] Newsletter rejects insert without `marketing_consent`
- [ ] Deletion request creates row and deduplicates pending requests
- [ ] Data export downloads JSON for signed-in patient

## Not in scope (follow-ups)

- NDHM Consent Manager (ABHA / health-record sharing) — roadmap P4
- Automated erasure across all PHI tables (manual admin process for now)
- Age verification / parental consent flow for minors under 18
