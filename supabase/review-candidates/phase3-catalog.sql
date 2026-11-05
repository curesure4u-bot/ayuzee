-- Phase 3.1 LOCAL candidate. Not a hosted migration or payment implementation.
-- Based on inspected products/orders columns, constraints and policies, 4 Nov 2026.
BEGIN;
CREATE SCHEMA ayuzee_commerce;
REVOKE ALL ON SCHEMA ayuzee_commerce FROM PUBLIC;
GRANT USAGE ON SCHEMA ayuzee_commerce TO anon,authenticated,service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA ayuzee_commerce REVOKE ALL ON FUNCTIONS FROM PUBLIC;
ALTER TABLE public.products ADD COLUMN catalog_revision bigint NOT NULL DEFAULT 1;
CREATE FUNCTION ayuzee_commerce.bump_catalog_revision() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN NEW.catalog_revision:=OLD.catalog_revision+1;RETURN NEW;END $$;
REVOKE ALL ON FUNCTION ayuzee_commerce.bump_catalog_revision() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER commerce_catalog_revision BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION ayuzee_commerce.bump_catalog_revision();
CREATE TABLE ayuzee_commerce.commerce_product_audit (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_id uuid NOT NULL, actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
 decision text NOT NULL CHECK(decision IN ('submitted','approved','rejected','withdrawn')),
 reason text NOT NULL, product_revision text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE ayuzee_commerce.commerce_product_audit ENABLE ROW LEVEL SECURITY;
CREATE INDEX commerce_product_audit_latest ON ayuzee_commerce.commerce_product_audit(product_id,created_at DESC,id DESC);
REVOKE ALL ON ayuzee_commerce.commerce_product_audit FROM PUBLIC,anon,authenticated;
GRANT SELECT ON ayuzee_commerce.commerce_product_audit TO service_role;
CREATE FUNCTION ayuzee_commerce.commerce_reviewer() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT ayuzee_private.rbac_actor() AND EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=auth.uid() AND role::text IN ('admin','super_admin','product_admin'))
$$;
CREATE FUNCTION ayuzee_commerce.commerce_product_visible(p_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT EXISTS(SELECT 1 FROM public.products p WHERE p.id=p_id AND ((p.is_active IS TRUE AND p.approval_status='approved')
 OR ayuzee_commerce.commerce_reviewer() OR (ayuzee_private.rbac_actor() AND p.seller_id=auth.uid()
 AND EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=auth.uid() AND r.role::text='manufacturer'))))
$$;
CREATE FUNCTION ayuzee_commerce.commerce_order_reader(p_owner uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT ayuzee_private.rbac_actor() AND (p_owner=auth.uid() OR EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=auth.uid() AND role::text IN ('admin','super_admin','orders_admin')))
$$;
-- AND-fences restrict legacy permissive policies; no historical policy is dropped.
CREATE POLICY commerce_product_fence ON public.products AS RESTRICTIVE FOR ALL TO anon,authenticated
 USING(ayuzee_commerce.commerce_product_visible(id)) WITH CHECK(false);
CREATE POLICY commerce_order_fence ON public.orders AS RESTRICTIVE FOR ALL TO anon,authenticated
 USING(ayuzee_commerce.commerce_order_reader(user_id)) WITH CHECK(false);
-- Browser-owned prices, publication flags, paid/refund/fulfilment states are never authority.
REVOKE ALL ON public.products FROM PUBLIC,anon,authenticated;
GRANT SELECT(id,name,description,category,price,mrp,stock,image_url,ayush_system,is_prescription_required,is_active,approval_status,created_at) ON public.products TO anon,authenticated;
REVOKE INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER ON public.orders FROM PUBLIC,anon,authenticated;

CREATE VIEW public.products_public WITH(security_invoker=true) AS
 SELECT id,name,COALESCE(description,'') AS description,COALESCE(category,'Other') AS category,
 round(price*100)::integer AS price_paise,
 CASE WHEN mrp>=price AND mrp<=1000000 AND mrp=round(mrp,2) THEN round(mrp*100)::integer ELSE NULL END AS mrp_paise,
 COALESCE(stock,0)>0 AS available,CASE WHEN image_url ~ '^https://[^[:space:]]+$' THEN image_url ELSE NULL END AS image_url,
 COALESCE(ayush_system,'Other') AS system,is_prescription_required IS NOT FALSE AS prescription_required,created_at
 FROM public.products WHERE is_active IS TRUE AND approval_status='approved'
 AND price>0 AND price<=1000000 AND price=round(price,2) AND price::text !~ 'NaN|Infinity';
GRANT SELECT ON public.products_public TO anon,authenticated,service_role;
CREATE INDEX commerce_catalog_search_order ON public.products(approval_status,is_active,category,created_at DESC,id);

CREATE FUNCTION ayuzee_commerce.commerce_catalog(p_action text,p_payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
 u uuid:=auth.uid(); w text:=p_payload->>'workspace'; reviewer boolean; manufacturer boolean; v jsonb; result jsonb;
 item public.products; target uuid; page_no integer; query_text text; category_filter text; system_filter text; sort_key text; status_filter text;
 price_value integer; mrp_value integer; stock_value integer; v_name text; v_body text; v_category text; v_system text; expected_revision text; reason_text text; next_status text;
BEGIN
 IF p_action IN ('catalog','product') THEN
  page_no:=COALESCE((p_payload->>'page')::integer,1);query_text:=left(trim(COALESCE(p_payload->>'query','')),100);
  category_filter:=left(COALESCE(p_payload->>'category',''),80);system_filter:=left(COALESCE(p_payload->>'system',''),60);sort_key:=COALESCE(p_payload->>'sort','name');
  IF page_no NOT BETWEEN 1 AND 1000 OR sort_key NOT IN ('name','price_low','price_high','recent') THEN RAISE EXCEPTION 'Invalid catalog filters' USING ERRCODE='22023'; END IF;
  IF p_action='product' THEN
   SELECT jsonb_build_object('product',to_jsonb(p)) INTO result FROM public.products_public p WHERE p.id=(p_payload->>'id')::uuid;
   RETURN COALESCE(result,jsonb_build_object('product',NULL));
  END IF;
  WITH selected AS (
   SELECT * FROM public.products_public p WHERE (query_text='' OR position(lower(query_text) in lower(p.name||' '||p.description))>0)
    AND (category_filter='' OR p.category=category_filter) AND (system_filter='' OR p.system=system_filter)
    AND (NOT COALESCE((p_payload->>'inStock')::boolean,false) OR p.available)
   ORDER BY CASE WHEN sort_key='price_low' THEN p.price_paise END ASC,CASE WHEN sort_key='price_high' THEN p.price_paise END DESC,
    CASE WHEN sort_key='recent' THEN p.created_at END DESC,lower(p.name),p.id OFFSET (page_no-1)*12 LIMIT 13
  ), numbered AS (
   SELECT p.*,row_number() OVER(ORDER BY CASE WHEN sort_key='price_low' THEN p.price_paise END ASC,CASE WHEN sort_key='price_high' THEN p.price_paise END DESC,
    CASE WHEN sort_key='recent' THEN p.created_at END DESC,lower(p.name),p.id) rn FROM selected p
  ) SELECT jsonb_build_object('products',COALESCE(jsonb_agg(to_jsonb(p)-'rn' ORDER BY rn) FILTER(WHERE rn<=12),'[]'::jsonb),'hasMore',count(*)>12,
   'categories',COALESCE((SELECT jsonb_agg(category ORDER BY category) FROM (SELECT DISTINCT category FROM public.products_public ORDER BY category LIMIT 100) c),'[]'::jsonb),
   'systems',COALESCE((SELECT jsonb_agg(system ORDER BY system) FROM (SELECT DISTINCT system FROM public.products_public ORDER BY system LIMIT 100) c),'[]'::jsonb)) INTO result FROM numbered p;
  RETURN result;
 END IF;
 IF NOT ayuzee_private.rbac_actor() OR w IS NULL OR NOT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=u AND role::text=w) THEN RAISE EXCEPTION 'Catalog access denied' USING ERRCODE='42501'; END IF;
 reviewer:=w IN ('admin','super_admin','product_admin') AND ayuzee_commerce.commerce_reviewer();manufacturer:=w='manufacturer';
 IF NOT reviewer AND NOT manufacturer THEN RAISE EXCEPTION 'Catalog management denied' USING ERRCODE='42501'; END IF;
 v:=jsonb_build_object('id',u,'workspace',w,'reviewer',reviewer,'manufacturer',manufacturer);
 IF p_action='manage' THEN
  page_no:=COALESCE((p_payload->>'page')::integer,1);status_filter:=COALESCE(p_payload->>'status','pending');
  IF page_no NOT BETWEEN 1 AND 1000 OR status_filter NOT IN ('pending','approved','rejected') THEN RAISE EXCEPTION 'Invalid management filters' USING ERRCODE='22023'; END IF;
  WITH selected AS (
   SELECT * FROM public.products p WHERE (reviewer OR p.seller_id=u) AND p.approval_status=status_filter ORDER BY p.created_at DESC NULLS LAST,p.id OFFSET(page_no-1)*12 LIMIT 13
  ), numbered AS (SELECT p.*,row_number() OVER(ORDER BY p.created_at DESC NULLS LAST,p.id) rn FROM selected p)
  SELECT jsonb_build_object('viewer',v,'products',COALESCE(jsonb_agg(jsonb_build_object('id',p.id,'name',p.name,'description',COALESCE(p.description,''),
   'category',COALESCE(p.category,'Other'),'system',COALESCE(p.ayush_system,'Other'),'price_paise',round(p.price*100)::integer,'mrp_paise',round(p.mrp*100)::integer,
   'review_reason',(SELECT a.reason FROM ayuzee_commerce.commerce_product_audit a WHERE a.product_id=p.id AND a.decision<>'submitted' ORDER BY a.created_at DESC,a.id DESC LIMIT 1),'stock',p.stock,'prescription_required',p.is_prescription_required,'status',p.approval_status,'active',p.is_active,'mine',p.seller_id=u,'revision',md5((to_jsonb(p)-'rn')::text)) ORDER BY rn) FILTER(WHERE rn<=12),'[]'::jsonb),'hasMore',count(*)>12) INTO result FROM numbered p;
  RETURN result;
 END IF;
 IF p_action='submit' THEN
  IF NOT manufacturer THEN RAISE EXCEPTION 'Only manufacturers submit products' USING ERRCODE='42501'; END IF;
  v_name:=trim(p_payload->>'name');v_body:=trim(p_payload->>'description');v_category:=trim(p_payload->>'category');v_system:=trim(p_payload->>'system');
  price_value:=(p_payload->>'price_paise')::integer;mrp_value:=(p_payload->>'mrp_paise')::integer;stock_value:=(p_payload->>'stock')::integer;
  IF v_name IS NULL OR length(v_name) NOT BETWEEN 3 AND 160 OR v_body IS NULL OR length(v_body) NOT BETWEEN 10 AND 4000
   OR v_category IS NULL OR length(v_category) NOT BETWEEN 1 AND 80 OR v_system IS NULL OR length(v_system) NOT BETWEEN 1 AND 60
   OR price_value IS NULL OR price_value NOT BETWEEN 1 AND 100000000 OR (mrp_value IS NOT NULL AND (mrp_value<price_value OR mrp_value>100000000))
   OR stock_value IS NULL OR stock_value NOT BETWEEN 0 AND 10000000 OR jsonb_typeof(p_payload->'prescription_required') IS DISTINCT FROM 'boolean' THEN RAISE EXCEPTION 'Invalid product' USING ERRCODE='22023'; END IF;
  target:=(p_payload->>'id')::uuid;
  IF target IS NULL THEN
   INSERT INTO public.products(name,description,category,ayush_system,price,mrp,stock,seller_id,is_active,approval_status,is_prescription_required)
   VALUES(v_name,v_body,v_category,v_system,price_value/100.0,mrp_value/100.0,stock_value,u,false,'pending',(p_payload->>'prescription_required')::boolean) RETURNING id INTO target;
  ELSE
   SELECT * INTO item FROM public.products WHERE id=target FOR UPDATE;
   IF NOT FOUND OR item.seller_id IS DISTINCT FROM u THEN RAISE EXCEPTION 'Not your product' USING ERRCODE='42501'; END IF;
   IF md5(to_jsonb(item)::text) IS DISTINCT FROM p_payload->>'revision' THEN RAISE EXCEPTION 'Product changed; reload before editing' USING ERRCODE='40001'; END IF;
   UPDATE public.products SET name=v_name,description=v_body,category=v_category,ayush_system=v_system,price=price_value/100.0,mrp=mrp_value/100.0,stock=stock_value,
    is_active=false,approval_status='pending',is_prescription_required=(p_payload->>'prescription_required')::boolean WHERE id=target;
  END IF;
  INSERT INTO ayuzee_commerce.commerce_product_audit(product_id,actor_id,decision,reason,product_revision)
   SELECT p.id,u,'submitted','Manufacturer submitted product for review',md5(to_jsonb(p)::text) FROM public.products p WHERE p.id=target;
  RETURN jsonb_build_object('id',target);
 END IF;
 IF p_action='review' THEN
  IF NOT reviewer THEN RAISE EXCEPTION 'Review denied' USING ERRCODE='42501'; END IF;
  target:=(p_payload->>'id')::uuid;reason_text:=trim(p_payload->>'reason');next_status:=p_payload->>'decision';
  IF reason_text IS NULL OR length(reason_text) NOT BETWEEN 10 AND 1000 OR next_status IS NULL OR next_status NOT IN ('approved','rejected','withdrawn') THEN RAISE EXCEPTION 'Invalid review decision' USING ERRCODE='22023'; END IF;
  SELECT * INTO item FROM public.products WHERE id=target FOR UPDATE;
  IF NOT FOUND OR item.seller_id=u THEN RAISE EXCEPTION 'Product unavailable or self-review denied' USING ERRCODE='42501'; END IF;
  IF md5(to_jsonb(item)::text) IS DISTINCT FROM p_payload->>'revision' THEN RAISE EXCEPTION 'Product changed; reload before reviewing' USING ERRCODE='40001'; END IF;
  IF (next_status IN ('approved','rejected') AND item.approval_status IS DISTINCT FROM 'pending') OR (next_status='withdrawn' AND item.approval_status IS DISTINCT FROM 'approved') THEN RAISE EXCEPTION 'Invalid review transition' USING ERRCODE='22023'; END IF;
  IF next_status='approved' AND (item.price<=0 OR item.price>1000000 OR item.price<>round(item.price,2) OR item.price::text ~ 'NaN|Infinity'
   OR item.stock IS NULL OR item.stock<0 OR item.is_prescription_required IS NULL OR length(trim(item.name))<3 OR length(trim(COALESCE(item.description,'')))<10) THEN RAISE EXCEPTION 'Product information incomplete' USING ERRCODE='22023'; END IF;
  UPDATE public.products SET approval_status=CASE WHEN next_status='withdrawn' THEN 'pending' ELSE next_status END,is_active=next_status='approved' WHERE id=target;
  INSERT INTO ayuzee_commerce.commerce_product_audit(product_id,actor_id,decision,reason,product_revision) VALUES(target,u,next_status,reason_text,md5(to_jsonb(item)::text));
  RETURN jsonb_build_object('id',target);
 END IF;
 RAISE EXCEPTION 'Unknown commerce action' USING ERRCODE='22023';
END $$;
CREATE FUNCTION public.commerce_catalog(p_action text,p_payload jsonb DEFAULT '{}'::jsonb) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT ayuzee_commerce.commerce_catalog(p_action,p_payload) $$;
REVOKE ALL ON FUNCTION ayuzee_commerce.commerce_reviewer(),ayuzee_commerce.commerce_product_visible(uuid),ayuzee_commerce.commerce_order_reader(uuid),ayuzee_commerce.commerce_catalog(text,jsonb),public.commerce_catalog(text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION ayuzee_commerce.commerce_reviewer(),ayuzee_commerce.commerce_product_visible(uuid),ayuzee_commerce.commerce_order_reader(uuid),ayuzee_commerce.commerce_catalog(text,jsonb),public.commerce_catalog(text,jsonb) TO anon,authenticated,service_role;
COMMIT;
