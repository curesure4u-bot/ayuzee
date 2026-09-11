/**
 * Creates dedicated E2E test accounts via Supabase Auth
 * Run: node create-test-accounts.mjs
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gsjkrmrumlxakcecpfiz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzamtybXJ1bWx4YWtjZWNwZml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMzExMDcsImV4cCI6MjA5OTcwNzEwN30.rYRXiYhy4V9Z2X4NsbAGBiZl3A-TXOCuWIlKthUiLxo';

// Simple password for ALL test accounts
const TEST_PASSWORD = 'TestPass123!';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const testAccounts = [
  {
    email: 'test.patient@ayuzee-e2e.dev',
    name: 'E2E Test Patient',
    role: 'patient'
  },
  {
    email: 'test.doctor@ayuzee-e2e.dev', 
    name: 'Dr E2E Test Doctor',
    role: 'doctor'
  },
  {
    email: 'test.admin@ayuzee-e2e.dev',
    name: 'E2E Test Admin',
    role: 'admin'
  }
];

console.log('🔐 Creating E2E test accounts with password:', TEST_PASSWORD);
console.log('📧 These are FAKE emails - only for testing\n');

for (const account of testAccounts) {
  console.log(`Creating ${account.role}: ${account.email}...`);
  
  const { data, error } = await supabase.auth.signUp({
    email: account.email,
    password: TEST_PASSWORD,
    options: {
      data: {
        full_name: account.name,
        is_test_account: true
      }
    }
  });
  
  if (error) {
    console.log(`❌ Error creating ${account.email}:`, error.message);
  } else {
    console.log(`✅ Created ${account.email} - ID: ${data.user?.id}`);
    
    // Note: In production, these would need email confirmation
    // We'll handle role assignment via SQL after creation
  }
}

console.log('\n🎯 Next step: Assign roles and create profiles via SQL migration');
console.log('💡 All accounts use the same password:', TEST_PASSWORD);