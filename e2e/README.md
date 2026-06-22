# Ayuzee end-to-end tests (Playwright)

## Setup

```bash
bunx playwright install chromium
cp .env.e2e.example .env.e2e   # then fill in real values
```

Required env vars (load with `set -a; source .env.e2e; set +a` before running):

| Variable | Purpose |
| --- | --- |
| `E2E_BASE_URL` | App URL. Defaults to `http://localhost:8080`. |
| `E2E_PATIENT_EMAIL` / `E2E_PATIENT_PASSWORD` | Existing confirmed patient account. |
| `E2E_DOCTOR_EMAIL` / `E2E_DOCTOR_PASSWORD` | Existing confirmed doctor account. |
| `E2E_NEW_SIGNUP_EMAIL` | Optional. Random throwaway address used by the signup spec. |

Razorpay **must be in TEST mode**. The checkout spec uses:

- Card `4111 1111 1111 1111`, expiry `12/30`, CVV `123`, OTP `1234`.

## Running

```bash
bunx playwright test                      # full suite
bunx playwright test e2e/auth.spec.ts     # single file
bunx playwright test --ui                 # interactive UI mode
bunx playwright show-report               # open last HTML report
```

The config starts `npm run dev` automatically; set `E2E_NO_SERVER=1` to skip
when the dev server is already running.

## Specs

- `auth.spec.ts` — signup, login, bad-password error.
- `booking.spec.ts` — book a video consultation and reach Razorpay checkout.
- `checkout.spec.ts` — add to cart → checkout → pay with Razorpay test card.
- `doctor-prescription.spec.ts` — doctor logs in and issues a prescription.

## Notes

These specs use loose, role-based selectors so they survive small UI tweaks.
If a selector breaks, prefer adding a `data-testid` to the component over
making the selector more rigid.
