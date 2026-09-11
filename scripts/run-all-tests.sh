#!/bin/bash
# ===========================================
# Complete E2E Testing & Database Verification Script
# ===========================================
# Usage: ./scripts/run-all-tests.sh

set -e

echo "=========================================="
echo "  AYUZEE E2E TEST SUITE"
echo "=========================================="
echo ""

# Configuration
export E2E_BASE_URL=${E2E_BASE_URL:-https://ayuzee.com}
export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"
PROJECT_DIR="/Users/drmohamadsaleem/Downloads/ayuzee-main 5"
cd "$PROJECT_DIR"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Configuration:${NC}"
echo "  BASE_URL: $E2E_BASE_URL"
echo "  NODE: $(which node)"
echo ""

# ===========================================
# STEP 1: Run Core E2E Tests
# ===========================================
echo "=========================================="
echo "  STEP 1: Running Core E2E Tests"
echo "=========================================="

# Run essential tests
npx playwright test auth.spec.ts patient-journey-complete.spec.ts admin-access.spec.ts --reporter=list 2>&1 | tee test-output/core-tests.log

# ===========================================
# STEP 2: Run Shop & Checkout Tests  
# ===========================================
echo ""
echo "=========================================="
echo "  STEP 2: Running Shop & Checkout Tests"
echo "=========================================="

npx playwright test shop-checkout.spec.ts checkout.spec.ts --reporter=list 2>&1 | tee test-output/shop-tests.log

# ===========================================
# STEP 3: Run HMS Workflow Tests
# ===========================================
echo ""
echo "=========================================="
echo "  STEP 3: Running HMS Workflow Tests"
echo "=========================================="

npx playwright test hms-workflow.spec.ts hms-modules.spec.ts --reporter=list 2>&1 | tee test-output/hms-tests.log

# ===========================================
# STEP 4: Run Security Tests
# ===========================================
echo ""
echo "=========================================="
echo "  STEP 4: Running Security Tests"
echo "=========================================="

npx playwright test security.spec.ts security-boundaries.spec.ts --reporter=list 2>&1 | tee test-output/security-tests.log

# ===========================================
# STEP 5: Run Notifications Tests
# ===========================================
echo ""
echo "=========================================="
echo "  STEP 5: Running Notifications & DB Tests"
echo "=========================================="

npx playwright test notifications.spec.ts --reporter=list 2>&1 | tee test-output/notifications-tests.log

# ===========================================
# STEP 6: Generate Test Report
# ===========================================
echo ""
echo "=========================================="
echo "  STEP 6: Generating Test Report"
echo "=========================================="

# Count passed/failed tests
TOTAL=$(grep -c "✓\|✔\|passed" test-output/*.log 2>/dev/null || echo "0")
FAILED=$(grep -c "✘\|failed\|Error" test-output/*.log 2>/dev/null || echo "0")

echo ""
echo "=========================================="
echo "  TEST SUMMARY"
echo "=========================================="
echo -e "${GREEN}Core Tests:${NC} See test-output/core-tests.log"
echo -e "${GREEN}Shop Tests:${NC} See test-output/shop-tests.log"
echo -e "${GREEN}HMS Tests:${NC} See test-output/hms-tests.log"
echo -e "${GREEN}Security Tests:${NC} See test-output/security-tests.log"
echo -e "${GREEN}Notifications Tests:${NC} See test-output/notifications-tests.log"
echo ""
echo "All test outputs saved to: test-output/"
echo "=========================================="

# ===========================================
# STEP 7: Database Verification Queries
# ===========================================
echo ""
echo "=========================================="
echo "  STEP 7: Database Verification Queries"
echo "=========================================="

cat > test-output/db-verification-queries.sql << 'EOF'
-- ===========================================
-- DATABASE VERIFICATION QUERIES
-- Run these in your Supabase SQL Editor
-- ===========================================

-- 1. Verify User Registrations (last 30 minutes)
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  email_confirmed_at
FROM auth.users 
WHERE email LIKE '%ayuzee-test.dev%'
AND created_at > NOW() - INTERVAL '30 minutes'
ORDER BY created_at DESC;

-- 2. Verify Profiles Created
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.created_at,
  u.email as auth_email
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email LIKE '%ayuzee-test.dev%'
AND p.created_at > NOW() - INTERVAL '30 minutes';

-- 3. Verify Notifications Created
SELECT 
  id,
  user_id,
  title,
  type,
  is_read,
  created_at
FROM unified_notifications 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email LIKE '%ayuzee-test.dev%'
  AND created_at > NOW() - INTERVAL '30 minutes'
)
ORDER BY created_at DESC;

-- 4. Verify Appointments (if any)
SELECT 
  a.id,
  a.patient_id,
  a.doctor_id,
  a.appointment_date,
  a.status,
  a.created_at
FROM appointments a
WHERE a.patient_id IN (
  SELECT id FROM auth.users 
  WHERE email LIKE '%ayuzee-test.dev%'
)
AND a.created_at > NOW() - INTERVAL '30 minutes';

-- 5. Verify Orders (if any)
SELECT 
  o.id,
  o.user_id,
  o.order_status,
  o.payment_status,
  o.total,
  o.created_at
FROM orders o
WHERE o.user_id IN (
  SELECT id FROM auth.users 
  WHERE email LIKE '%ayuzee-test.dev%'
)
AND o.created_at > NOW() - INTERVAL '30 minutes';
EOF

echo "Database queries saved to: test-output/db-verification-queries.sql"

# ===========================================
# DONE
# ===========================================
echo ""
echo -e "${GREEN}=========================================="
echo "  ✅ ALL TESTS COMPLETED"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Check test-output/ for detailed logs"
echo "2. Run database queries in Supabase SQL Editor"
echo "3. Review and fix any failed tests"
echo "4. Deploy the build: npm run build"
echo ""