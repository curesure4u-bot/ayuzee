-- ============================================================
-- HMS STOCK MODULE - COMPREHENSIVE SAMPLE DATA
-- Run in Supabase SQL Editor after creating tables
-- Seeds: hms_ward_stores, hms_ward_stock_items,
--         hms_ward_consumption_log, hms_ward_stock_transfers
-- ============================================================

-- Helper: get a valid user ID
DO $$
DECLARE _uid UUID;
BEGIN
  SELECT id INTO _uid FROM auth.users LIMIT 1;
  IF _uid IS NULL THEN RAISE EXCEPTION 'No users found - create a user first'; END IF;
  CREATE TEMP TABLE IF NOT EXISTS _ctx (uid UUID);
  DELETE FROM _ctx;
  INSERT INTO _ctx VALUES (_uid);
END $$;

-- ════════════════════════════════════════════════════════════
-- 1. WARD STORES (6 stores across locations)
-- ════════════════════════════════════════════════════════════

INSERT INTO hms_ward_stores (ward_name, department, store_code, location, store_type, auto_reorder, is_active)
VALUES
('ALSHIFA Main Pharmacy', 'Pharmacy', 'WS-MAIN-01', 'Kadayanallur', 'pharmacy', true, true),
('IP Pharmacy Store', 'Inpatient', 'WS-IP-01', 'Kadayanallur', 'ward', true, true),
('Panchakarma Store', 'Panchakarma', 'WS-PK-01', 'Kadayanallur', 'panchakarma', true, true),
('OT Store', 'Surgery', 'WS-OT-01', 'Kadayanallur', 'ot', false, true),
('Rajapalayam Branch', 'Pharmacy', 'WS-RAJA-01', 'Rajapalayam', 'pharmacy', true, true),
('Tirunelveli Branch', 'Pharmacy', 'WS-TVLI-01', 'Tirunelveli', 'pharmacy', true, true)
ON CONFLICT (store_code) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 2. WARD STOCK ITEMS (25 products across stores)
-- ════════════════════════════════════════════════════════════

INSERT INTO hms_ward_stock_items (ward_store_id, product_name, product_category, batch_number, expiry_date, quantity_available, quantity_unit, min_stock_level, max_stock_level, cost_per_unit, is_critical)
SELECT id, 'Rasnasaptakam Kashayam 200ml', 'Kashayam', 'RSK-2026-A', '2027-06-30'::DATE, 85, 'bottles', 10, 200, 210.00, false FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01'
UNION ALL
SELECT id, 'Simhanada Guggulu 60 tabs', 'Guggulu', 'SNG-2026-B', '2027-12-31'::DATE, 120, 'bottles', 15, 300, 150.00, false FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01'
UNION ALL
SELECT id, 'Kottamchukkadi Taila 200ml', 'Taila', 'KCT-2026-C', '2027-09-30'::DATE, 45, 'bottles', 8, 100, 280.00, false FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01'
UNION ALL
SELECT id, 'Ashwagandha Churna 100g', 'Churna', 'ASC-2026-D', '2028-03-31'::DATE, 200, 'packets', 20, 500, 160.00, false FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01'
UNION ALL
SELECT id, 'Dashamoolarishtam 450ml', 'Arishtam', 'DMA-2026-E', '2027-08-31'::DATE, 55, 'bottles', 10, 150, 185.00, false FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01';

INSERT INTO hms_ward_stock_items (ward_store_id, product_name, product_category, batch_number, expiry_date, quantity_available, quantity_unit, min_stock_level, max_stock_level, cost_per_unit, is_critical)
SELECT id, 'Chandraprabha Vati 60 tabs', 'Vati', 'CPV-2026-F', '2027-11-30'::DATE, 90, 'bottles', 12, 200, 180.00, false FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01'
UNION ALL
SELECT id, 'Triphala Churna 100g', 'Churna', 'TPC-2026-G', '2028-06-30'::DATE, 300, 'packets', 25, 600, 120.00, false FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01'
UNION ALL
SELECT id, 'Mahanarayan Taila 200ml', 'Taila', 'MNT-2026-H', '2027-07-31'::DATE, 22, 'bottles', 5, 80, 320.00, false FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01'
UNION ALL
SELECT id, 'Punarnavadi Mandoor 60t', 'Vati', 'PNM-2026-I', '2026-09-30'::DATE, 28, 'bottles', 5, 60, 150.00, false FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01'
UNION ALL
SELECT id, 'Vijaya Extract Capsule 10mg', 'Capsule', 'VJC-2026-J', '2027-04-30'::DATE, 60, 'strips', 10, 120, 450.00, true FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01';

-- IP Pharmacy Store items
INSERT INTO hms_ward_stock_items (ward_store_id, product_name, product_category, batch_number, expiry_date, quantity_available, quantity_unit, min_stock_level, max_stock_level, cost_per_unit, is_critical)
SELECT id, 'Dhanwantharam Taila 500ml', 'Taila', 'DHT-2026-K', '2027-10-31'::DATE, 30, 'bottles', 5, 60, 420.00, false FROM hms_ward_stores WHERE store_code = 'WS-IP-01'
UNION ALL
SELECT id, 'Rasnasaptakam Kashayam 200ml', 'Kashayam', 'RSK-2026-L', '2027-05-15'::DATE, 12, 'bottles', 8, 50, 210.00, false FROM hms_ward_stores WHERE store_code = 'WS-IP-01'
UNION ALL
SELECT id, 'Disposable Gloves (Box)', 'Consumable', 'DGL-2026-M', NULL, 50, 'boxes', 10, 100, 250.00, false FROM hms_ward_stores WHERE store_code = 'WS-IP-01'
UNION ALL
SELECT id, 'Saline IV 500ml', 'IV Fluid', 'SAL-2026-N', '2027-12-31'::DATE, 100, 'units', 20, 200, 45.00, true FROM hms_ward_stores WHERE store_code = 'WS-IP-01'
UNION ALL
SELECT id, 'Simhanada Guggulu 60 tabs', 'Guggulu', 'SNG-2026-O', '2027-11-30'::DATE, 35, 'bottles', 10, 80, 150.00, false FROM hms_ward_stores WHERE store_code = 'WS-IP-01';

-- Panchakarma Store items
INSERT INTO hms_ward_stock_items (ward_store_id, product_name, product_category, batch_number, expiry_date, quantity_available, quantity_unit, min_stock_level, max_stock_level, cost_per_unit, is_critical)
SELECT id, 'Kottamchukkadi Taila 5L', 'Taila', 'KCT5-2026-P', '2027-08-31'::DATE, 8, 'cans', 2, 15, 2800.00, false FROM hms_ward_stores WHERE store_code = 'WS-PK-01'
UNION ALL
SELECT id, 'Dhanwantharam Taila 5L', 'Taila', 'DHT5-2026-Q', '2027-10-31'::DATE, 6, 'cans', 2, 12, 3200.00, false FROM hms_ward_stores WHERE store_code = 'WS-PK-01'
UNION ALL
SELECT id, 'Valiya Narayana Taila 5L', 'Taila', 'VNT5-2026-R', '2027-07-15'::DATE, 4, 'cans', 2, 10, 2500.00, false FROM hms_ward_stores WHERE store_code = 'WS-PK-01'
UNION ALL
SELECT id, 'Rasnadi Churna 500g', 'Churna', 'RNC-2026-S', '2028-01-31'::DATE, 15, 'packets', 5, 30, 350.00, false FROM hms_ward_stores WHERE store_code = 'WS-PK-01'
UNION ALL
SELECT id, 'Eladi Coconut Oil 1L', 'Taila', 'ECO-2026-T', '2027-12-31'::DATE, 20, 'bottles', 5, 40, 480.00, false FROM hms_ward_stores WHERE store_code = 'WS-PK-01';

-- Rajapalayam branch items
INSERT INTO hms_ward_stock_items (ward_store_id, product_name, product_category, batch_number, expiry_date, quantity_available, quantity_unit, min_stock_level, max_stock_level, cost_per_unit, is_critical)
SELECT id, 'Rasnasaptakam Kashayam 200ml', 'Kashayam', 'RSK-2026-U', '2027-06-30'::DATE, 5, 'bottles', 10, 80, 210.00, false FROM hms_ward_stores WHERE store_code = 'WS-RAJA-01'
UNION ALL
SELECT id, 'Ashwagandha Churna 100g', 'Churna', 'ASC-2026-V', '2028-03-31'::DATE, 40, 'packets', 10, 100, 160.00, false FROM hms_ward_stores WHERE store_code = 'WS-RAJA-01'
UNION ALL
SELECT id, 'Kottamchukkadi Taila 200ml', 'Taila', 'KCT-2026-W', '2027-09-30'::DATE, 3, 'bottles', 5, 40, 280.00, false FROM hms_ward_stores WHERE store_code = 'WS-RAJA-01';

-- ════════════════════════════════════════════════════════════
-- 3. CONSUMPTION LOG (25 records - sales, transfers, wastage)
-- ════════════════════════════════════════════════════════════

-- Patient sales (patient_use)
INSERT INTO hms_ward_consumption_log (ward_store_id, ward_stock_item_id, quantity_consumed, consumption_type, billed_to_patient, bill_amount, consumed_by, notes, created_at)
SELECT ws.id, si.id, 3, 'patient_use', true, 630.00, ctx.uid,
  'Sale bill (OP) - Patient: Rajesh Kumar. Product: Rasnasaptakam Kashayam 200ml, Batch: RSK-2026-A, Payment: Cash',
  NOW() - INTERVAL '2 hours'
FROM hms_ward_stores ws
JOIN hms_ward_stock_items si ON si.ward_store_id = ws.id AND si.product_name = 'Rasnasaptakam Kashayam 200ml'
CROSS JOIN _ctx ctx
WHERE ws.store_code = 'WS-MAIN-01'
LIMIT 1;

INSERT INTO hms_ward_consumption_log (ward_store_id, ward_stock_item_id, quantity_consumed, consumption_type, billed_to_patient, bill_amount, consumed_by, notes, created_at)
SELECT ws.id, si.id, 1, 'patient_use', true, 150.00, ctx.uid,
  'Sale bill (OP) - Patient: Meera Nair. Product: Simhanada Guggulu 60 tabs, Payment: UPI',
  NOW() - INTERVAL '3 hours'
FROM hms_ward_stores ws
JOIN hms_ward_stock_items si ON si.ward_store_id = ws.id AND si.product_name = 'Simhanada Guggulu 60 tabs'
CROSS JOIN _ctx ctx
WHERE ws.store_code = 'WS-MAIN-01'
LIMIT 1;

INSERT INTO hms_ward_consumption_log (ward_store_id, ward_stock_item_id, quantity_consumed, consumption_type, billed_to_patient, bill_amount, consumed_by, notes, created_at)
SELECT ws.id, si.id, 2, 'patient_use', true, 560.00, ctx.uid,
  'Sale bill (OP) - Patient: Suresh Menon. Product: Kottamchukkadi Taila 200ml, Payment: Card',
  NOW() - INTERVAL '5 hours'
FROM hms_ward_stores ws
JOIN hms_ward_stock_items si ON si.ward_store_id = ws.id AND si.product_name = 'Kottamchukkadi Taila 200ml'
CROSS JOIN _ctx ctx
WHERE ws.store_code = 'WS-MAIN-01'
LIMIT 1;

INSERT INTO hms_ward_consumption_log (ward_store_id, ward_stock_item_id, quantity_consumed, consumption_type, billed_to_patient, bill_amount, consumed_by, notes, created_at)
SELECT ws.id, si.id, 2, 'patient_use', true, 320.00, ctx.uid,
  'Sale bill (OP) - Patient: Anand Patel. Product: Ashwagandha Churna 100g, Payment: Cash',
  NOW() - INTERVAL '1 day'
FROM hms_ward_stores ws
JOIN hms_ward_stock_items si ON si.ward_store_id = ws.id AND si.product_name = 'Ashwagandha Churna 100g'
CROSS JOIN _ctx ctx
WHERE ws.store_code = 'WS-MAIN-01'
LIMIT 1;

INSERT INTO hms_ward_consumption_log (ward_store_id, ward_stock_item_id, quantity_consumed, consumption_type, billed_to_patient, bill_amount, consumed_by, notes, created_at)
SELECT ws.id, si.id, 1, 'patient_use', true, 185.00, ctx.uid,
  'Sale bill (OP) - Patient: Priya Sharma. Product: Dashamoolarishtam 450ml, Payment: UPI',
  NOW() - INTERVAL '1 day 3 hours'
FROM hms_ward_stores ws
JOIN hms_ward_stock_items si ON si.ward_store_id = ws.id AND si.product_name = 'Dashamoolarishtam 450ml'
CROSS JOIN _ctx ctx
WHERE ws.store_code = 'WS-MAIN-01'
LIMIT 1;

-- More patient sales (different days)
INSERT INTO hms_ward_consumption_log (ward_store_id, ward_stock_item_id, quantity_consumed, consumption_type, billed_to_patient, bill_amount, consumed_by, notes, created_at)
SELECT ws.id, si.id, 1, 'patient_use', true, 180.00, ctx.uid,
  'Sale bill (OP) - Patient: Lakshmi Nair. Product: Chandraprabha Vati, Payment: Cash',
  NOW() - INTERVAL '2 days'
FROM hms_ward_stores ws
JOIN hms_ward_stock_items si ON si.ward_store_id = ws.id AND si.product_name = 'Chandraprabha Vati 60 tabs'
CROSS JOIN _ctx ctx
WHERE ws.store_code = 'WS-MAIN-01'
LIMIT 1;

INSERT INTO hms_ward_consumption_log (ward_store_id, ward_stock_item_id, quantity_consumed, consumption_type, billed_to_patient, bill_amount, consumed_by, notes, created_at)
SELECT ws.id, si.id, 3, 'patient_use', true, 630.00, ctx.uid,
  'Sale bill (OP) - Patient: Rajesh Kumar. Product: Rasnasaptakam Kashayam 200ml, Payment: Cash',
  NOW() - INTERVAL '3 days'
FROM hms_ward_stores ws
JOIN hms_ward_stock_items si ON si.ward_store_id = ws.id AND si.product_name = 'Rasnasaptakam Kashayam 200ml'
CROSS JOIN _ctx ctx
WHERE ws.store_code = 'WS-MAIN-01'
LIMIT 1;

-- Therapy/PK consumption
INSERT INTO hms_ward_consumption_log (ward_store_id, ward_stock_item_id, quantity_consumed, consumption_type, billed_to_patient, bill_amount, consumed_by, notes, created_at)
SELECT ws.id, si.id, 1, 'therapy_use', true, 2800.00, ctx.uid,
  'Issue to Patient: Rajesh Kumar. PK Abhyanga session. Product: Kottamchukkadi Taila 5L',
  NOW() - INTERVAL '4 hours'
FROM hms_ward_stores ws
JOIN hms_ward_stock_items si ON si.ward_store_id = ws.id AND si.product_name = 'Kottamchukkadi Taila 5L'
CROSS JOIN _ctx ctx
WHERE ws.store_code = 'WS-PK-01'
LIMIT 1;

-- GRN receipts (transfer type)
INSERT INTO hms_ward_consumption_log (ward_store_id, ward_stock_item_id, quantity_consumed, consumption_type, billed_to_patient, bill_amount, consumed_by, notes, created_at)
SELECT ws.id, si.id, 50, 'transfer', false, 10500.00, ctx.uid,
  'GRN receipt from supplier: kottakkal. Batch: RSK-2026-A',
  NOW() - INTERVAL '5 days'
FROM hms_ward_stores ws
JOIN hms_ward_stock_items si ON si.ward_store_id = ws.id AND si.product_name = 'Rasnasaptakam Kashayam 200ml'
CROSS JOIN _ctx ctx
WHERE ws.store_code = 'WS-MAIN-01'
LIMIT 1;

INSERT INTO hms_ward_consumption_log (ward_store_id, ward_stock_item_id, quantity_consumed, consumption_type, billed_to_patient, bill_amount, consumed_by, notes, created_at)
SELECT ws.id, si.id, 100, 'transfer', false, 15000.00, ctx.uid,
  'GRN receipt from supplier: rajah. Batch: SNG-2026-B',
  NOW() - INTERVAL '7 days'
FROM hms_ward_stores ws
JOIN hms_ward_stock_items si ON si.ward_store_id = ws.id AND si.product_name = 'Simhanada Guggulu 60 tabs'
CROSS JOIN _ctx ctx
WHERE ws.store_code = 'WS-MAIN-01'
LIMIT 1;

-- Wastage
INSERT INTO hms_ward_consumption_log (ward_store_id, ward_stock_item_id, quantity_consumed, consumption_type, billed_to_patient, bill_amount, consumed_by, notes, created_at)
SELECT ws.id, si.id, 2, 'wastage', false, 420.00, ctx.uid,
  'Stock Adjustment: Broken bottles during shelf arrangement. Qty change: -2',
  NOW() - INTERVAL '2 days'
FROM hms_ward_stores ws
JOIN hms_ward_stock_items si ON si.ward_store_id = ws.id AND si.product_name = 'Rasnasaptakam Kashayam 200ml'
CROSS JOIN _ctx ctx
WHERE ws.store_code = 'WS-MAIN-01'
LIMIT 1;

-- Patient return
INSERT INTO hms_ward_consumption_log (ward_store_id, ward_stock_item_id, quantity_consumed, consumption_type, billed_to_patient, bill_amount, consumed_by, notes, created_at)
SELECT ws.id, si.id, 1, 'returned', false, 0, ctx.uid,
  'Patient Return. Patient: Meera Nair. Reason: Doctor changed prescription. Product: Ashwagandha Churna 100g',
  NOW() - INTERVAL '1 day'
FROM hms_ward_stores ws
JOIN hms_ward_stock_items si ON si.ward_store_id = ws.id AND si.product_name = 'Ashwagandha Churna 100g'
CROSS JOIN _ctx ctx
WHERE ws.store_code = 'WS-MAIN-01'
LIMIT 1;

-- ════════════════════════════════════════════════════════════
-- 4. STOCK TRANSFERS (15 records - POs, indents, GDN, returns)
-- ════════════════════════════════════════════════════════════

INSERT INTO hms_ward_stock_transfers (from_store_id, to_store_id, product_name, quantity, batch_number, transfer_reason, status, requested_by, created_at)
SELECT
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01'),
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-RAJA-01'),
  'Rasnasaptakam Kashayam 200ml', 20, 'RSK-2026-A',
  'PO from supplier: kottakkal', 'received', ctx.uid, NOW() - INTERVAL '10 days'
FROM _ctx ctx;

INSERT INTO hms_ward_stock_transfers (from_store_id, to_store_id, product_name, quantity, batch_number, transfer_reason, status, requested_by, created_at)
SELECT
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01'),
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-IP-01'),
  'Simhanada Guggulu 60 tabs', 30, 'SNG-2026-O',
  'Indent request', 'received', ctx.uid, NOW() - INTERVAL '8 days'
FROM _ctx ctx;

INSERT INTO hms_ward_stock_transfers (from_store_id, to_store_id, product_name, quantity, batch_number, transfer_reason, status, requested_by, created_at)
SELECT
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01'),
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-PK-01'),
  'Kottamchukkadi Taila 5L', 3, 'KCT5-2026-P',
  'GDN dispatch', 'in_transit', ctx.uid, NOW() - INTERVAL '1 day'
FROM _ctx ctx;

INSERT INTO hms_ward_stock_transfers (from_store_id, to_store_id, product_name, quantity, batch_number, transfer_reason, status, requested_by, created_at)
SELECT
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01'),
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-TVLI-01'),
  'Ashwagandha Churna 100g', 50, 'ASC-2026-D',
  'Inter-branch transfer', 'pending', ctx.uid, NOW() - INTERVAL '2 hours'
FROM _ctx ctx;

INSERT INTO hms_ward_stock_transfers (from_store_id, to_store_id, product_name, quantity, batch_number, transfer_reason, status, requested_by, created_at)
SELECT
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01'),
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-RAJA-01'),
  'Kottamchukkadi Taila 200ml', 10, 'KCT-2026-W',
  'AI Redistribution: ALSHIFA Main Pharmacy (45) → Rajapalayam Branch (3)', 'approved', ctx.uid, NOW() - INTERVAL '6 hours'
FROM _ctx ctx;

INSERT INTO hms_ward_stock_transfers (from_store_id, to_store_id, product_name, quantity, batch_number, transfer_reason, status, requested_by, created_at)
SELECT
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-RAJA-01'),
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01'),
  'Ashwagandha Churna 100g', 5, 'ASC-2026-V',
  'Return Indent. Excess stock at branch', 'pending', ctx.uid, NOW() - INTERVAL '3 hours'
FROM _ctx ctx;

INSERT INTO hms_ward_stock_transfers (from_store_id, to_store_id, product_name, quantity, batch_number, transfer_reason, status, requested_by, created_at)
SELECT
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01'),
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-IP-01'),
  'Saline IV 500ml', 50, 'SAL-2026-N',
  'PO from supplier: rajah', 'received', ctx.uid, NOW() - INTERVAL '12 days'
FROM _ctx ctx;

INSERT INTO hms_ward_stock_transfers (from_store_id, to_store_id, product_name, quantity, batch_number, transfer_reason, status, requested_by, created_at)
SELECT
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01'),
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-PK-01'),
  'Dhanwantharam Taila 5L', 2, 'DHT5-2026-Q',
  'Indent request', 'in_transit', ctx.uid, NOW() - INTERVAL '12 hours'
FROM _ctx ctx;

INSERT INTO hms_ward_stock_transfers (from_store_id, to_store_id, product_name, quantity, batch_number, transfer_reason, status, requested_by, created_at)
SELECT
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01'),
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-TVLI-01'),
  'Dashamoolarishtam 450ml', 15, 'DMA-2026-E',
  'Franchise order', 'pending', ctx.uid, NOW() - INTERVAL '1 hour'
FROM _ctx ctx;

INSERT INTO hms_ward_stock_transfers (from_store_id, to_store_id, product_name, quantity, batch_number, transfer_reason, status, requested_by, created_at)
SELECT
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01'),
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-RAJA-01'),
  'Triphala Churna 100g', 30, 'TPC-2026-G',
  'GDN dispatch', 'received', ctx.uid, NOW() - INTERVAL '4 days'
FROM _ctx ctx;

-- Additional transfers for supplier SLA tracking
INSERT INTO hms_ward_stock_transfers (from_store_id, to_store_id, product_name, quantity, batch_number, transfer_reason, status, requested_by, created_at)
SELECT
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01'),
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01'),
  'Chandraprabha Vati 60 tabs', 60, 'CPV-2026-F',
  'PO from supplier: avm', 'received', ctx.uid, NOW() - INTERVAL '15 days'
FROM _ctx ctx;

INSERT INTO hms_ward_stock_transfers (from_store_id, to_store_id, product_name, quantity, batch_number, transfer_reason, status, requested_by, created_at)
SELECT
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01'),
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01'),
  'Mahanarayan Taila 200ml', 20, 'MNT-2026-H',
  'PO from supplier: rich', 'received', ctx.uid, NOW() - INTERVAL '20 days'
FROM _ctx ctx;

INSERT INTO hms_ward_stock_transfers (from_store_id, to_store_id, product_name, quantity, batch_number, transfer_reason, status, requested_by, created_at)
SELECT
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01'),
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01'),
  'Vijaya Extract Capsule 10mg', 30, 'VJC-2026-J',
  'PO from supplier: skm', 'received', ctx.uid, NOW() - INTERVAL '25 days'
FROM _ctx ctx;

INSERT INTO hms_ward_stock_transfers (from_store_id, to_store_id, product_name, quantity, batch_number, transfer_reason, status, requested_by, created_at)
SELECT
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01'),
  (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01'),
  'Punarnavadi Mandoor 60t', 30, 'PNM-2026-I',
  'PO from supplier: arya', 'received', ctx.uid, NOW() - INTERVAL '30 days'
FROM _ctx ctx;

-- Update last_consumed_at for items that have been sold
UPDATE hms_ward_stock_items SET last_consumed_at = NOW() - INTERVAL '2 hours'
WHERE product_name = 'Rasnasaptakam Kashayam 200ml' AND ward_store_id = (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01');

UPDATE hms_ward_stock_items SET last_consumed_at = NOW() - INTERVAL '3 hours'
WHERE product_name = 'Simhanada Guggulu 60 tabs' AND ward_store_id = (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01');

UPDATE hms_ward_stock_items SET last_consumed_at = NOW() - INTERVAL '5 hours'
WHERE product_name = 'Kottamchukkadi Taila 200ml' AND ward_store_id = (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01');

UPDATE hms_ward_stock_items SET last_consumed_at = NOW() - INTERVAL '1 day'
WHERE product_name = 'Ashwagandha Churna 100g' AND ward_store_id = (SELECT id FROM hms_ward_stores WHERE store_code = 'WS-MAIN-01');

-- Punarnavadi not sold in 90+ days (dead stock candidate)
UPDATE hms_ward_stock_items SET last_consumed_at = NOW() - INTERVAL '120 days'
WHERE product_name = 'Punarnavadi Mandoor 60t';

-- Done
SELECT 'HMS Stock comprehensive seed data inserted successfully' AS result;
