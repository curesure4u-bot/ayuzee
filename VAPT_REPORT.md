# Ayuzee VAPT (Vulnerability Assessment & Penetration Testing) Report

**Date:** August 23, 2026  
**Scope:** Full application security review with focus on payment-related flows  
**Application:** Ayuzee Healthcare Platform (ayuzee.com)  
**Stack:** React + Supabase + Razorpay + Netlify  

---

## Executive Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 2 | Requires immediate action |
| HIGH | 3 | Fix before production payment launch |
| MEDIUM | 4 | Fix in next sprint |
| LOW | 3 | Best-practice improvements |
| PASS | 8 | No issues found |

**Overall Risk Rating: HIGH** — Two critical secret exposure issues must be resolved before handling real payment data.

---

## CRITICAL Findings

### VULN-001: Telegram Bot Token Exposed to Client (CRITICAL)

**File:** `src/services/messagingService.ts` (lines 261, 293, 314, 335)  
**ENV Variable:** `VITE_TELEGRAM_BOT_TOKEN`

**Issue:** The Telegram bot token is passed as a `VITE_` prefixed environment variable, which means it gets bundled into the client-side JavaScript. Any user can open browser DevTools → Sources and extract the full bot token.

**Impact:** An attacker can:
- Send messages as your bot to any user
- Read all messages sent to the bot
- Delete/modify bot webhooks
- Impersonate the bot for phishing

**Remediation:**
```
1. IMMEDIATELY rotate the Telegram bot token via @BotFather
2. Remove VITE_ prefix — rename to TELEGRAM_BOT_TOKEN (server-only)
3. Move all Telegram API calls to a Netlify Function or Supabase Edge Function
4. The client should call YOUR backend, which then calls Telegram API
```

**Fix pattern:**
```typescript
// BEFORE (INSECURE - token in browser):
const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, ...);

// AFTER (SECURE - token only on server):
await supabase.functions.invoke("send-telegram-message", {
  body: { chatId, message }
});
```

---

### VULN-002: Gemini API Key Exposed to Client (CRITICAL)

**File:** `src/lib/gemini.ts` (lines 14, 134)  
**ENV Variable:** `VITE_GEMINI_API_KEY`

**Issue:** The Google Gemini API key is sent directly in browser-side fetch requests as a URL parameter (`?key=...`). Anyone can:
1. Open Network tab in DevTools
2. See the full API key in the request URL
3. Use it for their own purposes (at your cost)

**Impact:**
- Unauthorized API usage billed to your account
- API quota exhaustion (DoS on your AI features)
- Potential access to other Google Cloud resources if the key isn't scoped

**Remediation:**
```
1. IMMEDIATELY regenerate the Gemini API key in Google Cloud Console
2. Restrict the new key to specific APIs only and add HTTP referrer restrictions
3. Remove VITE_ prefix — move to server-side only
4. Create a Supabase Edge Function that proxies Gemini calls
5. Add rate limiting per user on the Edge Function
```

---

### VULN-003: Historical .env Committed to Git (CRITICAL — Exposure)

**Evidence:** `git log --oneline --all -- .env` shows 5 commits where .env was tracked.

**Impact:** All secrets that were in .env at those commits are permanently in git history — even though the file is now gitignored. Anyone with repo access (or if the repo was ever public) can extract:
- Supabase keys
- Telegram bot token
- Gemini API key

**Remediation:**
```
1. Rotate ALL credentials that were ever in the .env file:
   - Supabase project (regenerate anon key if possible)
   - Telegram bot token
   - Gemini API key
   - Any other keys
2. Use `git filter-branch` or `BFG Repo Cleaner` to purge .env from git history
3. Force-push the cleaned history
```

---

## HIGH Findings

### VULN-004: Overly Permissive RLS Policies on Sensitive Tables (HIGH)

**Location:** 32 RLS policies across HMS tables  
**Pattern:** `CREATE POLICY ... FOR ALL TO authenticated USING (true)`

**Affected tables include:**
- `hms_payroll` (salary data)
- `hms_attendance` (employee records)
- `hms_ai_scribe_sessions` (patient consultation recordings)
- `hms_notification_log` (patient contact data)
- `hms_queue_config`

**Issue:** Any authenticated user (patient, student, doctor) can read/write ALL rows in these tables. A patient account could access payroll data or other patients' records.

**Impact:** HIPAA/DISHA compliance violation, data breach, unauthorized salary disclosure.

**Remediation:**
```sql
-- BEFORE (any authenticated user can access everything):
CREATE POLICY "Staff can manage payroll" ON public.hms_payroll 
  FOR ALL TO authenticated USING (true);

-- AFTER (restrict to staff of the same branch/entity):
CREATE POLICY "Staff can view own branch payroll" ON public.hms_payroll 
  FOR SELECT TO authenticated 
  USING (
    branch_id IN (
      SELECT branch_id FROM hms_staff WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage payroll" ON public.hms_payroll 
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM hms_staff 
      WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager')
    )
  );
```

---

### VULN-005: Client-Side API Calls to External Services Without Proxy (HIGH)

**Files:**
- `src/lib/gemini.ts` — Direct calls to `generativelanguage.googleapis.com` with API key
- `src/services/messagingService.ts` — Direct calls to `api.telegram.org` with bot token

**Issue:** Sensitive API operations (AI queries, messaging) are made directly from the browser. This means:
1. API keys are visible in Network requests
2. No server-side logging/auditing of API usage
3. No rate limiting per user
4. No ability to revoke access without rotating the key

**Remediation:** All third-party API calls must route through a backend proxy (Supabase Edge Function or Netlify Function) that:
- Keeps the API key server-side
- Validates the user's auth token
- Applies rate limiting
- Logs usage for audit

---

### VULN-006: No Server-Side Amount Validation for Some Payment Flows (HIGH)

**File:** `src/lib/razorpay.ts`

**Issue:** The `initiateRazorpayPayment()` function accepts an `amount` parameter directly from client code. While the Checkout page correctly uses `supabase.functions.invoke("razorpay-create-order")` (server-side), other payment entry points (BookingDialog, TherapyBooking) may construct amounts client-side.

**Risk:** If any payment flow allows the client to specify the amount without server-side order creation, an attacker could:
1. Intercept the request
2. Change the amount to ₹1
3. Complete the payment for a fraction of the actual price

**Remediation:**
```
1. NEVER trust client-supplied amounts
2. ALL payment flows must:
   a. Create an order server-side (Edge Function looks up the actual price)
   b. Return a razorpay_order_id with the correct amount
   c. Verify the signature server-side after payment
3. Audit BookingDialog.tsx and TherapyBooking.tsx to ensure they use
   server-side order creation
```

---

## MEDIUM Findings

### VULN-007: Stored XSS Risk via dangerouslySetInnerHTML (MEDIUM)

**Locations (7 instances):**
| File | Source of HTML |
|------|---------------|
| `src/pages/beyond/Academy.tsx:635` | `activeLesson.content_html` (from DB) |
| `src/pages/admin/masters/EmailMaster.tsx:112` | `form.body_html` (admin input) |
| `src/pages/admin/masters/TemplateMaster.tsx:155,212,216` | `content_html` (admin input) |
| `src/pages/JobDetail.tsx:174` | JSON-LD structured data |
| `src/components/ui/chart.tsx:70` | Recharts internal |

**Issue:** If the `content_html` fields in the database are populated by user-generated content or can be edited by a compromised admin, malicious JavaScript can execute in other users' browsers.

**Remediation:**
```
1. Sanitize HTML before rendering using DOMPurify:
   import DOMPurify from "dompurify";
   dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content_html) }}

2. For the Academy lesson content specifically — if students can see it,
   ensure only verified admins can write to that table
3. The JSON-LD in JobDetail.tsx is safe (JSON.stringify escapes HTML)
```

---

### VULN-008: 24 npm Dependency Vulnerabilities (7 High) (MEDIUM)

**Source:** `npm audit`

| Package | Severity | Issue |
|---------|----------|-------|
| extract-zip | High | Symlink path traversal |
| image-size | High | DoS via infinite loop (ICNS, JXL, HEIF parsers) |
| @puppeteer/browsers | High | Depends on vulnerable extract-zip |
| puppeteer-core | High | Depends on vulnerable @puppeteer/browsers |
| + 17 moderate | Moderate | Various |

**Note:** These are in dev dependencies (Playwright/Lighthouse test tooling), not production runtime. However:
- `pptxgenjs` depends on vulnerable `image-size` and IS a production dep
- Risk is limited since `pptxgenjs` is lazy-loaded and rarely used

**Remediation:**
```bash
# Fix non-breaking issues:
npm audit fix

# For breaking changes (pptxgenjs):
# Option A: Pin image-size to a patched version via overrides in package.json
# Option B: Remove pptxgenjs if not actively used (it's in devDependencies)
```

---

### VULN-009: No Client-Side Rate Limiting (MEDIUM)

**Issue:** API calls to Supabase and external services have no client-side throttling. A malicious user could:
1. Open the console
2. Call `supabase.from("table").select("*")` in a loop
3. Exhaust Supabase free-tier quota or cause performance degradation

**Remediation:**
```
1. Implement rate limiting in Supabase Edge Functions for sensitive operations
2. Add Supabase request throttling via pg_graphql rate limits
3. Use TanStack Query's built-in staleTime/cacheTime to reduce redundant calls
4. For AI features: add per-user daily quotas in the Edge Function
```

---

### VULN-010: Cloudinary Upload Preset Exposed (MEDIUM)

**File:** `src/utils/cloudinaryUpload.ts`  
**Values:** `CLOUD_NAME = "khcxf5nw"`, `UPLOAD_PRESET = "ayuzee_uploads"`

**Issue:** Unsigned upload presets allow anyone to upload files to your Cloudinary account without authentication. An attacker could:
- Upload large/many files to exhaust storage quota
- Upload inappropriate content under your account
- Use your CDN as a free file host

**Remediation:**
```
1. Switch to signed uploads (requires server-side signature generation)
2. Or at minimum: configure upload preset restrictions in Cloudinary:
   - Set allowed file formats (jpg, png, pdf only)
   - Set maximum file size (e.g., 10MB)
   - Enable moderation/auto-tagging
   - Restrict upload folder to prevent directory traversal
```

---

## LOW Findings

### VULN-011: Weak Password Policy (LOW)

**All auth pages:** `minLength={6}`

**Issue:** 6-character minimum is below modern security standards (NIST recommends 8+ characters). No complexity requirements (uppercase, number, special char).

**Remediation:**
```
1. Increase minimum to 8 characters
2. Add client-side strength indicator
3. Configure Supabase Auth password policy (Dashboard → Auth → Settings):
   - Minimum length: 8
   - Leaked password protection: enabled
```

---

### VULN-012: Missing HSTS Header (LOW)

**File:** `netlify.toml`

**Issue:** No `Strict-Transport-Security` header configured. While Netlify enforces HTTPS by default, HSTS tells browsers to NEVER attempt HTTP, preventing SSL stripping attacks.

**Remediation:**
```toml
# Add to netlify.toml [[headers]] for = "/*":
Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"
```

---

### VULN-013: Test Card Number Displayed in Production UI (LOW)

**File:** `src/pages/Checkout.tsx:417`
```
Test card: 4111 1111 1111 1111, any CVV/future expiry.
```

**Issue:** Displaying test card details in the production UI could confuse users or indicate the payment system isn't properly configured.

**Remediation:** Show this only when `import.meta.env.MODE === "development"` or when using a test Razorpay key.

---

## PASSED Checks (No Issues)

| Check | Status | Details |
|-------|--------|---------|
| Payment signature verification | PASS | Server-side Edge Function `razorpay-verify-payment` validates signatures |
| Payment order creation | PASS | Checkout uses `razorpay-create-order` Edge Function (server-side amount) |
| CSP headers | PASS | Strong Content-Security-Policy with appropriate allowlists |
| X-Frame-Options | PASS | SAMEORIGIN prevents clickjacking |
| X-Content-Type-Options | PASS | nosniff prevents MIME sniffing |
| Referrer-Policy | PASS | strict-origin-when-cross-origin |
| eval/code injection | PASS | No eval() or new Function() usage found |
| SQL injection | PASS | Supabase client uses parameterized queries by design |
| Supabase service role key | PASS | Not exposed to client (only in Netlify Functions) |
| Session management | PASS | Supabase auth with auto-refresh, localStorage persistence |
| CSRF protection | PASS | SPA + JWT-based auth (no cookies for auth = no CSRF) |
| File upload validation | PASS | Type checking and compression on images |
| HTTPS enforcement | PASS | Netlify auto-redirects HTTP → HTTPS |
| Git secrets (.env) | PARTIAL | Now gitignored, but history contains old secrets |

---

## Payment Flow Security Assessment

### Flow: E-Commerce Checkout (SECURE)
```
1. Client builds cart → calculates subtotal (display only)
2. Client calls supabase.functions.invoke("razorpay-create-order") 
   → Server looks up order from DB, calculates REAL amount
   → Server creates Razorpay order with correct amount
   → Returns razorpay_order_id to client
3. Client opens Razorpay checkout with server-provided order_id
4. User completes payment on Razorpay's secure page
5. Razorpay returns payment_id + signature to client
6. Client calls supabase.functions.invoke("razorpay-verify-payment")
   → Server verifies HMAC signature using secret key
   → Server updates order status to "paid"
```
**Verdict: SECURE** — Amount determined server-side, signature verified server-side.

### Flow: Direct Razorpay (src/lib/razorpay.ts) (NEEDS REVIEW)
```
1. Client calls initiateRazorpayPayment({ amount: X })
2. Opens Razorpay checkout directly with client-provided amount
3. No server-side order creation
4. No signature verification
```
**Verdict: INSECURE if used for real payments** — Amount can be tampered. Only safe for test/demo mode.

---

## Priority Action Plan

### Immediate (Before accepting real payments):
1. Rotate Telegram bot token and Gemini API key
2. Move both to server-side functions (remove VITE_ prefix)
3. Verify ALL payment flows use server-side order creation
4. Remove test card display from production UI

### This Week:
5. Fix 32 overly permissive RLS policies on HMS tables
6. Add DOMPurify for all dangerouslySetInnerHTML instances
7. Add HSTS header to netlify.toml
8. Run `npm audit fix` for dependency vulnerabilities

### This Month:
9. Purge .env from git history (BFG Repo Cleaner)
10. Switch Cloudinary to signed uploads
11. Increase password minimum to 8 characters
12. Add rate limiting to Supabase Edge Functions
13. Add per-user quotas for AI features

---

## Compliance Notes

For PCI-DSS compliance (handling payment data):
- You are NOT storing card data (Razorpay handles that) — GOOD
- You ARE storing payment_ids and order_ids — that's fine (non-sensitive)
- Ensure NO payment card details are ever logged, stored, or displayed
- The test card number in Checkout.tsx should be conditionally shown

For HIPAA/DISHA compliance (healthcare data):
- The overly permissive RLS policies (VULN-004) are a direct violation
- Patient medical records MUST be restricted to authorized providers only
- Audit logging should be enabled for all patient data access

---

*This report is based on static code analysis and configuration review. A full penetration test with runtime exploitation is recommended before handling production payment data.*
