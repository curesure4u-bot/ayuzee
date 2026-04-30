DROP POLICY IF EXISTS "product_admin_manage_products" ON public.products;

CREATE POLICY "product_admin_manage_products" ON public.products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin'::public.app_role, 'product_admin'::public.app_role)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin'::public.app_role, 'product_admin'::public.app_role)
    )
  );
