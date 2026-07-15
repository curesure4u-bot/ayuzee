# Ayuzee — AYUSH Healthcare Super-App

Ayuzee is a comprehensive AYUSH (Ayurveda, Yoga, Unani, Siddha, Homeopathy) healthcare super-app built as a React SPA. It covers telemedicine, e-commerce, hospital management, multi-system prescriptions, AI-assisted diagnostics, patient journeys, learning, and community features — all backed by Supabase.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Configuration Files](#configuration-files)
  - [Vite](#vite-viteconfigts)
  - [TypeScript](#typescript)
  - [Tailwind CSS](#tailwind-css-tailwindconfigts)
  - [shadcn/ui](#shadcnui-componentsjson)
  - [PostCSS](#postcss-postcssconfigjs)
  - [ESLint](#eslint-eslintconfigjs)
  - [Vitest](#vitest)
  - [Playwright](#playwright-playwrightconfigts)
  - [Supabase](#supabase-supabaseconfigtoml)
- [Routing Overview](#routing-overview)
- [Supabase Backend](#supabase-backend)
  - [Edge Functions](#edge-functions)
  - [Database Migrations](#database-migrations)
- [Testing](#testing)
  - [Unit Tests](#unit-tests-vitest)
  - [E2E Tests](#e2e-tests-playwright)
- [CI/CD](#cicd)
- [Deployment](#deployment)

---

## Features

| Domain | Capabilities |
|---|---|
| **Telemedicine** | Online consultation rooms, pre/post consultation forms, doctor profiles, appointment booking |
| **E-commerce** | Ayurvedic product shop, Panchakarma packages, surgical supplies, treatment kits, cart, checkout, order tracking, prescription uploads |
| **Vaidya HMS** | Full hospital management system — patients, OPD, IPD admissions, billing, inventory, reception queue, MIS reports, analytics |
| **Multi-system Prescriptions** | Ayurveda, Siddha, Unani, Homeopathy, Yoga prescriptions from a single platform |
| **Diagnosis Tools** | Prakriti assessment, symptom checker, gut health, spine assessment, Jihva/Netra/Mutra Bindu Pariksha, Ashtavidha examination |
| **Homeopathy Module** | Repertory browser, Materia Medica, case-taking, AI remedy differentiation, Sehgal method analysis |
| **AI Features** | Clinical decision support, AI scribe, pre-consult summary, dietary chart suggestions, Panchakarma planning, Hijama planning, voice commands |
| **Acupuncture & Tung Points** | Reference databases for Tung acupuncture, 300/50 disease protocols, acupoints & uses |
| **Learning Platform** | Courses, webinars, quizzes, blog, library, certificates for students and practitioners |
| **Therapist Portal** | Therapist onboarding, session management, availability, earnings, Panchakarma venue rooms |
| **Admin Panel** | Super admin dashboard, user/doctor/student/product management, commissions, payouts, gamification, ASTG management, formulary analytics |
| **Community Feed** | Social feed, posts, saved content |
| **Referral & Rewards** | Referral program, wallet, Ayuzee Money, gamification |
| **ABDM Integration** | Ayushman Bharat Digital Mission health ID linking |
| **Payments** | Razorpay integration (order creation, payment verification, refunds, payout settlement) |
| **Notifications** | WhatsApp, email queue, EOD reports, session reminders |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18.3 |
| **Language** | TypeScript 5.8 |
| **Build Tool** | Vite 5.4 (SWC compiler) |
| **Routing** | React Router DOM 7.9 |
| **State / Data Fetching** | TanStack React Query 5.83 |
| **UI Components** | shadcn/ui (Radix UI primitives) |
| **Styling** | Tailwind CSS 3.4, tailwindcss-animate, @tailwindcss/typography |
| **Animations** | Framer Motion 12 |
| **Charts** | Recharts 2.15 |
| **Forms** | React Hook Form 7.61 + Zod 3.25 |
| **Backend / Auth / DB** | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| **Payments** | Razorpay (via Supabase Edge Functions) |
| **PDF Generation** | jsPDF 4.2, jspdf-autotable, html2canvas |
| **Date Handling** | date-fns 3.6 |
| **Markdown** | react-markdown + remark-gfm |
| **QR Codes** | qrcode 1.5 |
| **Unit Testing** | Vitest 3.2, @testing-library/react |
| **E2E Testing** | Playwright 1.61 |
| **Linting** | ESLint 9.32, eslint-plugin-react-hooks, eslint-plugin-react-refresh |
| **Package Manager** | npm (bun.lock present for Bun compatibility) |

---

## Project Structure

```
ayuzee-main/
├── .env                        # Local environment variables (not committed)
├── .env.e2e.example            # Template for E2E test credentials
├── .github/
│   └── workflows/
│       └── e2e.yml             # GitHub Actions E2E pipeline
├── e2e/                        # Playwright end-to-end tests
│   ├── helpers/auth.ts
│   ├── auth.spec.ts
│   ├── booking.spec.ts
│   ├── checkout.spec.ts
│   ├── doctor-prescription.spec.ts
│   ├── mis-drilldown-params.spec.ts
│   ├── password-reset.spec.ts
│   └── suggestion-autocomplete.spec.ts
├── public/                     # Static assets served as-is
│   ├── prakriti/               # Prakriti assessment images
│   └── *.pdf                   # Acupuncture/AYUSH reference PDFs
├── scripts/
│   ├── extract_afi.py          # AFI formulary extraction
│   ├── extract_api.py          # API formulary extraction
│   ├── fetch-prerender-routes.mjs
│   └── prerender.mjs           # Static pre-rendering script
├── src/
│   ├── App.tsx                 # Root component (BrowserRouter, nav, routes)
│   ├── assets/                 # Hero images
│   ├── components/
│   │   ├── admin/              # Admin panel components
│   │   ├── ai/                 # AI feature components
│   │   ├── astg/               # ASTG (Ayurvedic Standard Treatment Guidelines)
│   │   ├── auth/               # Auth flows
│   │   ├── common/             # Shared UI (ErrorBoundary, PageLoader, SEO)
│   │   ├── dashboard/          # Patient dashboard components
│   │   ├── diagnosis/          # Diagnostic tool components
│   │   ├── doctor/             # Doctor portal components
│   │   ├── health/             # Health conditions components
│   │   ├── hms/                # Hospital Management System components
│   │   ├── library/            # Learning library components
│   │   ├── onboarding/         # Onboarding flows
│   │   ├── parasurgical/       # Para-surgical procedure components
│   │   ├── patient/            # Patient-facing components
│   │   ├── posture/            # Posture analysis components
│   │   ├── shop/               # E-commerce components
│   │   ├── site/               # Site-wide components (Nav, Footer, Chatbot, Voice)
│   │   ├── ui/                 # shadcn/ui base components
│   │   └── vaidya/             # Vaidya (practitioner) components
│   ├── contexts/
│   │   └── CartContext.tsx     # Shopping cart state
│   ├── hooks/                  # Custom React hooks
│   ├── integrations/
│   │   └── supabase/           # Supabase client + generated types
│   ├── lib/                    # Utilities, query client setup
│   ├── pages/                  # Page components (lazy-loaded)
│   ├── providers/
│   │   └── AppProviders.tsx    # Global provider stack
│   └── routes/
│       ├── AppRoutes.tsx       # Route definitions (~180+ routes)
│       └── lazyPages.ts        # Lazy-loaded page map
├── supabase/
│   ├── config.toml             # Supabase project config + Edge Function JWT settings
│   ├── functions/              # 50+ Deno Edge Functions
│   └── migrations/             # 195 SQL migration files
├── components.json             # shadcn/ui configuration
├── eslint.config.js
├── index.html
├── package.json
├── playwright.config.ts
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.app.json
└── vite.config.ts
```

---

## Prerequisites

- **Node.js** 20 or later
- **npm** 10+ (or Bun as an alternative)
- A **Supabase** project (see [Environment Variables](#environment-variables))

---

## Getting Started

```bash
# 1. Clone the repository
git clone <repo-url>
cd ayuzee-main

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.e2e.example .env.e2e   # for E2E tests only
# Edit .env with your Supabase credentials (see Environment Variables below)

# 4. Start the development server
npm run dev
# App runs at http://localhost:8080
```

---

## Environment Variables

### Application (`.env`)

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>
VITE_SUPABASE_PROJECT_ID=<your-project-ref>
```

All three are required at build time. They are prefixed with `VITE_` so Vite exposes them to the browser bundle. The anon key is safe to commit if your Supabase Row Level Security policies are correctly configured — do not commit the service role key.

### E2E Tests (`.env.e2e`)

Copy `.env.e2e.example` to `.env.e2e` and fill in real values (never commit this file):

```env
E2E_BASE_URL=http://localhost:8080          # URL of the running app under test

# Existing test accounts in your Supabase project
E2E_PATIENT_EMAIL=patient@example.com
E2E_PATIENT_PASSWORD=changeme
E2E_DOCTOR_EMAIL=doctor@example.com
E2E_DOCTOR_PASSWORD=changeme

# Optional — used by signup spec; defaults to a random address
E2E_NEW_SIGNUP_EMAIL=signup+manual@ayuzee-test.dev

# Optional — used by suggestion-autocomplete spec
E2E_SUPABASE_URL=https://<project-ref>.supabase.co
E2E_SUPABASE_ANON_KEY=...

# Used by password-reset spec — generates recovery links via admin API
# NEVER commit a real value; set only in CI secrets
E2E_SUPABASE_SERVICE_ROLE_KEY=...
```

### GitHub Actions Secrets / Variables

The CI pipeline reads these from GitHub repository secrets (`secrets.*`) or variables (`vars.*`), falling back to `.env`:

| Name | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project reference ID |
| `E2E_PATIENT_EMAIL` | Test patient account email |
| `E2E_PATIENT_PASSWORD` | Test patient account password |
| `E2E_DOCTOR_EMAIL` | Test doctor account email |
| `E2E_DOCTOR_PASSWORD` | Test doctor account password |
| `E2E_NEW_SIGNUP_EMAIL` | Optional email for signup spec |

---

## Available Scripts

```bash
npm run dev              # Start Vite dev server on port 8080 (hot reload)
npm run build            # Production build → dist/
npm run build:prerender  # Production build + static pre-rendering
npm run build:dev        # Development-mode build
npm run prerender        # Run static pre-rendering only (requires built app)
npm run preview          # Preview the production build locally
npm run lint             # Run ESLint across all source files
npm run test             # Run Vitest unit tests (single run)
npm run test:watch       # Run Vitest in watch mode
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # Open Playwright UI mode (interactive)
```

---

## Configuration Files

### Vite (`vite.config.ts`)

```ts
// Key settings:
server: {
  host: "::",   // binds to all interfaces (IPv4 + IPv6)
  port: 8080,
  hmr: { overlay: false }
}

// Path alias
resolve.alias: { "@": "./src" }

// Build target
build.target: "es2020"

// Manual chunk splitting (keeps initial bundle lean)
vendor-supabase  → @supabase/*
vendor-query     → @tanstack/*
vendor-router    → react-router*
vendor-charts    → recharts, d3-*
vendor-motion    → framer-motion
vendor-pdf       → jspdf, html2canvas
vendor-radix     → @radix-ui/*
vendor-react     → react-dom, react
```

The `lovable-tagger` component tagger plugin is active only in development mode.

---

### TypeScript

**`tsconfig.json`** — workspace root config, references `tsconfig.app.json`.

**`tsconfig.app.json`** — application compiler settings:

| Option | Value |
|---|---|
| `target` | `ES2020` |
| `lib` | `ES2020`, `DOM`, `DOM.Iterable` |
| `module` | `ESNext` |
| `moduleResolution` | `bundler` |
| `jsx` | `react-jsx` |
| `strict` | `false` (relaxed for large existing codebase) |
| `noEmit` | `true` (Vite handles transpilation) |
| `paths` | `"@/*"` → `["./src/*"]` |
| `types` | Includes `vitest/globals` |

---

### Tailwind CSS (`tailwind.config.ts`)

- **Dark mode**: `class` strategy
- **Content paths**: `./src/**/*.{ts,tsx}`, `./pages/**/*.{ts,tsx}`, `./components/**/*.{ts,tsx}`, `./app/**/*.{ts,tsx}`
- **Plugins**: `tailwindcss-animate`, `@tailwindcss/typography`

**Custom color tokens** (all driven by CSS variables):

| Token | Purpose |
|---|---|
| `primary`, `secondary`, `destructive`, `muted`, `accent` | Core semantic palette |
| `admin.*` | Admin panel sidebar, danger, warning, success states |
| `sidebar.*` | App sidebar theming |
| `footer.*` | Footer background, foreground, panels, pills |
| `mystic`, `earth`, `indigo` | Brand accent colors for AYUSH theming |
| `success`, `info`, `warning` | Status/alert colors |

**Custom fonts**:
- `font-display` → Fraunces, Georgia, serif (headings)
- `font-sans` → Inter, system-ui, sans-serif (body)

**Custom border radius**:
- `lg` → `var(--radius)`
- `md` → `calc(var(--radius) - 2px)`
- `sm` → `calc(var(--radius) - 4px)`

---

### shadcn/ui (`components.json`)

```json
{
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils":      "@/lib/utils",
    "ui":         "@/components/ui",
    "lib":        "@/lib",
    "hooks":      "@/hooks"
  }
}
```

All shadcn/ui components are imported from `@/components/ui/`. Add new components with `npx shadcn-ui@latest add <component>`.

---

### PostCSS (`postcss.config.js`)

```js
plugins: {
  tailwindcss: {},
  autoprefixer: {},
}
```

---

### ESLint (`eslint.config.js`)

- Base: `@eslint/js` recommended
- TypeScript: `typescript-eslint`
- React plugins: `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Globals: browser environment

---

### Vitest

Configured inline via `vitest.config.ts` (or `vite.config.ts`):

| Option | Value |
|---|---|
| `environment` | `jsdom` |
| `globals` | `true` (no need to import `describe`, `it`, `expect`) |
| `include` | `src/**/*.{test,spec}.{ts,tsx}` |
| `setupFiles` | `@testing-library/jest-dom` matchers |

Run unit tests:
```bash
npm run test        # single run
npm run test:watch  # watch mode
```

---

### Playwright (`playwright.config.ts`)

| Setting | Value |
|---|---|
| `testDir` | `./e2e` |
| `fullyParallel` | `false` (shared cart/booking state) |
| `workers` | `1` |
| `retries` | `2` in CI, `0` locally |
| `baseURL` | `E2E_BASE_URL` env var (default `http://127.0.0.1:4173`) |
| `browser` | Chromium only (Desktop Chrome) |
| `trace` | Retained on failure |
| `screenshot` | Captured on failure |
| `video` | Retained on failure |
| `viewport` | 1280 × 900 |

**Payment testing**: Razorpay must be in **TEST MODE**. Use test card `4111 1111 1111 1111`, any future expiry, any CVV, OTP `1234`.

E2E test specs:
- `auth.spec.ts` — sign-up, sign-in, session persistence
- `booking.spec.ts` — appointment booking flow
- `checkout.spec.ts` — cart and checkout flow
- `doctor-prescription.spec.ts` — doctor creating prescriptions
- `mis-drilldown-params.spec.ts` — MIS report drilldown URL parameters
- `password-reset.spec.ts` — password reset email flow
- `suggestion-autocomplete.spec.ts` — search/autocomplete behavior

---

### Supabase (`supabase/config.toml`)

```toml
project_id = "saphetdusyfrcduzsouk"

# Edge Function JWT verification overrides
[functions.auth-email-hook]    verify_jwt = false
[functions.dev-api]            verify_jwt = false
[functions.process-email-queue] verify_jwt = true
[functions.homeo-materia-ai]   verify_jwt = false
[functions.homeo-seed]         verify_jwt = false
[functions.homeo-seed-1000]    verify_jwt = false
[functions.homeo-rubric-finder] verify_jwt = false
[functions.homeo-seed-mm200]   verify_jwt = false
```

All other Edge Functions default to `verify_jwt = true` (require a valid Supabase JWT).

---

## Routing Overview

The app uses React Router v7 with all pages lazy-loaded (`React.lazy` + `Suspense`). Navigation is hidden automatically for `/admin/*`, `/homeo/*`, and live consultation rooms.

| Path prefix | Portal / Feature |
|---|---|
| `/` | Public landing page |
| `/auth`, `/login`, `/reset-password` | Authentication |
| `/dashboard/*` | Patient dashboard (profile, appointments, orders, wallet, reports) |
| `/doctor/*` | Doctor portal (appointments, patients, prescriptions, feed, earnings) |
| `/vaidya/*` | Vaidya HMS (full hospital management, prescriptions, Panchakarma, Yoga, analytics) |
| `/admin/*` | Admin panel (users, products, reports, master management, gamification) |
| `/student/*` | Student portal (courses, webinars, jobs, research, certificates) |
| `/therapist/*` | Therapist portal (sessions, availability, earnings) |
| `/venue/*` | Venue/treatment center management |
| `/homeopathy/*` | Homeopathy module (repertory, Materia Medica, case-taking) |
| `/diagnosis/*` | Diagnostic tools (Prakriti, symptoms, gut health, spine, Jihva, Netra, Mutra Bindu) |
| `/shop/*` | E-commerce (products, conditions, Panchakarma, surgicals, prescription, checkout) |
| `/treatments/*` | Treatment systems (Acupuncture, Tung Points, 300/50 diseases, Homeopathy) |
| `/learning/*` | Learning platform (courses, webinars, quizzes, blogs, library) |
| `/doctors`, `/clinics`, `/therapists` | Provider directories |
| `/consultation/:id/*` | Consultation room and forms |
| `/feed/*` | Community feed |
| `/astg/*` | Ayurvedic Standard Treatment Guidelines reference |
| `/health-conditions/*` | Health condition articles |
| `/queue-display/:branchId` | Token display screen for clinic queues |
| `/provider/*`, `/partner/*` | Provider and partner onboarding |

---

## Supabase Backend

The Supabase client is initialised in `src/integrations/supabase/client.ts` with session persistence via `localStorage` and automatic token refresh.

```ts
import { supabase } from "@/integrations/supabase/client";
```

### Edge Functions

50+ Deno-based Edge Functions in `supabase/functions/`:

**AI & Clinical**

| Function | Purpose |
|---|---|
| `ai-cds` | Clinical decision support |
| `ai-gateway` | Central AI routing gateway |
| `ai-guidance-generate` | Patient guidance generation |
| `ai-hijama-plan` | Hijama (cupping) therapy planning |
| `ai-panchakarma-plan` | Panchakarma treatment planning |
| `ai-parasurgical-assistant` | Para-surgical procedure assistant |
| `ai-pre-consult-summary` | Pre-consultation summary generation |
| `ai-scribe` | AI clinical documentation scribe |
| `astg-clinical-assistant` | ASTG reference assistant |
| `diet-chart-suggest` | Dietary chart suggestions |
| `homeopathy-ai-analysis` | Homeopathy case analysis |
| `homeo-constitutional-summary` | Constitutional remedy summary |
| `homeo-materia-ai` | Materia Medica AI lookup |
| `homeo-mind-analyze` | Mental/emotional rubric analysis |
| `homeo-remedy-differentiate` | Remedy differentiation |
| `homeo-rubric-finder` | Repertory rubric search |
| `homeo-sehgal-analyze` | Sehgal method analysis |
| `vaidya-daily-insight` | Daily clinical insights for Vaidyas |
| `voice-command` | Voice command processing |

**Diagnostics**

| Function | Purpose |
|---|---|
| `jihva-pariksha-interpret` | Tongue examination interpretation |
| `mutra-bindu-interpret` | Urine drop examination |
| `netra-pariksha-interpret` | Eye examination interpretation |
| `spine-interpret` | Spine assessment analysis |
| `swasthavritta-interpret` | Preventive health assessment |
| `swasthavritta-notify-vaidya` | Notify Vaidya of new assessment |
| `panchakarma-check-conflicts` | Contraindication checker |

**Payments & Finance**

| Function | Purpose |
|---|---|
| `razorpay-create-order` | Create Razorpay payment order |
| `razorpay-verify-payment` | Verify payment signature |
| `razorpay-refund` | Process refunds |
| `process-payout` | Process practitioner payouts |
| `settle-therapy-session` | Settle revenue for therapy sessions |
| `credit-referral` | Credit referral rewards to wallet |

**Logistics & Comms**

| Function | Purpose |
|---|---|
| `create-delhivery-shipment` | Create Delhivery shipping order |
| `delhivery-track` | Track shipments via Delhivery |
| `send-whatsapp` | Send WhatsApp notifications |
| `process-email-queue` | Process outbound email queue |
| `send-eod-report` | Send end-of-day clinic reports |
| `panchakarma-session-reminder` | Session reminder notifications |
| `auth-email-hook` | Custom Supabase auth email hook |

**Integrations**

| Function | Purpose |
|---|---|
| `abdm-link` | ABDM (Ayushman Bharat Digital Mission) health ID integration |
| `atmri-doctor-sign` | ATMRI doctor digital signature |
| `backlink-refresh` | SEO backlink refresh |
| `dev-api` / `dev-api-keys` | Developer API access |

**Data & Seeding**

| Function | Purpose |
|---|---|
| `extract-afi-formulation` | Extract AFI formulary data |
| `extract-api-formulation` | Extract API formulary data |
| `homeo-seed` / `homeo-seed-1000` / `homeo-seed-mm200` | Homeopathy database seeding |
| `panchakarma-seed` | Panchakarma reference data seeding |
| `seed-astg-data` | ASTG treatment guidelines seeding |

### Database Migrations

The `supabase/migrations/` directory contains **195 SQL migration files** spanning April–July 2026, covering all schema versions from initial schema through the latest features. Migrations follow Supabase's timestamp-prefixed naming convention (`YYYYMMDDHHMMSS_<id>.sql`).

---

## Testing

### Unit Tests (Vitest)

```bash
npm run test        # single run, outputs pass/fail summary
npm run test:watch  # interactive watch mode during development
```

Test files follow the pattern `src/**/*.{test,spec}.{ts,tsx}`. Uses `@testing-library/react` with `jsdom` environment and `jest-dom` matchers.

### E2E Tests (Playwright)

**Setup:**

1. Build the app: `npm run build`
2. Start the preview server: `npm run preview` (runs on port 4173)
3. Copy and fill in E2E credentials: `cp .env.e2e.example .env.e2e`

```bash
npm run test:e2e       # headless Chromium
npm run test:e2e:ui    # interactive Playwright UI (recommended for debugging)
```

Reports and traces are written to `playwright-report/` and `test-results/`. On failure, screenshots, videos, and traces are automatically captured.

---

## CI/CD

GitHub Actions runs the full E2E suite on every push and pull request to `main` (`.github/workflows/e2e.yml`):

1. **Checkout** code (Node 20, npm cache)
2. **Install** dependencies (`npm ci`) and Playwright browsers (Chromium only)
3. **Prepare** Vite environment — reads Supabase credentials from GitHub secrets/variables, falls back to committed `.env`
4. **Build** production app (`npm run build`)
5. **Start** Vite preview server on port 4173
6. **Verify** the `/auth` route responds correctly
7. **Run** Playwright E2E tests (`npm run test:e2e`)
8. **Upload** Playwright HTML report (14-day retention) and test artifacts — traces, videos, screenshots (7-day retention)

Retries: 2 in CI, 0 locally. Timeout: 30 minutes.

---

## Deployment

The project is built with [Lovable](https://lovable.dev) (`lovable-tagger` is present as a dev dependency) and is designed to be deployed as a static SPA. The built output lands in `dist/`.

For pre-rendering static routes (SEO):
```bash
npm run build:prerender
```

This runs the production build followed by `scripts/prerender.mjs`, which fetches routes from Supabase and generates pre-rendered HTML pages.

**SPA routing**: Ensure your hosting platform redirects all `404` responses to `index.html` so React Router can handle client-side navigation.
