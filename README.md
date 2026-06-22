# Welcome to your Lovable project

[![E2E Tests](../../actions/workflows/e2e.yml/badge.svg)](../../actions/workflows/e2e.yml)

TODO: Document your project here

## E2E tests in GitHub Actions

The Playwright suite (`.github/workflows/e2e.yml`) runs on every PR and push to `main`. It reads its config from repository secrets.

### Add the secrets

In GitHub: **Settings → Secrets and variables → Actions → New repository secret**. Add each of the following:

| Secret | Required | Purpose |
| --- | --- | --- |
| `E2E_BASE_URL` | Optional | URL the tests hit. Defaults to `http://localhost:8080` (the workflow boots Vite). Set this to your preview/staging URL (e.g. `https://ayuzee.lovable.app`) to test the deployed app instead. |
| `E2E_PATIENT_EMAIL` | Required | Email of a seeded **patient** test account. |
| `E2E_PATIENT_PASSWORD` | Required | Password for the patient test account. |
| `E2E_DOCTOR_EMAIL` | Required | Email of a seeded **doctor** test account. |
| `E2E_DOCTOR_PASSWORD` | Required | Password for the doctor test account. |
| `E2E_NEW_SIGNUP_EMAIL` | Required | A mailbox the signup spec can send to (e.g. a `+tag` alias on a Gmail you control). The spec appends a random suffix per run. |

> Use **dedicated test accounts**, not real user data. Razorpay must be in **test mode** for the checkout spec — use card `4111 1111 1111 1111`, expiry `12/30`, CVV `123`, OTP `1234`.

### Run locally

Copy the example file and fill in the same values:

```bash
cp .env.e2e.example .env.e2e
# edit .env.e2e
bun run test:e2e          # headless
bun run test:e2e:ui       # Playwright UI mode
```

### Create the test accounts

The patient and doctor accounts must exist in the backend **before** the workflow runs — the specs sign in with them, they don't create them. Do this once per environment (dev and prod each have their own user table).

#### 1. Patient account

1. Open the app at the URL you'll point `E2E_BASE_URL` at (preview, staging, or production).
2. Go to `/auth` → **Sign up**. Use an email you control, e.g. `e2e-patient@yourdomain.com`, and a strong unique password.
3. Confirm the email (check inbox, click the link). If you've disabled email confirmation in Lovable Cloud for the dev environment, the account is active immediately.
4. Complete the patient onboarding flow so the account has a `profiles` row and the patient role. Verify by signing in and reaching `/dashboard` without being redirected.
5. Save the email + password as `E2E_PATIENT_EMAIL` / `E2E_PATIENT_PASSWORD`.

#### 2. Doctor account

Doctors require an extra role row, so signup alone isn't enough.

1. Sign up at `/doctor/auth` with a controlled email like `e2e-doctor@yourdomain.com` and a strong password.
2. Confirm the email.
3. Grant the doctor role. Open **Backend → Database → SQL editor** and run:
   ```sql
   insert into public.user_roles (user_id, role)
   select id, 'doctor'::app_role from auth.users where email = 'e2e-doctor@yourdomain.com'
   on conflict do nothing;
   ```
   (Use `'admin'` instead if your doctor portal checks for admin; adjust the enum value to whatever your `app_role` defines.)
4. Save the email + password as `E2E_DOCTOR_EMAIL` / `E2E_DOCTOR_PASSWORD`.

#### 3. Signup mailbox

`E2E_NEW_SIGNUP_EMAIL` is the *base* address the signup spec uses. The spec appends a random suffix per run (e.g. `yourname+e2e-ab12cd@gmail.com`), so a Gmail-style `+tag` alias works perfectly and nothing needs pre-creating. Just pick a mailbox you own.

### Verify the accounts before pushing

Run the suite locally against the same `E2E_BASE_URL` you'll use in CI:

```bash
cp .env.e2e.example .env.e2e   # fill in the same values you'll add as GitHub secrets
bun run test:e2e -- --project=chromium
```

All four specs should pass. If `auth.spec.ts` fails on login, the credentials are wrong or the email isn't confirmed. If `doctor-prescription.spec.ts` redirects away from the doctor portal, the role row is missing — re-run the SQL above.

### Rotating credentials

Change the password in the app, update the GitHub secret (`Settings → Secrets and variables → Actions → <secret> → Update`), and update your local `.env.e2e`. The next workflow run picks it up automatically.

### Where to find the report

After a workflow run, open the run page in GitHub → **Artifacts** → download `playwright-report-<run-id>` and open `index.html`. Failed runs also upload `test-results-<run-id>` with traces, videos, and screenshots.

