-- admin_team_log table
CREATE TABLE IF NOT EXISTS public.admin_team_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  granted_by uuid REFERENCES auth.users(id),
  granted_to uuid REFERENCES auth.users(id),
  role text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admin_team_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_log" ON public.admin_team_log;
CREATE POLICY "admin_read_log" ON public.admin_team_log
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "admin_insert_log" ON public.admin_team_log;
CREATE POLICY "admin_insert_log" ON public.admin_team_log
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Products: allow multiple admin roles
DROP POLICY IF EXISTS "admin_roles_products" ON public.products;
DROP POLICY IF EXISTS "product_admin_manage_products" ON public.products;
CREATE POLICY "admin_roles_products" ON public.products FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'product_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'content_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'orders_admin'::public.app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'product_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'content_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'orders_admin'::public.app_role)
  );

-- Orders: owners + admin/orders_admin
DROP POLICY IF EXISTS "orders_admin_policy" ON public.orders;
CREATE POLICY "orders_admin_policy" ON public.orders FOR ALL
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'orders_admin'::public.app_role)
  )
  WITH CHECK (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'orders_admin'::public.app_role)
  );