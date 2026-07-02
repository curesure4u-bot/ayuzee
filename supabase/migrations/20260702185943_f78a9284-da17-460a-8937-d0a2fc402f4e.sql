
DROP POLICY IF EXISTS "Doctor views orders of own patients" ON public.orders;
CREATE POLICY "Doctor views own referred orders"
  ON public.orders FOR SELECT
  USING (
    referring_doctor_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.id = orders.referring_doctor_id
        AND d.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Doctor views items of own patients orders" ON public.order_items;
CREATE POLICY "Doctor views items of own referred orders"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.doctors d ON d.id = o.referring_doctor_id
      WHERE o.id = order_items.order_id
        AND d.user_id = auth.uid()
    )
  );
