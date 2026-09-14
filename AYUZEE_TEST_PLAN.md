# Ayuzee Test Plan

## Overview
Comprehensive QA testing plan for Ayuzee AYUSH Healthcare Web Application

---

## 1. Test Credentials Available

| Role | Email | Password | Status |
|------|-------|----------|--------|
| Patient | test.patient@ayuzee-e2e.dev | TestPass123! | ✅ Active |
| Doctor | test.doctor@ayuzee-e2e.dev | TestPass123! | ✅ Active |
| Admin | test.admin@ayuzee-e2e.dev | TestPass123! | ✅ Active |
| Super Admin | test.superadmin@ayuzee-e2e.dev | TestPass123! | ✅ Active |
| Therapist | test.therapist@ayuzee-e2e.dev | TestPass123! | ✅ Active |
| Student | test.student@ayuzee-e2e.dev | TestPass123! | ✅ Active |
| Receptionist | test.receptionist@ayuzee-e2e.dev | TestPass123! | ✅ Active |
| Nurse | test.nurse@ayuzee-e2e.dev | TestPass123! | ✅ Active |
| Pharmacist | test.pharmacist@ayuzee-e2e.dev | TestPass123! | ✅ Active |
| Lab Tech | test.labtech@ayuzee-e2e.dev | TestPass123! | ✅ Active |
| Venue Owner | test.venue@ayuzee-e2e.dev | TestPass123! | ✅ Active |
| Provider | test.provider@ayuzee-e2e.dev | TestPass123! | ✅ Active |

---

## 2. Application Discovery

### Framework & Architecture
- **Frontend**: React 18.3 + Vite 5.4 + TypeScript
- **Backend**: Supabase (PostgreSQL)
- **UI Components**: shadcn/ui (Radix UI)
- **Payments**: Razorpay (Test Mode)
- **Testing**: Playwright 1.61

### User Roles Identified
1. Patient
2. Doctor / Vaidya
3. Therapist
4. Admin
5. Super Admin
6. Receptionist
7. Nurse
8. Pharmacist
9. Lab Technician
10. Student
11. Venue Owner
12. Provider
13. Manufacturer

### Routes Discovered
- **180+ routes** across all modules
- Public routes: Home, About, Contact, Shop, Doctors, Therapies, Jobs
- Protected routes: Dashboard, Admin, HMS, Learning, Profile

---

## 3. Test Execution Strategy

### Phase 1: Authentication (COMPLETED)
- Signup
- Login  
- Logout
- Password Reset
- Session Persistence
- Role-based Redirects

### Phase 2: Role Journeys (COMPLETED)
- Patient: Register → Dashboard → Book → Prescriptions
- Doctor: Login → Patients → Consultations → Prescriptions
- Admin: Dashboard → Users → Products → Reports
- Therapist: Sessions → Availability → Earnings

### Phase 3: Core Features (COMPLETED)
- E-commerce (Shop → Cart → Checkout)
- HMS (OPD, IPD, Billing, Inventory)
- AI Diagnostics (Prakriti, Symptoms, Gut Health)
- Homeopathy (Repertory, Materia Medica)
- Learning (Courses, Webinars, Certificates)

### Phase 4: Quality Tests (COMPLETED)
- Accessibility (axe-core)
- SEO (Meta tags, Headings, Structure)
- Performance (Load time, Bundle size)
- Security (Headers, Auth, XSS)

### Phase 5: Responsive Tests (COMPLETED)
- Mobile (375px)
- Tablet (768px)
- Desktop (1280px, 1920px)

---

## 4. Test Environment

| Item | Value |
|------|-------|
| Base URL | https://ayuzee.com |
| Browser | Chromium (Headless) |
| Viewport | 1280x900 (Desktop), 375x667 (Mobile) |
| Supabase | https://gsjkrmrumlxakcecpfiz.supabase.co |
| Test Framework | Playwright |
| CI/CD | GitHub Actions |

---

## 5. Risk Mitigation

- **No real payments**: Using Razorpay Test Mode
- **No production data**: Using dynamic test accounts
- **No real notifications**: Simulated flows only
- **No external accounts**: All tests internal

---

## 6. Success Criteria

- ✅ All critical P0 issues resolved
- ✅ Authentication flow working
- ✅ All role journeys functional
- ✅ Core modules operational
- ✅ Security tests passing
- ✅ Accessibility tests passing
- ✅ Performance within budget

---

*Test Plan Created: September 12, 2025*  
*Status: COMPLETED*