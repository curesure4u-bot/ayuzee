# Feature flags — hiding incomplete features

Phase 7 uses the existing `feature_flags` Supabase table to hide placeholder routes and navigation in production.

## How it works

1. Flags are stored in `feature_flags` (toggle via **Admin → Settings → Feature Flags**).
2. `FeatureFlagsProvider` loads flags on app start (`src/providers/FeatureFlagsProvider.tsx`).
3. `FeatureRoute`, `FeatureGate`, and nav filters hide incomplete UI when `enabled = false`.

## Development vs production

| Environment | Behaviour |
| --- | --- |
| `import.meta.env.DEV` | All flags treated as **enabled** (see everything locally) |
| Production | Uses DB values; placeholders default to **disabled** |

To test production gating locally, set in `.env`:

```env
VITE_HIDE_INCOMPLETE=true
```

## Placeholder flags (default: off)

| Key | Hides |
| --- | --- |
| `atmri_campaigns_enabled` | ATMRI/Ayush Help campaign pages + nav |
| `atmri_csr_enabled` | CSR partnership pages + nav |
| `atmri_impact_dashboard_enabled` | Impact dashboard pages + nav |
| `atmri_doctor_leaderboard_enabled` | Doctor leaderboard pages + nav |
| `symptom_checker_enabled` | `/diagnosis/symptoms` + SiteNav link |
| `nadi_pareeksha_enabled` | Nadi Pareeksha card on `/diagnosis` |
| `admin_roadmap_enabled` | `/admin/roadmap` + admin nav |
| `hms_pharmacy_orders_enabled` | Admin pharmacy orders placeholder |
| `hms_ip_admissions_enabled` | Admin IP admissions placeholder |
| `vitals_tracking_enabled` | Patient dashboard vitals widget |
| `gamification_portal_enabled` | `/gamification/*` routes |
| `app_waitlist_enabled` | Footer app waitlist strip |
| `therapist_schedule_enabled` | Therapist weekly schedule stub |

## Enabling a feature for staging

1. Apply migration: `supabase db push`
2. Admin → Settings → Feature Flags → toggle on
3. Or SQL: `UPDATE feature_flags SET enabled = true WHERE key = 'symptom_checker_enabled';`

## Code references

- Manifest: `src/lib/features.ts`
- Route gating: `src/components/common/FeatureRoute.tsx`
- Section gating: `src/components/common/FeatureGate.tsx`
