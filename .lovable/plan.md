## Fix Playwright E2E to use production build

### Changes to `playwright.config.ts`

1. **`use.baseURL`**: `process.env.E2E_BASE_URL ?? "http://127.0.0.1:4173"`
2. **`webServer`**:
   - `command`: `"npm run build && npm run preview -- --host 127.0.0.1 --port 4173"`
   - `url`: `process.env.E2E_BASE_URL ?? "http://127.0.0.1:4173"`
   - `reuseExistingServer`: `!process.env.CI`
   - `timeout`: `120_000`
3. Update the header comment's `E2E_BASE_URL` default note to `http://127.0.0.1:4173`.

### Verification

- Run `npm run test:e2e` after the change and report results.
- Do not touch `Auth.tsx` or any selectors.

### Why

Running against `npm run dev` in CI misses production-only issues (env inlining, lazy-chunk resolution). The production `preview` server mirrors what users actually get and makes the missing `#email` failure mode deterministic.
