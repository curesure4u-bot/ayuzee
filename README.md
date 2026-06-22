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

### Quick setup checklist

Tick these off before your first CI run:

**Patient account**
- [ ] Signed up at `/auth` with a dedicated test email (e.g. `e2e-patient@yourdomain.com`)
- [ ] Email confirmation link clicked (or auth confirmation disabled in dev)
- [ ] Can sign in and land on `/dashboard` without redirect
- [ ] Email + password saved as `E2E_PATIENT_EMAIL` / `E2E_PATIENT_PASSWORD`

**Doctor account**
- [ ] Signed up at `/doctor/auth` with a dedicated test email (e.g. `e2e-doctor@yourdomain.com`)
- [ ] Email confirmed
- [ ] `doctor` row exists in `public.user_roles` for this user (SQL above)
- [ ] Can sign in and reach the doctor portal home without redirect
- [ ] Email + password saved as `E2E_DOCTOR_EMAIL` / `E2E_DOCTOR_PASSWORD`

**Signup mailbox**
- [ ] `E2E_NEW_SIGNUP_EMAIL` is a mailbox you own that accepts `+tag` aliases

**Other**
- [ ] Razorpay keys are in **test mode** for the target environment
- [ ] `.env.e2e` filled locally; `bun run test:e2e` passes all four specs
- [ ] Same values added as GitHub Actions secrets

If every box is ticked, the workflow will pass on the next PR.



### Rotating credentials

Change the password in the app, update the GitHub secret (`Settings → Secrets and variables → Actions → <secret> → Update`), and update your local `.env.e2e`. The next workflow run picks it up automatically.

### Where to find the report

After a workflow run, open the run page in GitHub → **Artifacts** → download `playwright-report-<run-id>` and open `index.html`. Failed runs also upload `test-results-<run-id>` with traces, videos, and screenshots.

### Troubleshooting common E2E failures

Open the HTML report first — Playwright's trace viewer shows the exact step that failed, the DOM at that moment, and the network log. Then match the symptom below.

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `auth.spec.ts` → "Invalid login credentials" | Wrong email/password, or secret not set in CI | Re-check `E2E_PATIENT_EMAIL` / `E2E_PATIENT_PASSWORD` locally, then in GitHub secrets. Log in manually at `/auth` to confirm. |
| Login appears to succeed but test times out waiting for `/dashboard` | Email not confirmed → backend keeps the session unverified | Click the confirmation link in the inbox, or disable "Confirm email" in Lovable Cloud auth settings for the dev environment. |
| Signup spec fails on "email already registered" | The randomised suffix collided, or a previous run wasn't cleaned up | Change `E2E_NEW_SIGNUP_EMAIL` to a fresh `+tag` alias. The spec appends a random suffix, but the base must be a mailbox that accepts `+tag` (Gmail, Fastmail, etc.). |
| `doctor-prescription.spec.ts` redirects away from `/doctor/...` | The doctor user has no `doctor` row in `public.user_roles` | Run the SQL from the "Doctor account" section above. Verify with `select role from public.user_roles where user_id = '<uuid>';`. |
| Doctor login works locally but fails in CI | CI is pointing at a different environment (e.g. prod) than where you seeded the role | Either set `E2E_BASE_URL` to the env you seeded, or seed the doctor role in the env CI targets. Roles do **not** sync between dev and prod. |
| `checkout.spec.ts` → Razorpay modal never opens | `razorpay-create-order` edge function failing — keys missing or in the wrong mode | In Lovable Cloud → Secrets, confirm `RAZORPAY_KEY_ID` starts with `rzp_test_` and `RAZORPAY_KEY_SECRET` is the matching test secret. Live keys (`rzp_live_`) will be rejected by the test card. |
| Razorpay modal opens but card `4111 1111 1111 1111` is declined | Account is in **live** mode, or the card/OTP values were edited | Use exactly: card `4111 1111 1111 1111`, expiry `12/30`, CVV `123`, OTP `1234`. Switch the Razorpay dashboard to Test Mode. |
| `booking.spec.ts` → "no time slots available" | Doctor has no availability seeded for the test date | Add availability for the `E2E_DOCTOR_*` user covering today + 7 days, or relax the selector to pick the first enabled slot. |
| All specs fail immediately with `ECONNREFUSED localhost:8080` | `E2E_BASE_URL` unset **and** the workflow's `webServer` couldn't start Vite | Check the "Run Playwright tests" step log for the Vite startup error. Usually a missing build secret or a TypeScript error. |
| Tests pass locally, fail in CI only | Env-var mismatch between `.env.e2e` and GitHub secrets | Diff them. Common miss: setting `E2E_BASE_URL` locally to a preview URL but leaving it unset in CI (so CI tries `localhost:8080`). |
| Flaky timeouts on first run after long idle | Cold-started edge functions or DB | Re-run the job once. If it persists, bump `expect`/`action` timeouts in `playwright.config.ts` to 15s. |

If none of these match, download `test-results-<run-id>` and open the `.zip` trace in [trace.playwright.dev](https://trace.playwright.dev) — it almost always points straight at the failing assertion or network call.

### Debugging locally: exact commands

Run these from the project root. They assume `.env.e2e` is filled in and Playwright browsers are installed (one-time: `bunx playwright install --with-deps chromium`).

```bash
# 1. Full suite, headless — capture trace + screenshot + video on every failure
#    and write an HTML report to ./playwright-report
bunx playwright test \
  --trace=retain-on-failure \
  --screenshot=only-on-failure \
  --video=retain-on-failure \
  --reporter=html

# 2. Open the HTML report from the last run (auto-opens in your browser)
bunx playwright show-report

# 3. Re-run only the failed tests from the last run
bunx playwright test --last-failed

# 4. Single spec, single project, force trace on every attempt (not just failures)
bunx playwright test e2e/checkout.spec.ts --project=chromium --trace=on

# 5. Step through a test interactively (Playwright Inspector pauses on each action)
PWDEBUG=1 bunx playwright test e2e/auth.spec.ts --project=chromium

# 6. Headed + slow-motion to watch the browser drive the app
bunx playwright test e2e/booking.spec.ts --headed --project=chromium --workers=1

# 7. UI mode — time-travel debugger with watch mode and per-step DOM snapshots
bunx playwright test --ui

# 8. Open a saved trace zip (local file or downloaded CI artifact)
bunx playwright show-trace test-results/checkout-checkout-flow-chromium/trace.zip

# 9. Record selectors against your running app
bunx playwright codegen http://localhost:8080

# 10. Verbose protocol/browser logs when a test hangs before any assertion runs
DEBUG=pw:api bunx playwright test e2e/auth.spec.ts --project=chromium
```

Where output lands after a run:

- `playwright-report/index.html` — the same HTML report uploaded by CI. Open with `bunx playwright show-report`.
- `test-results/<test-name>/` — per-failure folder containing `trace.zip`, `test-failed-1.png`, and `video.webm`.
- `test-results/.last-run.json` — used by `--last-failed`.

If you prefer `npm`/`pnpm`, swap `bunx` for `npx`/`pnpm exec` — the Playwright flags are identical.



