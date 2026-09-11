/**
 * Generates "Spine AYUSH — Implementation Strategy & Architecture Guide" as a PDF.
 * Run: node scripts/generate-spine-ayush-guide.mjs
 * Output: public/Spine_AYUSH_Implementation_Guide.pdf
 *
 * Uses jspdf (already a project dependency). No browser / no network needed.
 */
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "Spine_AYUSH_Implementation_Guide.pdf");

// ─── palette ───
const GREEN = [22, 128, 92];
const DARK = [30, 41, 59];
const GREY = [100, 116, 139];
const LIGHT = [241, 245, 249];
const ACCENT = [16, 100, 60];

const doc = new jsPDF({ unit: "pt", format: "a4" });
const PAGE_W = doc.internal.pageSize.getWidth();
const PAGE_H = doc.internal.pageSize.getHeight();
const MARGIN = 48;
const CONTENT_W = PAGE_W - MARGIN * 2;
let y = MARGIN;

// ─── helpers ───
function footer() {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...GREY);
    doc.setFont("helvetica", "normal");
    doc.text("Ayuzee HMS · Spine AYUSH Implementation Guide · Confidential", MARGIN, PAGE_H - 24);
    doc.text(`Page ${i} of ${pages}`, PAGE_W - MARGIN, PAGE_H - 24, { align: "right" });
    doc.setDrawColor(...LIGHT);
    doc.line(MARGIN, PAGE_H - 34, PAGE_W - MARGIN, PAGE_H - 34);
  }
}
function ensure(space) {
  if (y + space > PAGE_H - 60) { doc.addPage(); y = MARGIN; }
}
function h1(text) {
  ensure(46);
  doc.setFillColor(...GREEN);
  doc.rect(MARGIN, y, 4, 22, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...DARK);
  doc.text(text, MARGIN + 12, y + 17);
  y += 34;
}
function h2(text) {
  ensure(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.setTextColor(...ACCENT);
  doc.text(text, MARGIN, y + 12);
  y += 24;
}
function para(text, opts = {}) {
  const size = opts.size || 10;
  const color = opts.color || DARK;
  doc.setFont("helvetica", opts.bold ? "bold" : "normal");
  doc.setFontSize(size);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(text, opts.width || CONTENT_W);
  lines.forEach((ln) => {
    ensure(size + 4);
    doc.text(ln, opts.x || MARGIN, y);
    y += size + 4;
  });
  y += 4;
}
function bullets(items, opts = {}) {
  const size = 10;
  doc.setFontSize(size);
  items.forEach((it) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GREEN);
    const lines = doc.splitTextToSize(it, CONTENT_W - 18);
    ensure(lines.length * (size + 4) + 2);
    doc.text("•", MARGIN + 4, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...DARK);
    lines.forEach((ln, idx) => {
      doc.text(ln, MARGIN + 18, y);
      if (idx < lines.length - 1) y += size + 4;
    });
    y += size + 6;
  });
  y += 2;
}
function calloutBox(title, text, color = GREEN) {
  const lines = doc.splitTextToSize(text, CONTENT_W - 28);
  const boxH = 22 + lines.length * 13 + 10;
  ensure(boxH + 10);
  doc.setFillColor(...LIGHT);
  doc.roundedRect(MARGIN, y, CONTENT_W, boxH, 6, 6, "F");
  doc.setDrawColor(...color);
  doc.setLineWidth(2);
  doc.line(MARGIN, y, MARGIN, y + boxH);
  doc.setLineWidth(0.2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...color);
  doc.text(title, MARGIN + 14, y + 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...DARK);
  let ty = y + 32;
  lines.forEach((ln) => { doc.text(ln, MARGIN + 14, ty); ty += 13; });
  y += boxH + 14;
}
function table(head, body, colStyles) {
  ensure(60);
  autoTable(doc, {
    startY: y,
    head: [head],
    body,
    margin: { left: MARGIN, right: MARGIN },
    styles: { font: "helvetica", fontSize: 8.7, cellPadding: 5, textColor: DARK, lineColor: [226, 232, 240], lineWidth: 0.4, valign: "middle" },
    headStyles: { fillColor: GREEN, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8.9 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: colStyles || {},
    tableWidth: CONTENT_W,
  });
  y = doc.lastAutoTable.finalY + 16;
}

// ═══════════════════════ COVER ═══════════════════════
doc.setFillColor(...GREEN);
doc.rect(0, 0, PAGE_W, 200, "F");
doc.setFillColor(...ACCENT);
doc.rect(0, 188, PAGE_W, 12, "F");
doc.setFont("helvetica", "bold");
doc.setFontSize(30);
doc.setTextColor(255, 255, 255);
doc.text("Spine AYUSH", MARGIN, 92);
doc.setFontSize(18);
doc.text("Implementation Strategy & Architecture", MARGIN, 122);
doc.setFont("helvetica", "normal");
doc.setFontSize(11);
doc.text("Step-by-step guidance: from initial setup to full-scale operation", MARGIN, 150);

y = 250;
doc.setFont("helvetica", "bold");
doc.setFontSize(13);
doc.setTextColor(...DARK);
doc.text("Ayuzee Hospital Management System", MARGIN, y); y += 22;
doc.setFont("helvetica", "normal");
doc.setFontSize(10.5);
doc.setTextColor(...GREY);
doc.text("Integrative Spine Care · Ayurveda + Yoga + Modern Rehab", MARGIN, y); y += 16;
doc.text("Owner: Chief Ayurvedic Physician / Super Admin", MARGIN, y); y += 16;
doc.text("Platform: ayuzee.com", MARGIN, y); y += 40;

calloutBox(
  "How to use this document",
  "This guide is organized in 5 phases. Do NOT try to do everything at once. Complete each phase, run it with real patients for a week, then move to the next. Each phase builds on the one before. The single biggest risk is building wide instead of deep — resist adding new features until the current phase is battle-tested.",
  GREEN
);
para("Prepared as an operating playbook for the practice owner and the platform admin (Dr Sindhu Roja). Review clinical content with a qualified physician before any patient acts on it. Software assists the clinician; it never replaces clinical judgment.", { size: 9, color: GREY });

// ═══════════════════════ CONTENTS ═══════════════════════
doc.addPage(); y = MARGIN;
h1("What This Covers");
para("A practical, phased architecture for running a spine-focused AYUSH practice on Ayuzee HMS. It answers three questions in order: (1) What do I set up first? (2) How do I run daily operations reliably? (3) How do I grow and scale without breaking?", {});
table(
  ["Phase", "Focus", "Outcome"],
  [
    ["0 — Foundation", "Roles, branch, master data, safety", "A safe, configured system"],
    ["1 — Core Clinical", "The one patient journey, end to end", "Treat & track a real patient"],
    ["2 — Retention & Ops", "Follow-ups, packages, daily command center", "No patient forgotten; cash tracked"],
    ["3 — Growth", "Referrals, content, offers, longevity", "Predictable new-patient flow"],
    ["4 — Scale & Impact", "Franchise, rehab, CSR, integrations", "Multi-center, mission-driven growth"],
  ],
  { 0: { cellWidth: 92, fontStyle: "bold" }, 1: { cellWidth: 200 } }
);
calloutBox("The golden rule", "Feature-complete is not the same as operationally ready. Value comes from connecting what you have to real patients — not from adding more screens.", ACCENT);

// ═══════════════════════ GUIDING PRINCIPLES ═══════════════════════
h1("Guiding Principles (read first)");
bullets([
  "One patient, one flow: every patient moves through Assess -> Examine -> Protocol -> Treat -> Track. Master this loop before anything else.",
  "Safety before speed: the pre-treatment safety checklist gates Level-1 sessions. Never bypass it. Red-flag referral rules exist to protect the patient and you.",
  "Depth over width: a few modules used daily beat many modules used never. Turn features on only when the previous phase is stable.",
  "Clinician owns the record: AI/templates draft; the physician reviews and signs. Keep that line bright for liability and trust.",
  "Retention is the business: spine recovery needs 8-12 sessions. Drop-off after session 3 is where revenue leaks. Follow-ups are not optional.",
  "Measure outcomes honestly: VAS pain, ROM, functional scores before/after. Real data builds real testimonials and real referrals.",
]);

// ═══════════════════════ PHASE 0 ═══════════════════════
h1("Phase 0 — Foundation & Safety Setup");
para("Goal: a correctly configured, secure system before a single real patient is entered. This is the least glamorous phase and the most important.", { color: GREY });
h2("0.1 People & Access");
bullets([
  "Owner (you): Super Admin — full implementation power, owner-only Spine pages (Super Admin, Chief Physician).",
  "Admin (Dr Sindhu Roja): admin role — all HMS + Ayuzee modules for building real data; no super-admin/owner tier. (Already configured.)",
  "Add staff later with least-privilege roles: receptionist, therapist, pharmacist, lab_tech, nurse — each sees only their modules.",
]);
h2("0.2 Branch & Clinic Profile");
bullets([
  "Create the main branch: name, address, city, phone, WhatsApp, AYUSH license no., GSTIN, opening hours.",
  "Set the clinic's systems practiced and specialties (spine, panchakarma, etc.).",
  "This drives billing headers, geo-SEO pages, and patient-card details later.",
]);
h2("0.3 Master Data & Safety Templates");
bullets([
  "Seed / review the SOP & Safety checklists: pre-treatment safety, daily open/close, onboarding, PK pre-procedure.",
  "Review the seeded rehab protocols, therapy checkpoints, and drug-interaction data with a physician before use.",
  "Confirm the pre-treatment safety gate is active on the Level-1 session recorder.",
]);
calloutBox("Phase 0 exit criteria", "Roles assigned, branch created, safety checklists live, protocol content physician-reviewed. Security: enable leaked-password protection; lock down any views exposing patient data to anon before real data entry.", GREEN);

// ═══════════════════════ PHASE 1 ═══════════════════════
h1("Phase 1 — Core Clinical Journey");
para("Goal: take ONE real patient from first contact to tracked outcome. If this loop works smoothly, you have a clinic. Everything else is amplification.", { color: GREY });
h2("The 5-step flow");
table(
  ["Step", "What happens", "Where in Ayuzee"],
  [
    ["1. Assess", "AI assessment / intake, chief complaint, history", "Spine AYUSH -> Assessment"],
    ["2. Examine", "Posture, ROM, dosha, functional exam", "Spine AYUSH -> Examination"],
    ["3. Protocol", "Build phased treatment protocol + care plan", "Treatment Protocol Builder"],
    ["4. Treat", "Deliver Level-1/2 session; safety checklist first", "Level 1 / Level 2 Session"],
    ["5. Track", "VAS, ROM, functional & recovery scores", "Outcome Tracker"],
  ],
  { 0: { cellWidth: 70, fontStyle: "bold" }, 1: { cellWidth: 230 } }
);
h2("1.1 Daily use");
bullets([
  "Use the Spine Command Center as the home screen — it shows the ONE next action per patient.",
  "Register the patient once; reuse across visits. Capture VAS pain at baseline (this is your outcome anchor).",
  "Record every session honestly, including adverse or minimal responses — that data protects you and improves protocols.",
]);
calloutBox("Phase 1 exit criteria", "You have treated at least one real patient through all 5 steps, recorded baseline + post VAS, and can show a before/after outcome. Do this for 5-10 patients before Phase 2.", GREEN);

// ═══════════════════════ PHASE 2 ═══════════════════════
h1("Phase 2 — Retention & Daily Operations");
para("Goal: stop patients falling through the cracks and start tracking money. This is where a clinic becomes a sustainable practice.", { color: GREY });
h2("2.1 Follow-up engine");
bullets([
  "Set your follow-up rules once (Day-1 check-in, missed-appointment, mid-treatment, package-ending, 30-day maintenance, referral request).",
  "Use the 'Due Now' list daily. Until WhatsApp Business API is connected, use click-to-WhatsApp links to send in one tap.",
  "Result: +course completion, -drop-offs, more referrals.",
]);
h2("2.2 Packages, memberships & cash");
bullets([
  "Create subscription/membership plans and time-limited offers.",
  "Track package usage per patient; flag when 3 sessions remain (upsell moment).",
  "Connect Razorpay payment links so packages/memberships can actually be collected (Integrations page has the guide).",
]);
h2("2.3 The daily command center");
bullets([
  "Morning: review today's queue and follow-ups due.",
  "Per patient: one next action, one tap.",
  "End of day: close the loop — pending follow-ups sent, tomorrow planned.",
]);
calloutBox("Phase 2 exit criteria", "Follow-ups going out daily (even if manual one-tap), at least one paid package/membership recorded, and a daily open/close routine in place.", GREEN);

// ═══════════════════════ PHASE 3 ═══════════════════════
h1("Phase 3 — Growth & Demand Generation");
para("Goal: a predictable flow of new patients that does not depend on you personally chasing leads.", { color: GREY });
h2("3.1 Referral & influencer network");
bullets([
  "Onboard patient advocates, ethical medico referrers, and influencers via the Referral Network Hub.",
  "Share the public sign-up page (/spine/refer). Enable ?ref= link auto-attribution so credit is never lost.",
  "Keep medico referrals ethical (recognition / reciprocal), not cash-per-head — aligns with India medical ethics.",
]);
h2("3.2 Content & trust");
bullets([
  "Publish success stories (with consent) — before/after VAS is powerful social proof.",
  "Use the Video Library (YouTube embeds), Social Hub, and Patient Library to educate and retain.",
  "Run offers/promotions for seasonal or condition-specific campaigns.",
]);
h2("3.3 Longevity & retention products");
bullets([
  "Wellness Age tracker and Rejuvenation (Rasayana) programs turn one-time patients into long-term members.",
  "Retreats / boot camps create high-value annual touchpoints.",
]);
calloutBox("Phase 3 exit criteria", "At least one active referrer bringing attributed leads, 3+ published success stories, and one running offer or campaign.", GREEN);

// ═══════════════════════ PHASE 4 ═══════════════════════
h1("Phase 4 — Scale, Rehab & Social Impact");
para("Goal: expand beyond a single clinic and add mission-driven depth — carefully, only once Phases 1-3 are solid.", { color: GREY });
h2("4.1 Multi-center / franchise");
bullets([
  "Use the Franchise Hub: setup wizard, layout planner, operations dashboard, cost calculator, staff roster, patient portal.",
  "Each center gets least-privilege staff roles and its own branch data.",
]);
h2("4.2 Spinal Injury Rehab (sub-acute / chronic adjunct)");
bullets([
  "Enroll post-op / SCI / trauma / degenerative patients in the Rehab Registry with phased protocols.",
  "Tele-rehab follow-ups monitor the 7 complication red-flags (dysreflexia, pressure sore, UTI, new deficit, DVT, respiratory, wound infection) and flag referral needs.",
  "Guardrail: this is supportive/adjunct care, NOT acute emergency management.",
]);
h2("4.3 CSR & public impact");
bullets([
  "Track donor grants and patient sponsorships in the CSR Fund Manager.",
  "The public /spine/impact page shows anonymized aggregate impact for corporate donors — no patient PII.",
  "Compliance note: software tracks allocation/impact; fund receipt, 80G, CSR-1 and audit are handled by your CA/finance.",
]);
h2("4.4 Integrations");
bullets([
  "WhatsApp Business API for fully-automatic messaging.",
  "Razorpay for online payments.",
  "ABDM/ABHA for national health-record interoperability when ready.",
]);
calloutBox("Phase 4 exit criteria", "A second center or rehab/CSR program running on real data, with integrations connected where external accounts exist.", GREEN);

// ═══════════════════════ ARCHITECTURE ═══════════════════════
h1("Technical Architecture (reference)");
para("For the admin/technical operator. The platform is a React + Vite + TypeScript front end on Netlify (ayuzee.com), backed by Supabase (Postgres + Auth + RLS).", {});
table(
  ["Layer", "Technology", "Notes"],
  [
    ["Frontend", "React + Vite + TypeScript", "Deployed to Netlify (ayuzee.com)"],
    ["Backend", "Supabase Postgres", "Row-Level Security on all tables"],
    ["Auth", "Supabase Auth", "Roles in user_roles; HMS access via doctors row"],
    ["Access model", "admin / super_admin + hms_role", "admin = all modules; super_admin = owner-only"],
    ["Data safety", "RLS owner + admin policies", "Public data only via SECURITY DEFINER aggregate RPCs"],
  ],
  { 0: { cellWidth: 90, fontStyle: "bold" }, 1: { cellWidth: 150 } }
);
h2("Access tiers");
bullets([
  "super_admin (owner): implementation power + owner-only Spine pages. Reserved for the chief physician.",
  "admin: all HMS + Ayuzee modules for daily operations and data building (Dr Sindhu Roja).",
  "Staff roles: least-privilege, module-scoped (receptionist, therapist, pharmacist, lab_tech, nurse).",
]);
calloutBox("Data privacy principle", "Patient and donor records are owner/admin-scoped by RLS. Anything shown publicly (e.g. impact page) must come through an aggregate, PII-free RPC — never a direct table read.", ACCENT);

// ═══════════════════════ RISKS & NEXT ═══════════════════════
h1("Key Risks & Priorities");
table(
  ["Priority", "Action", "Why it matters"],
  [
    ["1", "Connect click-to-WhatsApp / WhatsApp API", "Retention engine is inert without real messaging"],
    ["2", "Enable ?ref= lead auto-attribution", "Referral credit is currently lost at intake"],
    ["3", "Connect Razorpay payment links", "Packages/memberships can't be collected yet"],
    ["4", "Fix views exposing auth.users to anon", "Patient-data exposure risk before real data"],
    ["5", "Enable leaked-password protection", "Account security for admins with data access"],
    ["6", "Pilot 1 week with real patients", "Reveals friction no feature-building can"],
  ],
  { 0: { cellWidth: 54, halign: "center", fontStyle: "bold" }, 1: { cellWidth: 210 } }
);
calloutBox(
  "Final expert advice",
  "Freeze new features. Connect the last mile (messaging, payments, attribution). Harden security before real patient data. Then pilot with real patients for a week. That is what turns an impressive build into a working, defensible clinical business.",
  GREEN
);

// finalize
footer();
const arrayBuffer = doc.output("arraybuffer");
writeFileSync(OUT, Buffer.from(arrayBuffer));
console.log("PDF written to:", OUT);
