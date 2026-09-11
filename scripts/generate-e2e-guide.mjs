/**
 * Generates "Ayuzee HMS — End-to-End Testing Guide" as a PDF.
 * Run: node scripts/generate-e2e-guide.mjs
 * Output: public/Ayuzee_E2E_Testing_Guide.pdf
 */
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "Ayuzee_E2E_Testing_Guide.pdf");

// ─── palette ───
const BLUE    = [37, 99, 235];
const DARK    = [15, 23, 42];
const GREY    = [100, 116, 139];
const LIGHT   = [241, 245, 249];
const GREEN   = [22, 163, 74];
const RED     = [220, 38, 38];
const AMBER   = [217, 119, 6];
const PURPLE  = [124, 58, 237];

const doc = new jsPDF({ unit: "pt", format: "a4" });
const PW  = doc.internal.pageSize.getWidth();
const PH  = doc.internal.pageSize.getHeight();
const M   = 48;
const CW  = PW - M * 2;
let y = M;

// ─── helpers ────────────────────────────────────────────────
function newPage() { doc.addPage(); y = M; }
function ensure(h) { if (y + h > PH - 56) newPage(); }

function footer() {
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5); doc.setTextColor(...GREY);
    doc.setFont("helvetica","normal");
    doc.text("Ayuzee HMS · End-to-End Testing Guide · Confidential", M, PH - 22);
    doc.text(`Page ${i} of ${n}`, PW - M, PH - 22, { align: "right" });
    doc.setDrawColor(226, 232, 240);
    doc.line(M, PH - 32, PW - M, PH - 32);
  }
}

function h1(text, color = BLUE) {
  ensure(44);
  doc.setFillColor(...color);
  doc.rect(M, y, 5, 20, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(15);
  doc.setTextColor(...DARK);
  doc.text(text, M + 14, y + 15);
  y += 30;
}

function h2(text) {
  ensure(26);
  doc.setFont("helvetica","bold"); doc.setFontSize(11);
  doc.setTextColor(...BLUE);
  doc.text(text, M, y + 11);
  y += 20;
}

function h3(text) {
  ensure(20);
  doc.setFont("helvetica","bold"); doc.setFontSize(9.5);
  doc.setTextColor(...DARK);
  doc.text(text, M, y + 9); y += 16;
}

function para(text, { size=9.5, color=DARK, bold=false, indent=0 } = {}) {
  doc.setFont("helvetica", bold?"bold":"normal");
  doc.setFontSize(size); doc.setTextColor(...color);
  const lines = doc.splitTextToSize(text, CW - indent);
  lines.forEach(ln => {
    ensure(size + 5);
    doc.text(ln, M + indent, y); y += size + 4;
  });
  y += 2;
}

function bullets(items, { color=DARK, indent=0, badge=null, badgeColor=BLUE } = {}) {
  items.forEach(it => {
    const lines = doc.splitTextToSize(it, CW - 20 - indent);
    ensure(lines.length * 14 + 4);
    if (badge) {
      doc.setFillColor(...badgeColor);
      doc.roundedRect(M + indent, y - 8, 6, 6, 1, 1, "F");
    } else {
      doc.setFont("helvetica","bold"); doc.setFontSize(10);
      doc.setTextColor(...BLUE);
      doc.text("•", M + 4 + indent, y);
    }
    doc.setFont("helvetica","normal"); doc.setFontSize(9.5);
    doc.setTextColor(...color);
    lines.forEach((ln, idx) => {
      doc.text(ln, M + 18 + indent, y);
      if (idx < lines.length - 1) y += 13;
    });
    y += 14;
  });
  y += 2;
}

function badge(text, bColor) {
  const w = text.length * 5.5 + 10;
  doc.setFillColor(...bColor);
  doc.roundedRect(M, y, w, 14, 3, 3, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(7.5);
  doc.setTextColor(255,255,255);
  doc.text(text, M + 5, y + 10);
  y += 20;
}

function box(title, lines, bColor = BLUE) {
  const allLines = Array.isArray(lines) ? lines : [lines];
  const wrapped  = allLines.flatMap(l => doc.splitTextToSize(l, CW - 28));
  const bh = 22 + wrapped.length * 13 + 10;
  ensure(bh + 10);
  doc.setFillColor(...LIGHT);
  doc.roundedRect(M, y, CW, bh, 5, 5, "F");
  doc.setDrawColor(...bColor); doc.setLineWidth(2.5);
  doc.line(M, y + 4, M, y + bh - 4);
  doc.setLineWidth(0.3);
  doc.setFont("helvetica","bold"); doc.setFontSize(10);
  doc.setTextColor(...bColor);
  doc.text(title, M + 14, y + 17);
  doc.setFont("helvetica","normal"); doc.setFontSize(9);
  doc.setTextColor(...DARK);
  let ty = y + 32;
  wrapped.forEach(ln => { doc.text(ln, M + 14, ty); ty += 13; });
  y += bh + 14;
}

function statusBadge(label, color, x, row_y) {
  const w = label.length * 5 + 10;
  doc.setFillColor(...color);
  doc.roundedRect(x, row_y - 8, w, 12, 2, 2, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(7);
  doc.setTextColor(255,255,255);
  doc.text(label, x + 5, row_y);
}

function tbl(head, body, colStyles, opts = {}) {
  ensure(55);
  autoTable(doc, {
    startY: y,
    head: [head],
    body,
    margin: { left: M, right: M },
    styles: { font:"helvetica", fontSize:8.5, cellPadding:4.5,
              textColor:DARK, lineColor:[226,232,240], lineWidth:0.3 },
    headStyles: { fillColor:BLUE, textColor:[255,255,255], fontStyle:"bold", fontSize:8.8 },
    alternateRowStyles: { fillColor:[248,250,252] },
    columnStyles: colStyles || {},
    tableWidth: CW,
    ...opts,
  });
  y = doc.lastAutoTable.finalY + 14;
}

function divider() {
  ensure(10);
  doc.setDrawColor(203, 213, 225);
  doc.line(M, y, PW - M, y);
  y += 12;
}

function sectionFlow(steps) {
  // Draw a horizontal flow diagram (arrows)
  const boxW = Math.floor((CW - (steps.length - 1) * 14) / steps.length);
  const boxH = 34;
  ensure(boxH + 20);
  steps.forEach((s, i) => {
    const x = M + i * (boxW + 14);
    doc.setFillColor(...BLUE);
    doc.roundedRect(x, y, boxW, boxH, 4, 4, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(7.2);
    doc.setTextColor(255,255,255);
    const lines = doc.splitTextToSize(s, boxW - 8);
    lines.forEach((ln, li) => doc.text(ln, x + boxW/2, y + 13 + li * 9, { align:"center" }));
    if (i < steps.length - 1) {
      doc.setTextColor(...GREY); doc.setFontSize(10);
      doc.text("→", x + boxW + 4, y + 21);
    }
  });
  y += boxH + 14;
}

// ══════════════════════════════════════════════════════════════
// COVER PAGE
// ══════════════════════════════════════════════════════════════
doc.setFillColor(...BLUE);
doc.rect(0, 0, PW, 210, "F");
doc.setFillColor(29, 78, 216);
doc.rect(0, 195, PW, 16, "F");

doc.setFont("helvetica","bold"); doc.setFontSize(9);
doc.setTextColor(147, 197, 253);
doc.text("AYUZEE HMS  ·  TESTING DOCUMENTATION", M, 60);

doc.setFontSize(34); doc.setTextColor(255,255,255);
doc.text("End-to-End", M, 105);
doc.setFontSize(22); doc.setTextColor(186, 230, 253);
doc.text("Testing Guide", M, 135);

doc.setFont("helvetica","normal"); doc.setFontSize(11);
doc.setTextColor(219, 234, 254);
doc.text("Step-by-step test plans for every module — from patient signup to full clinical flow", M, 165);

y = 260;
doc.setFont("helvetica","bold"); doc.setFontSize(12); doc.setTextColor(...DARK);
doc.text("What this document covers", M, y); y += 20;

const coverItems = [
  ["Section 1", "Environment Setup & Test Credentials", BLUE],
  ["Section 2", "Authentication — signup, login, role-based redirect", BLUE],
  ["Section 3", "Patient Journey — register → book → consult → receive prescription", GREEN],
  ["Section 4", "Doctor / HMS Flow — OPD → clinical notes → prescription → discharge", GREEN],
  ["Section 5", "Spine AYUSH — assess → protocol → treat → track outcomes", PURPLE],
  ["Section 6", "Shop & Checkout — cart → Razorpay → order confirmation", AMBER],
  ["Section 7", "Admin & Super Admin — roles, data, platform management", RED],
  ["Section 8", "Notifications — DB writes + doctor alert verification", BLUE],
  ["Section 9", "Security, Performance & Accessibility", GREY],
  ["Section 10", "Database Verification Checklist — what to check after each test", GREEN],
  ["Section 11", "Running Automated Tests (Playwright)", PURPLE],
  ["Section 12", "Bug Report Template", RED],
];
coverItems.forEach(([sec, title, c]) => {
  doc.setFillColor(...c);
  doc.roundedRect(M, y, 70, 14, 2, 2, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(255,255,255);
  doc.text(sec, M + 5, y + 10);
  doc.setFont("helvetica","normal"); doc.setFontSize(9.5); doc.setTextColor(...DARK);
  doc.text(title, M + 78, y + 10);
  y += 20;
});

box("Testing philosophy",
  "Test the FLOW, not just the button. Every test in this guide ends with a database verification step — confirming the data was actually saved to the correct tables and notifications were triggered. A green UI is not sufficient; the backend must be verified.",
  GREEN);

// ══════════════════════════════════════════════════════════════
// SECTION 1 — ENVIRONMENT SETUP
// ══════════════════════════════════════════════════════════════
newPage();
h1("Section 1 — Environment Setup & Test Credentials");
para("Before running any test, set up two environments: Manual (browser) and Automated (Playwright). Both need the test credentials below.");

h2("1.1 Test User Accounts (already exist in your DB)");
tbl(
  ["Role", "Email", "Access level", "Use for testing"],
  [
    ["Super Admin (Owner)", "curesure4u@gmail.com", "Everything incl. owner pages", "Owner-tier tests, all modules"],
    ["Admin (Dr Sindhu Roja)", "alshifachennaidr@gmail.com", "All modules except owner pages", "Admin flow, data building"],
    ["Doctor", "jawahirasaleem@gmail.com", "HMS doctor modules", "Doctor prescription, OPD flow"],
    ["Patient", "curesure4u@gmail.com", "Patient dashboard, booking", "Booking, shop, profile"],
  ],
  { 0:{cellWidth:90,fontStyle:"bold"}, 1:{cellWidth:160}, 2:{cellWidth:130} }
);
box("Password note", "Use the real passwords for these accounts. Never put real passwords in code or commit to git. Store them only in .env.e2e (gitignored).", RED);

h2("1.2 Create the .env.e2e file (for Playwright)");
para("Create this file at the root of the project. It is gitignored — never commit it.");
doc.setFillColor(15, 23, 42); doc.rect(M, y, CW, 90, "F");
doc.setFont("courier","normal"); doc.setFontSize(8.5); doc.setTextColor(134, 239, 172);
const envLines = [
  "E2E_BASE_URL=https://ayuzee.com",
  "E2E_PATIENT_EMAIL=curesure4u@gmail.com",
  "E2E_PATIENT_PASSWORD=<your_password>",
  "E2E_DOCTOR_EMAIL=jawahirasaleem@gmail.com",
  "E2E_DOCTOR_PASSWORD=<your_password>",
  "E2E_SUPABASE_URL=https://gsjkrmrumlxakcecpfiz.supabase.co",
  "E2E_SUPABASE_ANON_KEY=<anon_key_from_supabase_dashboard>",
];
envLines.forEach((ln, i) => { doc.text(ln, M + 10, y + 16 + i * 11); });
y += 100;

h2("1.3 Supabase Dashboard — what to have open");
bullets([
  "Table Editor — to verify rows are being written correctly after each test.",
  "Authentication → Users — to verify new user registrations.",
  "SQL Editor — for the database verification queries in Section 10.",
  "Logs → Edge Functions — to check webhook/notification edge functions.",
]);

h2("1.4 Test devices & browsers");
tbl(
  ["Test type", "Browser/Device", "How to run"],
  [
    ["Manual functional", "Chrome (latest)", "Open ayuzee.com, follow test steps"],
    ["Mobile responsive", "Chrome DevTools → iPhone 14 Pro", "F12 → Toggle device, set 390×844"],
    ["Automated E2E", "Chromium (Playwright)", "node scripts and npx playwright test"],
    ["Accessibility", "Chrome + axe DevTools extension", "Run axe scan on each page"],
  ],
  { 0:{cellWidth:110, fontStyle:"bold"}, 1:{cellWidth:160} }
);

// ══════════════════════════════════════════════════════════════
// SECTION 2 — AUTHENTICATION
// ══════════════════════════════════════════════════════════════
newPage();
h1("Section 2 — Authentication Testing");
para("Authentication is the gateway to everything. Test all four paths: new signup, existing login, wrong password, and role-based redirect.");

h2("2.1 New Patient Signup");
sectionFlow(["Go to /auth", "Fill signup form", "Submit", "Check email", "Confirm email", "Redirect to dashboard"]);
tbl(
  ["Step", "Action", "Expected result", "DB table to verify"],
  [
    ["1", "Go to ayuzee.com/auth?mode=signup", "Signup form visible with fullName, phone, email, password fields", "-"],
    ["2", "Fill: name=Test Patient, phone=9999999999, email=<new>, password=TestPass!234", "Fields accept input correctly", "-"],
    ["3", "Click Sign Up button", "Toast: 'Check your email' OR redirect to dashboard", "auth.users — 1 new row"],
    ["4", "Open email, click confirmation link", "Browser opens ayuzee.com, session created", "auth.users: email_confirmed_at set"],
    ["5", "Check redirect destination", "Lands on /dashboard or /patient", "profiles — new row created"],
    ["6", "Verify role assigned", "User has 'patient' role", "user_roles — role='patient'"],
  ],
  { 0:{cellWidth:30,halign:"center"}, 1:{cellWidth:150}, 2:{cellWidth:165} }
);

h2("2.2 Existing User Login — all roles");
tbl(
  ["Role", "Login email", "Expected redirect", "What to verify"],
  [
    ["Patient", "curesure4u@gmail.com", "/dashboard or /patient", "Patient dashboard loads, no HMS visible"],
    ["Doctor", "jawahirasaleem@gmail.com", "/vaidya or /doctor", "Doctor tools visible, patient list shows"],
    ["Admin", "alshifachennaidr@gmail.com", "/hms or /admin", "All HMS modules accessible in sidebar"],
    ["Super Admin", "curesure4u@gmail.com", "/hms with owner pages", "Spine Super Admin page accessible"],
  ],
  { 0:{cellWidth:70,fontStyle:"bold"}, 1:{cellWidth:150}, 2:{cellWidth:110} }
);

h2("2.3 Negative tests");
bullets([
  "Wrong password → Toast shows 'Invalid credentials' or similar error. User stays on /auth page.",
  "Non-existent email → Same error toast. No account creation side-effect.",
  "Empty form submit → HTML5 / toast validation fires. No API call made.",
  "SQL injection in email field (e.g. ' OR 1=1--) → Treated as invalid email format, rejected at form validation.",
]);
box("Role-based access gate test",
  "After logging in as Patient, manually navigate to /hms — you should be redirected away or see 'Access denied'. The HMS modules are invisible in the sidebar. This confirms the role guard is working.",
  AMBER);

// ══════════════════════════════════════════════════════════════
// SECTION 3 — PATIENT JOURNEY
// ══════════════════════════════════════════════════════════════
newPage();
h1("Section 3 — Patient Journey (End-to-End)", GREEN);
para("The complete patient flow: discover the clinic → book appointment → receive consultation → get prescription → track health. Each step must write to the correct DB tables.");

h2("3.1 Find a Doctor & Book Appointment");
sectionFlow(["Login (patient)", "Go to /doctors", "View doctor profile", "Click Book", "Choose slot & mode", "Pay / Confirm"]);

tbl(
  ["Step", "Action", "Expected UI result", "DB write to verify"],
  [
    ["1","Login as patient (curesure4u@gmail.com)","Redirects to patient dashboard","auth.users: last_sign_in_at updated"],
    ["2","Navigate to /doctors","Doctor listing page with filter/search","doctors table — 3 rows exist"],
    ["3","Click a doctor card → View Profile","Doctor detail: bio, fee, slots, ratings","—"],
    ["4","Click 'Book Consultation'","BookingDialog opens with date/time picker","—"],
    ["5","Select mode: Video / In-clinic","Mode button highlights","—"],
    ["6","Select an available time slot","Slot highlights, confirm button activates","—"],
    ["7","Add note: 'Lower back pain for 3 months'","Note text accepted","—"],
    ["8","Click 'Pay & Book' (if Razorpay) or 'Confirm'","Razorpay checkout opens OR booking confirmed","appointments — 1 new row"],
    ["9","After booking, check dashboard","Appointment shows as 'Pending' or 'Confirmed'","appointments: status='pending'/'confirmed'"],
    ["10","Doctor notified","Doctor sees new appointment in queue","Check follow_up_reminders or doctor dashboard"],
  ],
  { 0:{cellWidth:28,halign:"center"}, 1:{cellWidth:155}, 2:{cellWidth:145} }
);

h2("3.2 Patient Profile & Health Records");
tbl(
  ["Test", "Steps", "DB table to verify"],
  [
    ["Upload profile photo","Go to /patient/profile → Upload photo → Save","profiles: avatar_url updated; Supabase Storage: avatars bucket"],
    ["Update health info","Add blood group, allergies, chronic conditions","profiles: updated; patient_allergies: new row"],
    ["Upload lab report","Patient Profile → Documents → Upload PDF","patient_health_folders; patient_health_documents: new row"],
    ["View prescriptions","Go to prescriptions tab","patient_prescribed_medicines: rows visible"],
    ["Set medicine reminder","Add medicine → set reminder time","patient_prescribed_medicines: reminder_time set"],
  ],
  { 0:{cellWidth:120,fontStyle:"bold"}, 1:{cellWidth:175} }
);

h2("3.3 Teleconsult Flow (Video call)");
sectionFlow(["Patient joins call", "Doctor joins call", "Consultation", "Doctor writes Rx", "Patient receives Rx"]);
bullets([
  "Patient opens confirmed appointment → clicks 'Join Video Call' → room URL opens.",
  "Doctor opens same appointment → joins room → both are now connected.",
  "After consultation, doctor writes prescription (Section 4.3 details this).",
  "Patient's dashboard shows new prescription under 'My Prescriptions'.",
  "DB verify: hms_teleconsult_sessions — status='completed', actual_start and actual_end populated.",
]);

// ══════════════════════════════════════════════════════════════
// SECTION 4 — DOCTOR / HMS FLOW
// ══════════════════════════════════════════════════════════════
newPage();
h1("Section 4 — Doctor & HMS Flow (End-to-End)", BLUE);
para("The doctor/HMS flow is the core of clinical operations. Test the full journey from patient check-in to discharge.");

h2("4.1 OPD Patient Registration");
sectionFlow(["HMS → OPD", "New Patient", "Fill registration", "Assign token", "Route to doctor"]);
tbl(
  ["Step", "Action", "Expected result", "DB table"],
  [
    ["1","Login as Admin/Doctor → HMS → OPD","OPD queue and new patient button visible","—"],
    ["2","Click 'New Patient' → fill: name, DOB, gender, phone, address","Form accepts input","—"],
    ["3","Submit registration","Patient ID auto-generated (e.g. AYZ-001)","hms_op_patients: 1 new row, patient_id set"],
    ["4","Assign to doctor, issue token","Token number assigned","hms_op_visits: 1 new row, token_number set"],
    ["5","Patient appears in today's queue","Queue shows patient with waiting status","opd_queue_entries: status='waiting'"],
  ],
  { 0:{cellWidth:28,halign:"center"}, 1:{cellWidth:165}, 2:{cellWidth:135} }
);

h2("4.2 Triage (Vitals Capture)");
bullets([
  "Open patient in OPD queue → click 'Capture Vitals' or 'Triage'.",
  "Fill: BP (120/80), Pulse (72), Temperature (98.6°F), Weight (70kg), SpO2 (98%).",
  "Add chief complaint: 'Lower back pain, 3 months duration'.",
  "Save triage → DB: hms_triage_records — 1 new row with all vitals populated.",
  "Patient status updates to 'Vitals Captured' in queue.",
]);

h2("4.3 Clinical Consultation & Prescription");
sectionFlow(["Open patient", "Write SOAP note", "Add diagnosis", "Write prescription", "Sign & save"]);
tbl(
  ["Step", "Action", "DB table + field"],
  [
    ["Open patient","Click patient in queue → 'Start Consultation'","hms_op_visits: status='in_consultation'"],
    ["SOAP notes","Fill Subjective, Objective, Assessment, Plan fields","hms_clinical_notes: 1 new row, note_type='soap'"],
    ["Ayurveda fields","Add dosha assessment, prakriti notes, agni/ama status","hms_clinical_notes: dosha_assessment, agni_status fields"],
    ["Diagnosis","Type diagnosis + ICD/NAMASTE code","hms_prescriptions: diagnosis field"],
    ["Add medicine","Medicine name, dosage (1-0-1), duration (7 days), anupana (warm water)","hms_prescription_items: 1+ new rows"],
    ["Follow-up date","Set follow-up in 7 days","hms_prescriptions: follow_up_date"],
    ["Sign prescription","Click 'Sign & Issue'","hms_prescriptions: is_signed=true, signed_at=now()"],
    ["Complete visit","Click 'Complete Consultation'","hms_op_visits: status='completed', check_out_time set"],
  ],
  { 0:{cellWidth:90,fontStyle:"bold"}, 1:{cellWidth:165} }
);

h2("4.4 Billing");
tbl(
  ["Step", "Action", "DB table"],
  [
    ["Create bill","HMS → Billing → New Bill → attach to visit","hms_bills: 1 new row, bill_number auto-generated"],
    ["Add line items","Consultation fee, lab, medicines","hms_bill_items: rows per item"],
    ["Set payment","Mark as Cash/UPI/Card, enter amount","hms_bills: payment_status='paid', payment_mode set"],
    ["Issue receipt","Click 'Issue Receipt'","hms_payment_receipts: 1 new row"],
    ["Shift closing","End of day → Shift Closing → verify cash tally","hms_shift_closings: 1 new row, difference=0"],
  ],
  { 0:{cellWidth:90,fontStyle:"bold"}, 1:{cellWidth:165} }
);

// ══════════════════════════════════════════════════════════════
// SECTION 5 — SPINE AYUSH
// ══════════════════════════════════════════════════════════════
newPage();
h1("Section 5 — Spine AYUSH (End-to-End)", PURPLE);
para("The Spine AYUSH module is the core clinical differentiator. Test the full 5-step flow: Assess → Examine → Protocol → Treat → Track.");

h2("5.1 The 5-Step Spine Clinical Flow");
sectionFlow(["Assessment", "Posture Exam", "Build Protocol", "Deliver Session", "Track Outcome"]);

h2("5.2 Step-by-step test");
tbl(
  ["Step", "Where", "Action", "DB table to verify"],
  [
    ["1 — Assess","HMS → Spine → Assessment","Fill patient details, chief complaint, duration, VAS pain score (baseline e.g. 7/10)","spine_wellness_assessments or spine_leads"],
    ["2 — Posture Exam","HMS → Spine → Posture Assessment","Fill posterior/anterior/lateral findings, identify syndrome (e.g. Lower Cross)","spine_ayush_posture_assessments: 1 new row"],
    ["3 — Protocol","HMS → Spine → Treatment Protocol","Assign phased protocol (e.g. post_op), set sessions, goals","spine_therapy_prescriptions: 1 new row"],
    ["4a — Safety Check","HMS → Spine → Level 1 Session","Pre-treatment safety checklist must be 100% complete before proceeding","spine_checklists: all_clear=true"],
    ["4b — Deliver Session","Level 1 Session recorder","Record therapy, duration, body area, pain before/after, immediate response","spine_therapy_sessions: 1 new row"],
    ["4c — Checkpoints","Session checkpoints panel","Mark all checkpoints: preparation, execution, aftercare, safety","spine_therapy_sessions: checkpoints_done updated"],
    ["5 — Track Outcome","HMS → Spine → Outcome Tracker","Enter post-session VAS (e.g. 4/10), ROM, functional score","spine_recovery_scores: 1 new row"],
    ["Verify improvement","Outcome chart","Chart shows VAS improvement from 7 → 4 across sessions","spine_recovery_scores: vas_pain trend"],
  ],
  { 0:{cellWidth:75,fontStyle:"bold"}, 1:{cellWidth:90}, 2:{cellWidth:120} }
);

h2("5.3 Tele-Rehab Follow-Up (Spinal Injury)");
bullets([
  "HMS → Spine → Rehab Registry → Enroll patient with injury type 'post_op', injury level 'L4-L5', phase 'sub_acute'.",
  "DB verify: spine_injury_patients — 1 new row, assigned_protocol set.",
  "Go to Tele-Rehab Follow-Up → select patient → record week 1 check-in.",
  "Tick red flag: 'New neurological deficit appearing' → needs_referral should auto-set to true.",
  "DB verify: spine_rehab_followups — needs_referral=true, red_flags array populated.",
  "Verify patient's current_mobility is updated in spine_injury_patients.",
]);

h2("5.4 CSR Fund Test");
bullets([
  "HMS → Spine → CSR Fund & Sponsorship → confirm demo donor (₹5,00,000 grant) visible.",
  "Allocate ₹20,000 from donor to an enrolled injury patient.",
  "DB verify: spine_csr_allocations — 1 new row; spine_csr_donors — allocated_amount increased.",
  "Check patient row: spine_injury_patients — is_csr_sponsored=true.",
  "Public page test: open ayuzee.com/spine/impact (no login) — aggregate totals show, NO patient names visible.",
]);

// ══════════════════════════════════════════════════════════════
// SECTION 6 — SHOP & CHECKOUT
// ══════════════════════════════════════════════════════════════
newPage();
h1("Section 6 — Shop & Checkout (End-to-End)", AMBER);
sectionFlow(["Browse shop", "Add to cart", "Checkout", "Razorpay TEST", "Order confirmed", "DB verified"]);

h2("6.1 Full checkout test (Razorpay TEST mode)");
box("Razorpay test card details",
  ["Card: 4111 1111 1111 1111  |  Expiry: Any future date (e.g. 12/30)",
   "CVV: 123  |  Name: Any name  |  OTP: 1234",
   "Use these ONLY in test mode. Never use real card details in testing."],
  AMBER);

tbl(
  ["Step", "Action", "Expected result", "DB verify"],
  [
    ["1","Login as patient → go to /shop","Product grid with categories visible","—"],
    ["2","Click a product → 'Add to Cart'","Cart icon shows count = 1","—"],
    ["3","Go to /cart","Cart shows product, quantity, total","—"],
    ["4","Click 'Checkout'","Address form appears","—"],
    ["5","Fill delivery address (name, phone, address, city, pincode)","Form accepts input","—"],
    ["6","Click 'Pay Now'","Razorpay checkout modal opens","orders: 1 new row, status='pending'"],
    ["7","In Razorpay: select Card, fill test card details","Payment processing spinner","—"],
    ["8","Enter OTP: 1234","Payment accepted","orders: payment_status='paid', razorpay_payment_id set"],
    ["9","Redirect to order success page","'Thank you' or order confirmation shown","orders: order_status='confirmed'"],
    ["10","Check dashboard → My Orders","New order appears with order ID","orders: row with correct user_id"],
  ],
  { 0:{cellWidth:28,halign:"center"}, 1:{cellWidth:165}, 2:{cellWidth:120} }
);

h2("6.2 Prescription upload (shop)");
bullets([
  "Go to /shop → find a prescription-required product → add to cart.",
  "At checkout: 'Upload Prescription' prompt appears.",
  "Upload a PDF/image → click Submit.",
  "DB verify: Supabase Storage 'prescriptions' bucket — file uploaded.",
  "orders: prescription item present in items JSON.",
]);

// ══════════════════════════════════════════════════════════════
// SECTION 7 — ADMIN & SUPER ADMIN
// ══════════════════════════════════════════════════════════════
newPage();
h1("Section 7 — Admin & Super Admin Testing", RED);

h2("7.1 Admin access verification (Dr Sindhu Roja)");
tbl(
  ["Test", "Steps", "Pass condition"],
  [
    ["All HMS modules visible","Login as admin → go to /hms → check sidebar","All modules (OPD, Clinical, Lab, Stock, Accounts, MIS, Spine etc.) visible"],
    ["Owner pages blocked","Try to navigate to Spine Super Admin page","Redirected / access denied — admin cannot see owner-only pages"],
    ["Data write access","Create a new patient in OPD","Patient saved to hms_op_patients; admin sees it"],
    ["Admin can read all tables","Open MIS dashboard","Revenue, patient stats, all branches data visible"],
    ["Cannot change roles","No 'Role Management' or 'Grant Super Admin' UI visible","Super Admin cannot be granted by admin role"],
  ],
  { 0:{cellWidth:130,fontStyle:"bold"}, 1:{cellWidth:155} }
);

h2("7.2 Super Admin access verification (Owner)");
bullets([
  "Login as curesure4u@gmail.com (super_admin) → HMS → Spine section.",
  "Spine Super Admin page: accessible and shows all configuration options.",
  "Chief Physician page: accessible, shows full clinical overview.",
  "Platform Admin: can see all users, all roles, audit logs.",
  "Can grant/revoke HMS access to doctors via Access Requests.",
]);

h2("7.3 Role boundary tests");
tbl(
  ["Scenario", "User", "Expected"],
  [
    ["Patient tries to access /hms","Patient","Redirected away or access denied"],
    ["Doctor tries Spine Super Admin","Doctor (branch_doctor)","Access denied page"],
    ["Admin tries Spine Super Admin","Admin","Access denied (owner-only since our fix)"],
    ["Anon tries spine_csr_donors API","Not logged in","Returns [] — no data exposed"],
    ["Anon calls public impact RPC","Not logged in","Returns aggregate totals only — no PII"],
  ],
  { 0:{cellWidth:160,fontStyle:"bold"}, 1:{cellWidth:80} }
);

// ══════════════════════════════════════════════════════════════
// SECTION 8 — NOTIFICATIONS
// ══════════════════════════════════════════════════════════════
newPage();
h1("Section 8 — Notifications & Cross-Table Writes", BLUE);
para("This is the most important section. Every user action must trigger the correct DB writes AND notify the right people. This is what makes the app a real-time system.");

h2("8.1 Notification flow map");
tbl(
  ["Trigger event", "Who is notified", "How", "Tables written"],
  [
    ["Patient books appointment","Doctor","In-app notification + (future) WhatsApp","appointments; unified_notifications (doctor)"],
    ["Doctor issues prescription","Patient","In-app notification","hms_prescriptions; patient_prescribed_medicines; unified_notifications (patient)"],
    ["Lab result uploaded","Doctor + Patient","In-app alert","hms_lab_results; hms_lab_critical_alerts (if critical); bridge_lab_report_push"],
    ["Spine session completed","Patient","Follow-up reminder scheduled","spine_therapy_sessions; follow_up_reminders"],
    ["Red flag triggered in rehab","Referring doctor","Urgent notification","spine_rehab_followups: needs_referral=true; unified_notifications"],
    ["New CSR allocation","Admin","Internal log","spine_csr_allocations; spine_csr_donors (updated amounts)"],
    ["Package nearing expiry","Patient","Reminder","spine_patient_subscriptions; unified_notifications"],
    ["New referral application","Owner","In-app","spine_referral_applications: status='new'"],
  ],
  { 0:{cellWidth:130,fontStyle:"bold"}, 1:{cellWidth:80}, 2:{cellWidth:60} }
);

h2("8.2 Testing notification delivery");
bullets([
  "Step 1: Open the Supabase Dashboard → Table Editor → unified_notifications. Leave it open.",
  "Step 2: As a patient, book an appointment with a doctor.",
  "Step 3: Refresh unified_notifications — a new row must appear with user_id = doctor's ID, type='appointment_upcoming'.",
  "Step 4: Login as the doctor in a separate browser tab — the notification bell should show the new appointment.",
  "Step 5: Repeat for each trigger in the table above. DB row = notification was sent.",
]);

box("Why this matters",
  "A UI that shows 'Booking confirmed' but doesn't write to the appointments table or trigger a notification is a silent failure. Always check the DB after every action. A confirmed appointment with no DB row = the booking was lost.",
  RED);

h2("8.3 WhatsApp notifications (manual test — current state)");
bullets([
  "Currently: follow-up buttons generate a click-to-WhatsApp link (opens WhatsApp app with pre-filled message).",
  "Test: HMS → Spine → Follow-Up Rules → click 'Send Follow-up' for a patient → WhatsApp should open with the correct patient name and message pre-filled.",
  "Future: When WhatsApp Business API is connected, this will fire automatically without manual click.",
]);

// ══════════════════════════════════════════════════════════════
// SECTION 9 — SECURITY, PERFORMANCE, ACCESSIBILITY
// ══════════════════════════════════════════════════════════════
newPage();
h1("Section 9 — Security, Performance & Accessibility");

h2("9.1 Security tests");
tbl(
  ["Test", "How to test", "Pass condition"],
  [
    ["RLS blocks anon","Open browser DevTools → Network → call GET /rest/v1/spine_injury_patients with anon key","Returns [] — no patient data"],
    ["Protected routes redirect","Without logging in, go to /hms","Redirects to /auth login page"],
    ["No secrets in page source","View page source (Ctrl+U) on ayuzee.com","No API keys, passwords, or service role keys visible"],
    ["XSS prevention","In any search box, type: <script>alert('xss')</script>","No alert popup. Input treated as text."],
    ["HTTPS only","Open http://ayuzee.com","Auto-redirects to https://ayuzee.com"],
    ["Security headers","Open DevTools → Network → click any request → Response Headers","x-frame-options, x-content-type-options present"],
  ],
  { 0:{cellWidth:120,fontStyle:"bold"}, 1:{cellWidth:165} }
);

h2("9.2 Performance benchmarks");
tbl(
  ["Page", "Target load time", "How to measure"],
  [
    ["Home (/)", "< 3 seconds", "Chrome DevTools → Network → DOMContentLoaded time"],
    ["HMS Dashboard (/hms)", "< 4 seconds", "Same — after login"],
    ["Spine AYUSH (/hms/spine-ayush-modules)", "< 3 seconds", "Same"],
    ["Shop (/shop)", "< 3 seconds", "Same"],
    ["Doctors (/doctors)", "< 3 seconds", "Same"],
  ],
  { 0:{cellWidth:150,fontStyle:"bold"}, 1:{cellWidth:100} }
);
para("To run a full Lighthouse audit: open Chrome DevTools → Lighthouse tab → Run audit. Target scores: Performance >80, Accessibility >90, Best Practices >90, SEO >90.");

h2("9.3 Mobile responsiveness");
bullets([
  "Open Chrome DevTools → Toggle device toolbar (Ctrl+Shift+M) → select iPhone 14 Pro (390×844).",
  "Test: Home page, /auth login, /doctors, /shop, /patient/dashboard.",
  "All buttons must be tappable (min 44×44px), text must be readable, no horizontal scroll.",
  "HMS modules: check sidebar collapses to hamburger menu on mobile.",
]);

h2("9.4 Accessibility quick check");
bullets([
  "Install axe DevTools Chrome extension (free).",
  "Open each main page → click axe icon → Run Analysis.",
  "Zero 'Critical' or 'Serious' violations is the target.",
  "Common issues to look for: missing form labels, insufficient color contrast, images without alt text.",
]);

// ══════════════════════════════════════════════════════════════
// SECTION 10 — DATABASE VERIFICATION CHECKLIST
// ══════════════════════════════════════════════════════════════
newPage();
h1("Section 10 — Database Verification Checklist", GREEN);
para("After each manual test, run these SQL queries in the Supabase Dashboard → SQL Editor to confirm the data was saved correctly.");

h2("10.1 Quick verification queries");
doc.setFillColor(15, 23, 42); doc.rect(M, y, CW, 310, "F");
doc.setFont("courier","normal"); doc.setFontSize(7.8); doc.setTextColor(134, 239, 172);
const sqlLines = [
  "-- After patient signup:",
  "SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 3;",
  "",
  "-- After OPD patient registration:",
  "SELECT patient_id, first_name, mobile, created_at FROM hms_op_patients",
  "ORDER BY created_at DESC LIMIT 5;",
  "",
  "-- After appointment booking:",
  "SELECT id, patient_name, appointment_date, status, payment_status",
  "FROM hms_appointment_bookings ORDER BY created_at DESC LIMIT 5;",
  "",
  "-- After prescription issued:",
  "SELECT id, patient_name, doctor_name, diagnosis, is_signed, signed_at",
  "FROM hms_prescriptions ORDER BY created_at DESC LIMIT 5;",
  "",
  "-- After spine therapy session:",
  "SELECT id, patient_id, session_date, therapy_name, pain_before, pain_after, status",
  "FROM spine_therapy_sessions ORDER BY created_at DESC LIMIT 5;",
  "",
  "-- After notification triggered:",
  "SELECT id, user_id, title, type, is_read, created_at",
  "FROM unified_notifications ORDER BY created_at DESC LIMIT 10;",
  "",
  "-- After billing:",
  "SELECT bill_number, patient_name, total_amount, payment_status, payment_mode",
  "FROM hms_bills ORDER BY created_at DESC LIMIT 5;",
  "",
  "-- Verify anon cannot read patient data (should return 0):",
  "SELECT COUNT(*) FROM hms_op_patients;  -- run as anon JWT to verify RLS",
];
sqlLines.forEach((ln, i) => {
  if (ln.startsWith("--")) doc.setTextColor(156, 163, 175);
  else doc.setTextColor(134, 239, 172);
  doc.text(ln, M + 10, y + 16 + i * 11);
});
y += 325;

h2("10.2 What a passing test looks like");
tbl(
  ["Test scenario", "DB rows that must exist after test"],
  [
    ["Patient signed up","auth.users: new row; profiles: new row; user_roles: role='patient'"],
    ["Appointment booked","appointments OR hms_appointment_bookings: 1 new row with correct patient + doctor IDs"],
    ["OPD visit completed","hms_op_patients: 1 new row; hms_op_visits: 1 new row; hms_triage_records: vitals row"],
    ["Prescription issued","hms_prescriptions: is_signed=true; hms_prescription_items: 1+ rows"],
    ["Spine session done","spine_therapy_sessions: 1 new row; spine_checklists: all_clear=true (if Level 1)"],
    ["Payment completed","orders OR hms_bills: payment_status='paid'; razorpay_payment_id/reference set"],
    ["Notification sent","unified_notifications: new row for recipient user_id"],
    ["Lab report pushed","bridge_lab_report_push: push_status='pushed_to_app'; patient_health_documents: new row"],
  ],
  { 0:{cellWidth:145,fontStyle:"bold"} }
);

// ══════════════════════════════════════════════════════════════
// SECTION 11 — AUTOMATED TESTS (PLAYWRIGHT)
// ══════════════════════════════════════════════════════════════
newPage();
h1("Section 11 — Running Automated Tests (Playwright)", PURPLE);
para("Your project already has Playwright installed and 13 test specs ready. Here is how to run them.");

h2("11.1 Available test specs");
tbl(
  ["Spec file", "What it tests", "Needs credentials?"],
  [
    ["auth.spec.ts","Signup, login, wrong password","Yes (E2E_PATIENT_*)"],
    ["booking.spec.ts","Book appointment with doctor","Yes"],
    ["checkout.spec.ts","Shop cart + Razorpay test payment","Yes"],
    ["doctor-prescription.spec.ts","Doctor writes prescription","Yes (E2E_DOCTOR_*)"],
    ["security.spec.ts","Headers, XSS, no secrets in HTML","No"],
    ["performance.spec.ts","Load times, LCP, bundle size","No"],
    ["accessibility.spec.ts","WCAG 2.1 AA compliance (axe)","No"],
    ["broken-links.spec.ts","No 404 links on key pages","No"],
    ["password-reset.spec.ts","Forgot password flow","Yes"],
    ["mobile-check.spec.ts","Mobile viewport responsive","No"],
    ["seo.spec.ts","Meta tags, Open Graph, sitemap","No"],
    ["suggestion-autocomplete.spec.ts","Search/autocomplete","Partial"],
    ["mis-drilldown-params.spec.ts","MIS report drill-down","Yes"],
  ],
  { 0:{cellWidth:155,fontStyle:"bold"}, 1:{cellWidth:160}, 2:{cellWidth:75,halign:"center"} }
);

h2("11.2 Setup & run commands");
doc.setFillColor(15, 23, 42); doc.rect(M, y, CW, 155, "F");
doc.setFont("courier","normal"); doc.setFontSize(8.5); doc.setTextColor(134, 239, 172);
const cmdLines = [
  "# 1. Create .env.e2e with your real test credentials (see Section 1.2)",
  "",
  "# 2. Install browsers (first time only)",
  "npx playwright install chromium",
  "",
  "# 3. Run ALL tests against live site",
  "npx playwright test --project=chromium",
  "",
  "# 4. Run only non-credential tests (safe to run anytime)",
  "npx playwright test security performance accessibility seo mobile-check broken-links",
  "",
  "# 5. Run a single spec",
  "npx playwright test auth.spec.ts",
  "",
  "# 6. Open the HTML report after running",
  "npx playwright show-report",
];
cmdLines.forEach((ln, i) => {
  if (ln.startsWith("#")) doc.setTextColor(156, 163, 175);
  else doc.setTextColor(134, 239, 172);
  doc.text(ln, M + 10, y + 16 + i * 9.5);
});
y += 168;

h2("11.3 Reading the test report");
bullets([
  "Green PASSED = the flow worked and the UI showed the expected result.",
  "Red FAILED = either the UI changed, the credentials were wrong, or there is a real bug.",
  "On failure: Playwright saves a screenshot + trace. Open with: npx playwright show-report",
  "Trace viewer shows every click, every network request, every DOM state — use it to pinpoint exactly where the failure happened.",
]);

box("Recommended test cadence",
  ["Daily: Run security + performance + accessibility (no credentials needed, fast).",
   "Before every deploy: Run auth + booking + checkout + doctor-prescription.",
   "Weekly: Run all 13 specs with fresh credentials."],
  PURPLE);

// ══════════════════════════════════════════════════════════════
// SECTION 12 — BUG REPORT TEMPLATE
// ══════════════════════════════════════════════════════════════
newPage();
h1("Section 12 — Bug Report Template", RED);
para("When you find an issue during testing, use this template to report it. A good bug report gets it fixed fast.");

tbl(
  ["Field", "What to fill"],
  [
    ["Title","Short, specific: 'Appointment booking — no row in appointments table after booking'"],
    ["Section","Which section from this guide (e.g. Section 3.1 — Book Appointment)"],
    ["Severity","Critical (data lost/security) / High (feature broken) / Medium (wrong UI) / Low (cosmetic)"],
    ["Steps to reproduce","Numbered step-by-step: 1. Login as patient 2. Go to /doctors 3. Click Book..."],
    ["Expected result","What SHOULD happen: 'A new row in appointments table with status=pending'"],
    ["Actual result","What DID happen: 'No row in appointments table; UI showed confirmation toast'"],
    ["DB state","Paste the SQL query output from Section 10 showing the missing/wrong data"],
    ["Screenshot","Attach the screenshot (Playwright saves these automatically on failure)"],
    ["Browser + OS","e.g. Chrome 126 on macOS 14.5"],
    ["Reproducible?","Yes always / Sometimes / Only once"],
  ],
  { 0:{cellWidth:110,fontStyle:"bold"} }
);

h2("Severity guide");
tbl(
  ["Severity", "Definition", "Example", "Fix timeline"],
  [
    ["🔴 Critical","Data lost, security breach, auth broken","Patient data readable by anon; login fails for all users","Fix immediately"],
    ["🟠 High","Core feature broken, wrong DB write","Appointment booked but no DB row; prescription not saving","Fix before going live"],
    ["🟡 Medium","Feature partially works, wrong behaviour","Wrong patient name in notification; filter not working","Fix in next sprint"],
    ["🟢 Low","Cosmetic, minor UX","Button colour wrong; text truncated; icon missing","Fix when convenient"],
  ],
  { 0:{cellWidth:75,fontStyle:"bold"}, 1:{cellWidth:120}, 2:{cellWidth:120} }
);

box("The most important rule of testing",
  "Every test is only complete when you have verified the database. The UI can show success while the backend silently failed. Open Supabase → SQL Editor → run the verification query from Section 10 after EVERY test. No DB row = the test failed, regardless of what the screen shows.",
  RED);

// ═══════════ finalize ═══════════
footer();
const buf = doc.output("arraybuffer");
writeFileSync(OUT, Buffer.from(buf));
console.log("PDF written →", OUT);
console.log("Pages:", doc.getNumberOfPages());
