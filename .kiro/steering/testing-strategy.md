---
inclusion: auto
---

# Ayuzee.com Comprehensive Testing Strategy

## Testing Layers & Tools

### Layer 1: Unit Tests (Vitest + React Testing Library)
- Every custom hook in `src/hooks/` must have a corresponding test
- Every utility in `src/utils/` must have a unit test
- Services in `src/services/` need mocked Supabase tests
- Run: `npm run test`

### Layer 2: Component Tests (Vitest + Testing Library)
- All form components need input validation tests
- Modal/dialog components need open/close state tests
- Data tables need sort/filter/pagination tests

### Layer 3: E2E Tests (Playwright - already configured)
- Auth flows: login, signup, password reset
- Booking flows: doctor search, appointment booking, payment
- Shop flows: add to cart, checkout, payment
- Doctor flows: prescriptions, patient management
- Run: `npm run test:e2e`

### Layer 4: Accessibility (axe-core)
- All pages must pass WCAG 2.1 AA
- Run axe checks as part of E2E tests

### Layer 5: Performance (Lighthouse CI)
- Target: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Run after every build

### Layer 6: Security
- CSP headers (already in netlify.toml)
- Auth token handling
- SQL injection (Supabase RLS)
- XSS prevention

## Priority Test Areas
1. Authentication & Authorization (useAccessControl, useUserRole, useHmsAccess)
2. Payment flows (Checkout, Cart)
3. Patient data handling (HIPAA-sensitive)
4. HMS modules (clinical data integrity)
5. Supabase RLS policies (all SQL scripts)
