
-- 1) Suppliers: drop broad authenticated read (leaked bank columns)
DROP POLICY IF EXISTS "Approved suppliers viewable by authenticated" ON public.suppliers;

-- 2) Product inventory: drop broad authenticated read (leaked cost_price)
DROP POLICY IF EXISTS "Active inventory viewable by authenticated" ON public.product_inventory;

-- 3) ATMRI sponsored cases: allow authenticated submitter to insert their own case
CREATE POLICY "submitter_insert_own"
ON public.atmri_sponsored_cases
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = submitted_by);
