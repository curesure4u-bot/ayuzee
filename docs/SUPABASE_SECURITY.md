# Supabase security & staging guide

## Staging environment (recommended)

1. Create a **separate Supabase project** for Cursor/staging (do not test RLS changes on production).
2. Link locally: `supabase link --project-ref <staging-ref>`
3. Apply migrations: `supabase db push`
4. Deploy edge functions to staging first: `supabase functions deploy`
5. Point Cursor `.env` at staging keys; run E2E against staging URL.

Promote to production only after `npm run audit:security` passes and manual RLS checks succeed.

## Edge function secrets (Supabase Dashboard → Edge Functions → Secrets)

| Secret | Used by |
| --- | --- |
| `SUPABASE_URL` | All functions (auto) |
| `SUPABASE_ANON_KEY` | JWT validation |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin/seed functions |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Payment functions |
| `INTERNAL_WEBHOOK_SECRET` | Internal triggers (`send-whatsapp`, `settle-therapy-session`) |
| `LOVABLE_API_KEY` | AI functions (legacy) |
| `OPENAI_API_KEY` | AI functions (preferred for production migration) |
| `ALLOWED_ORIGINS` | CORS allowlist, comma-separated |

### CORS allowlist example

```
ALLOWED_ORIGINS=https://ayuzee.com,https://www.ayuzee.com,http://localhost:8080
```

## JWT gateway (`supabase/config.toml`)

Functions with `verify_jwt = false` must implement their own auth:

| Function | Auth mechanism |
| --- | --- |
| `auth-email-hook` | Lovable webhook signature |
| `dev-api` | `x-api-key` hashed in DB |

All other user-facing functions should use `verify_jwt = true` **and** `requireUser()` in code.

## PHI storage rules

- **Never** call `getPublicUrl()` on private buckets (`prescriptions`, `patient-files`, `posture-images`, …).
- Store **storage paths** in the database, not public URLs.
- Use `createSignedUrl()` when admins or owners need to view files.
- Client helpers: `src/lib/storage.ts`

## RLS audit

Run in Supabase SQL Editor:

```
supabase/scripts/audit-rls.sql
```

Or locally:

```bash
npm run audit:security
```

## AI provider migration

Edge functions use `supabase/functions/_shared/ai.ts`:

1. Set `OPENAI_API_KEY` in Supabase secrets
2. Functions fall back to `LOVABLE_API_KEY` until migration is complete
3. Migrate remaining functions from direct `ai.gateway.lovable.dev` calls incrementally
