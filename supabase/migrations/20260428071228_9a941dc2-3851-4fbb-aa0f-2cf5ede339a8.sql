-- Extend vaidya_bills with GST + invoice fields
ALTER TABLE public.vaidya_bills
  ADD COLUMN IF NOT EXISTS bill_no TEXT,
  ADD COLUMN IF NOT EXISTS bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS gstin TEXT,
  ADD COLUMN IF NOT EXISTS patient_gstin TEXT,
  ADD COLUMN IF NOT EXISTS clinic_name TEXT,
  ADD COLUMN IF NOT EXISTS clinic_address TEXT,
  ADD COLUMN IF NOT EXISTS gst_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gst_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cgst_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sgst_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS igst_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_interstate BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_sent_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS uq_vaidya_bill_no_per_doctor
  ON public.vaidya_bills(doctor_user_id, bill_no) WHERE bill_no IS NOT NULL;

ALTER TABLE public.vaidya_bill_items
  ADD COLUMN IF NOT EXISTS item_type TEXT NOT NULL DEFAULT 'medicine',
  ADD COLUMN IF NOT EXISTS hsn_code TEXT,
  ADD COLUMN IF NOT EXISTS gst_rate NUMERIC(5,2);

-- Auto bill number: INV-YYYY-NNNNNN per doctor per year
CREATE OR REPLACE FUNCTION public.assign_vaidya_bill_no()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  yr TEXT := to_char(COALESCE(NEW.bill_date, CURRENT_DATE), 'YYYY');
  next_seq INT;
  prefix TEXT;
BEGIN
  IF NEW.bill_no IS NOT NULL AND NEW.bill_no <> '' THEN
    RETURN NEW;
  END IF;
  prefix := CASE WHEN NEW.bill_type = 'direct_selling' THEN 'DS' ELSE 'INV' END;
  SELECT COALESCE(MAX(
    NULLIF(regexp_replace(bill_no, '^[A-Z]+-\d{4}-', ''), '')::INT
  ), 0) + 1
  INTO next_seq
  FROM public.vaidya_bills
  WHERE doctor_user_id = NEW.doctor_user_id
    AND bill_no LIKE prefix || '-' || yr || '-%';
  NEW.bill_no := prefix || '-' || yr || '-' || lpad(next_seq::TEXT, 6, '0');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_vaidya_bills_assign_no ON public.vaidya_bills;
CREATE TRIGGER trg_vaidya_bills_assign_no
  BEFORE INSERT ON public.vaidya_bills
  FOR EACH ROW EXECUTE FUNCTION public.assign_vaidya_bill_no();

-- Backfill existing rows without bill_no
DO $$
DECLARE r RECORD; yr TEXT; nxt INT; pref TEXT;
BEGIN
  FOR r IN SELECT id, doctor_user_id, bill_type, bill_date, created_at FROM public.vaidya_bills WHERE bill_no IS NULL ORDER BY created_at LOOP
    yr := to_char(COALESCE(r.bill_date, r.created_at::date, CURRENT_DATE), 'YYYY');
    pref := CASE WHEN r.bill_type = 'direct_selling' THEN 'DS' ELSE 'INV' END;
    SELECT COALESCE(MAX(NULLIF(regexp_replace(bill_no, '^[A-Z]+-\d{4}-', ''), '')::INT), 0) + 1
      INTO nxt
      FROM public.vaidya_bills
      WHERE doctor_user_id = r.doctor_user_id AND bill_no LIKE pref || '-' || yr || '-%';
    UPDATE public.vaidya_bills SET bill_no = pref || '-' || yr || '-' || lpad(nxt::TEXT, 6, '0') WHERE id = r.id;
  END LOOP;
END $$;