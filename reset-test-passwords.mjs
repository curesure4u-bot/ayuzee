/**
 * Reset passwords for E2E test accounts via Supabase Admin API
 * Run: node reset-test-passwords.mjs
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gsjkrmrumlxakcecpfiz.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzamtybXJ1bWx4YWtjZWNwZml6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDEzMTEwNywiZXhwIjoyMDk5NzA3MTA3fQ.Q_7FNlAoH4Wvq0h2Z7j8N9x3y6t5r1o0p2i8u9w7x4z6';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testAccounts = [
  'test.patient@ayuzee-e2e.dev',
  'test.doctor@ayuzee-e2e.dev',
  'test.admin@ayuzee-e2e.dev',
  'test.superadmin@ayuzee-e2e.dev',
  'test.therapist@ayuzee-e2e.dev',
  'test.receptionist@ayuzee-e2e.dev',
  'test.pharmacist@ayuzee-e2e.dev',
  'test.labtech@ayuzee-e2e.dev',
  'test.nurse@ayuzee-e2e.dev',
  'test.student@ayuzee-e2e.dev',
  'test.venue@ayuzee-e2e.dev',
  'test.manufacturer@ayuzee-e2e.dev',
  'test.provider@ayuzee-e2e.dev'
];

const NEW_PASSWORD = 'TestPass123!';

console.log('🔐 Resetting passwords for E2E test accounts...\n');

for (const email of testAccounts) {
  console.log(`Processing: ${email}`);
  
  // First, get the user by email
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.log(`❌ Error listing users: ${listError.message}`);
    continue;
  }
  
  const user = users.users.find(u => u.email === email);
  
  if (!user) {
    console.log(`❌ User not found: ${email}`);
    continue;
  }
  
  console.log(`  User ID: ${user.id}`);
  
  // Update the user's password using admin API
  const { data, error } = await supabase.auth.admin.updateUser(
    user.id,
    { password: NEW_PASSWORD }
  );
  
  if (error) {
    console.log(`❌ Error updating password: ${error.message}`);
  } else {
    console.log(`✅ Password reset successfully for ${email}`);
  }
}

console.log('\n🎯 Password reset complete!');
console.log('📝 All test accounts now use password:', NEW_PASSWORD);