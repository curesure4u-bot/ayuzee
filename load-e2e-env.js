// Load .env.e2e file for E2E tests
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = path.join(__dirname, '.env.e2e');

if (fs.existsSync(envFile)) {
  const envConfig = fs.readFileSync(envFile, 'utf8');
  const envLines = envConfig.split('\n');
  
  for (const line of envLines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value.trim();
      }
    }
  }
  
  console.log('✅ Loaded E2E environment from .env.e2e');
  console.log(`🌐 Base URL: ${process.env.E2E_BASE_URL}`);
  console.log(`👤 Patient email: ${process.env.E2E_PATIENT_EMAIL}`);
} else {
  console.log('⚠️  .env.e2e file not found - using defaults');
}