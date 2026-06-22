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

### Where to find the report

After a workflow run, open the run page in GitHub → **Artifacts** → download `playwright-report-<run-id>` and open `index.html`. Failed runs also upload `test-results-<run-id>` with traces, videos, and screenshots.
