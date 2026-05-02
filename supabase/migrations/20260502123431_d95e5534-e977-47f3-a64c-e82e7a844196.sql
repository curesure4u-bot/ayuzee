
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS courier_partner TEXT,
  ADD COLUMN IF NOT EXISTS shipment_id TEXT,
  ADD COLUMN IF NOT EXISTS assigned_supplier_id UUID REFERENCES public.suppliers(id),
  ADD COLUMN IF NOT EXISTS dispatched_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS total_commission NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS doctor_commission NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS commission_distributed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS commission_distributed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS referring_doctor_id UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON public.orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_supplier ON public.orders(assigned_supplier_id);
CREATE INDEX IF NOT EXISTS idx_orders_referring_doctor ON public.orders(referring_doctor_id);
CREATE INDEX IF NOT EXISTS idx_orders_commission_distributed ON public.orders(commission_distributed) WHERE commission_distributed = false;

-- ============================================================================
-- ORDER TRACKING EVENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.order_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  status_code TEXT,
  status_description TEXT,
  location TEXT,
  event_time TIMESTAMPTZ NOT NULL,
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_tracking_events_order ON public.order_tracking_events(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_events_event_time ON public.order_tracking_events(event_time DESC);

ALTER TABLE public.order_tracking_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage tracking events" ON public.order_tracking_events;
CREATE POLICY "Admins manage tracking events" ON public.order_tracking_events
  FOR ALL TO authenticated
  USING (
    public.is_admin_or_super(auth.uid())
    OR public.has_role(auth.uid(), 'orders_admin'::public.app_role)
  )
  WITH CHECK (
    public.is_admin_or_super(auth.uid())
    OR public.has_role(auth.uid(), 'orders_admin'::public.app_role)
  );

DROP POLICY IF EXISTS "Users view tracking for own orders" ON public.order_tracking_events;
CREATE POLICY "Users view tracking for own orders" ON public.order_tracking_events
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_tracking_events.order_id AND o.user_id = auth.uid()));

COMMENT ON TABLE public.order_tracking_events IS 'Shipment tracking timeline from courier partners';
