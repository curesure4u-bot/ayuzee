# 🧪 Complete E2E Test Credentials

## 🔐 Universal Password
**ALL test accounts use the same password:** `TestPass123!`

## 📋 Complete Test Account Directory

| Role | Email | Password | Access Level | What to Test |
|------|-------|----------|--------------|--------------|
| **Patient** | `test.patient@ayuzee-e2e.dev` | `TestPass123!` | Patient dashboard, booking, shop | Book appointments, use shop, view prescriptions |
| **Doctor** | `test.doctor@ayuzee-e2e.dev` | `TestPass123!` | OPD, Clinical, Patient records | Write prescriptions, see patient queue |
| **Admin** | `test.admin@ayuzee-e2e.dev` | `TestPass123!` | All HMS modules except owner pages | Full HMS access, data management |
| **Super Admin** | `test.superadmin@ayuzee-e2e.dev` | `TestPass123!` | **EVERYTHING** including owner pages | All modules + Spine Super Admin |
| **Therapist** | `test.therapist@ayuzee-e2e.dev` | `TestPass123!` | Panchakarma, AYUSH, Spine | Therapy sessions, spine treatments |
| **Receptionist** | `test.receptionist@ayuzee-e2e.dev` | `TestPass123!` | OPD, Patient registration | Patient check-in, appointment management |
| **Pharmacist** | `test.pharmacist@ayuzee-e2e.dev` | `TestPass123!` | Stock/Pharmacy module only | Medicine inventory, dispensing |
| **Lab Tech** | `test.labtech@ayuzee-e2e.dev` | `TestPass123!` | Lab module only | Lab results, test orders |
| **Nurse** | `test.nurse@ayuzee-e2e.dev` | `TestPass123!` | OPD, IPD, Patient care | Vitals, patient monitoring |
| **Student** | `test.student@ayuzee-e2e.dev` | `TestPass123!` | Learning modules, courses | Course access, certifications |
| **Venue Owner** | `test.venue@ayuzee-e2e.dev` | `TestPass123!` | Venue management | Venue operations |
| **Manufacturer** | `test.manufacturer@ayuzee-e2e.dev` | `TestPass123!` | Product manufacturing | Product management |
| **Service Provider** | `test.provider@ayuzee-e2e.dev` | `TestPass123!` | Lab & Stock services | External service provision |

## 🎯 Quick Testing Steps

### 1. Manual Login Test (Start Here)
1. Open: https://ayuzee.com/auth?mode=login
2. Pick any account from the table above
3. Use email + `TestPass123!`
4. Verify it redirects correctly for that role

### 2. Role-Specific Landing Pages
- **Patient** → `/dashboard` or `/patient`
- **Doctor** → `/vaidya` or `/doctor` 
- **Admin** → `/hms` (all modules visible)
- **Super Admin** → `/hms` (+ Spine Super Admin accessible)
- **HMS Staff** → `/hms` (role-specific modules only)

### 3. Access Boundary Testing
- Login as **Patient** → try going to `/hms` → should be blocked
- Login as **Receptionist** → try Spine Super Admin → should be blocked  
- Login as **Admin** → try Spine Super Admin → should be blocked
- Login as **Super Admin** → try Spine Super Admin → should work

### 4. End-to-End Flow Testing
**Patient Journey:**
1. Login as Patient → Book appointment → Use shop → Check prescriptions

**Doctor Workflow:**  
1. Login as Doctor → See patient queue → Write prescription → Complete visit

**Admin Operations:**
1. Login as Admin → Add new patient → Generate reports → Manage stock

## 🚀 Running Automated Tests

```bash
# Test authentication for all roles
./run-e2e-test.sh auth.spec.ts

# Test patient booking flow  
./run-e2e-test.sh booking.spec.ts

# Test doctor prescription flow
./run-e2e-test.sh doctor-prescription.spec.ts

# Test shop checkout
./run-e2e-test.sh checkout.spec.ts

# Run all tests
./run-e2e-test.sh
```

## 📊 Database Verification

After each test, verify the data was saved correctly:

```sql
-- Check recent user logins
SELECT email, last_sign_in_at 
FROM auth.users 
WHERE email LIKE '%ayuzee-e2e.dev' 
ORDER BY last_sign_in_at DESC LIMIT 5;

-- Check if appointments were booked
SELECT patient_name, appointment_date, status 
FROM appointments 
ORDER BY created_at DESC LIMIT 5;

-- Check if prescriptions were written  
SELECT patient_name, doctor_name, is_signed
FROM hms_prescriptions
ORDER BY created_at DESC LIMIT 5;
```

## 🔍 What Each Role Can Access

### HMS Modules by Role
- **Super Admin/Owner**: All modules + owner pages
- **Admin**: All modules except owner pages  
- **Doctor**: OPD, Clinical, Patient, Lab, AYUSH, Panchakarma, Spine
- **Therapist**: OPD, Panchakarma, AYUSH, Spine
- **Receptionist**: Dashboard, OPD, Patient
- **Pharmacist**: Stock only
- **Lab Tech**: Lab only  
- **Nurse**: OPD, IPD, Patient

### Platform Access
- **Patient**: Dashboard, booking, shop, prescriptions
- **Student**: Courses, certifications, learning modules
- **Venue Owner**: Venue management, bookings
- **Manufacturer**: Product catalog, inventory
- **Service Provider**: Lab/stock service provision

## 🚨 Important Notes

1. **These are SAFE test accounts** - no real passwords exposed
2. **All use fake email addresses** - won't receive actual emails  
3. **Database is shared** - test data from different roles may interact
4. **Reset if needed** - accounts can be deleted/recreated anytime
5. **Production safety** - These accounts only work on your test instance

## 📖 Full Testing Guide

For complete step-by-step testing instructions, see:
**https://ayuzee.com/Ayuzee_E2E_Testing_Guide.pdf**

The PDF has 12 sections with detailed test flows, database verification queries, and exactly how to test the complete patient → doctor → prescription → notification flow.