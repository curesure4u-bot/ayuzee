# AGENTS.md

## Cursor Cloud specific instructions

Ayuzee is a single-page **frontend** app (Vite + React 18 + TypeScript + shadcn/ui) that talks
directly to a **hosted Supabase / Lovable Cloud backend** (URL + anon key are committed in `.env`).
There is no local backend or database to run — the dev server alone is enough to exercise auth,
the shop, dashboards, etc. against the live backend. The `supabase/` directory holds edge functions
and migrations for that hosted project; you do not need to run them locally for normal frontend work.

### Package manager / tooling
- **Bun** is the package manager (`bun.lock`). It is installed at `~/.bun/bin` and on `PATH` in
  interactive shells (added to `~/.bashrc` by the installer). The startup update script runs
  `bun install`.
- Node 22 is present; Bun is used for scripts. Use `bun run <script>` (or `bunx`).

### Common commands (defined in `package.json`)
- Dev server: `bun run dev` → Vite on **port 8080** (`http://localhost:8080`). Bind is `::`.
- Lint: `bun run lint` — NOTE: the repo currently has many pre-existing eslint errors (mostly in
  `supabase/functions/**`); a non-zero exit is expected and is not caused by your setup.
- Unit tests: `bun run test` (Vitest, jsdom). Only 2 spec files exist today.
- Build: `bun run build` (Vite). Succeeds with chunk-size / dynamic-import warnings only.
- E2E: `bun run test:e2e` (Playwright). Requires seeded patient/doctor accounts + Razorpay test
  keys — see `README.md` and `.env.e2e.example`. Not runnable without those secrets; the Playwright
  browsers also need `bunx playwright install --with-deps chromium` first.

### Notes
- Signup works end-to-end against the hosted backend and auto-logs-in (no email confirmation gate
  in the current dev environment), redirecting new patients to the `/dashboard` onboarding wizard.
- `lovable-tagger` only runs in development mode (see `vite.config.ts`).
