## ASTG Prompt 6 — Clinical Integration & Patient Tools

Building 6 features on top of the existing ASTG module, following the stated design principles (speed, scannable tables, Level 1 default, Sanskrit+Modern paired, no extra login, jsPDF printouts).

### 1. Full medicine formulary ↔ Pharma Exchange supplier link
- Add `supplier_product_id UUID` + `supplier_sku TEXT` columns to `astg_medicines` (nullable, FK to `products.id`).
- Admin ASTG Management: add a "Link Supplier" picker per medicine row (searches `products` table).
- Disease detail medicine table: show supplier availability badge ("In Pharma Exchange ✓" / "Not yet linked"), with price + stock pulled from `products`/`product_inventory`.

### 2. "Prescribe & Order" button on medicine tables
- New row-level button next to each linked medicine.
- Opens a slide-over that:
  - Prompts for patient (search `vaidya_patients` for current doctor) or uses currently-open patient from context.
  - Captures dose/anupana/duration (pre-filled from ASTG row) and qty.
  - On submit: creates a row in `prescription_orders` linked to the patient + product, and writes a corresponding entry into `orders` / `order_items` as a doctor-initiated order draft.
- Toast confirmation + link to the patient's order.

### 3. "Book Panchakarma" button on Level 3 protocols
- On any `astg_treatment_levels` row where `level_number = 3` and `panchakarma_details` is non-empty, render a primary button.
- Click → navigate to `/vaidya/appointments/new?type=panchakarma&disease=<id>&protocol=<level_id>` (existing Vaidya HMS booking screen), prefilling therapy + clinical note from the protocol summary.

### 4. ASTG Patient Handout (multilingual PDF)
- New `astg_handouts` translation table: `disease_id`, `language` (en/ta/ml/hi), `pathya_translated`, `apathya_translated`, `lifestyle_notes`.
- "Patient Handout" button on disease detail → language selector (English / Tamil / Malayalam / Hindi) → jsPDF generates a one-page card:
  - Header: disease name (Sanskrit + Modern + selected language).
  - Two columns: ✅ Pathya (Do) / ❌ Apathya (Avoid) as bullet lists in the chosen script.
  - Footer: clinic name + doctor name + date.
- Use embedded Noto Sans Tamil/Malayalam/Devanagari fonts (load lazily from CDN as base64 only when that language is picked).

### 5. Pediatric dosing auto-adjust
- Add a "Pediatric Mode" toggle on the medicine table header. When on, prompt for child weight (kg) and age (years).
- Apply **Clark's rule** for weight (`adultDose × weight_kg / 70`) and **Young's rule** for age (`adultDose × age / (age + 12)`); show both.
- Parse numeric dose + unit from `dose` text (e.g. "500 mg BD", "10 ml TDS") with a small regex util; fall back to "Consult pediatric Vaidya" when un-parseable.
- Render adjusted dose in a highlighted column without mutating stored data.

### 6. Cross-reference with EDL
- For each medicine, match `astg_medicines.medicine_name` against `essential_drugs`, `essential_unani_drugs`, `essential_siddha_drugs`, `essential_homeopathy_drugs` (case-insensitive trigram).
- Show an "EDL ✓ Ayurveda" / "EDL ✓ Siddha" badge in the table; click → drawer with the full EDL monograph (dose, indications, precautions).
- Pre-compute matches in a new SQL view `astg_medicine_edl_matches` for instant lookup.

### Files
- Migration: alter `astg_medicines`, create `astg_handouts`, create view `astg_medicine_edl_matches`.
- `src/components/astg/MedicineTable.tsx` — refactor to host all new actions (supplier badge, Prescribe & Order, Pediatric toggle, EDL badge).
- `src/components/astg/PrescribeOrderDialog.tsx` — new.
- `src/components/astg/PatientHandoutDialog.tsx` — new (jsPDF + lazy font loader).
- `src/components/astg/BookPanchakarmaButton.tsx` — new.
- `src/lib/astg-pediatric.ts` — dose parser + Clark/Young calc + unit tests inline.
- `src/lib/astg-edl.ts` — EDL lookup helper.
- `src/pages/admin/ASTGManagement.tsx` — supplier picker, handout translations editor.
- `src/pages/doctor/ASTGDiseaseDetail.tsx` — integrate new buttons, keep Level 1 as default tab (already the case).

### Design adherence
- Tables stay zebra-striped, single-tap reveal, Sanskrit + Modern paired in every header, Level 1 tab default, every disease page keeps the existing "Print Protocol" jsPDF action plus the new "Patient Handout" action.

Shipping all 6 in one pass; respond "go" to start with the migration.