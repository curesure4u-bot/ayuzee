-- Phase 3.2–3.3 LOCAL candidate. Requires phase3-catalog.sql; not applied live.
-- No payment/courier/provider calls. Checkout starts disabled with no price rules.
BEGIN;
CREATE TABLE ayuzee_commerce.checkout_policy(
 singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton), enabled boolean NOT NULL DEFAULT false,
 currency text NOT NULL DEFAULT 'INR' CHECK(currency='INR'), tax_mode text CHECK(tax_mode='included'),
 shipping_paise bigint CHECK(shipping_paise BETWEEN 0 AND 1000000000),free_shipping_min_paise bigint CHECK(free_shipping_min_paise BETWEEN 1 AND 1000000000),
 delivery_prefixes text[] NOT NULL DEFAULT '{}',revision bigint NOT NULL DEFAULT 1
);
INSERT INTO ayuzee_commerce.checkout_policy DEFAULT VALUES;
CREATE TABLE ayuzee_commerce.checkout_coupons(
 code text PRIMARY KEY CHECK(code ~ '^[A-Z0-9_-]{3,32}$'),enabled boolean NOT NULL DEFAULT false,
 kind text NOT NULL CHECK(kind IN ('percent','fixed','free_shipping')),
 value_paise bigint CHECK(value_paise BETWEEN 1 AND 1000000000),rate_bps integer CHECK(rate_bps BETWEEN 1 AND 10000),
 min_subtotal_paise bigint NOT NULL DEFAULT 0 CHECK(min_subtotal_paise BETWEEN 0 AND 1000000000),
 max_discount_paise bigint CHECK(max_discount_paise BETWEEN 1 AND 1000000000),starts_at timestamptz,expires_at timestamptz,
 bound_user uuid REFERENCES auth.users(id) ON DELETE CASCADE,global_limit integer CHECK(global_limit>0),per_user_limit integer NOT NULL DEFAULT 1 CHECK(per_user_limit>0),revision bigint NOT NULL DEFAULT 1,
 CHECK((kind='fixed' AND value_paise IS NOT NULL) OR (kind='percent' AND rate_bps IS NOT NULL) OR kind='free_shipping')
);
CREATE FUNCTION ayuzee_commerce.bump_checkout_revision() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN NEW.revision:=OLD.revision+1;RETURN NEW;END $$;
CREATE TRIGGER checkout_policy_revision BEFORE UPDATE ON ayuzee_commerce.checkout_policy FOR EACH ROW EXECUTE FUNCTION ayuzee_commerce.bump_checkout_revision();
CREATE TRIGGER checkout_coupon_revision BEFORE UPDATE ON ayuzee_commerce.checkout_coupons FOR EACH ROW EXECUTE FUNCTION ayuzee_commerce.bump_checkout_revision();
CREATE TABLE ayuzee_commerce.checkout_quotes(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 items jsonb NOT NULL,pricing jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT clock_timestamp(),expires_at timestamptz NOT NULL
);
CREATE TABLE ayuzee_commerce.stock_holds(
 order_id uuid PRIMARY KEY REFERENCES public.orders(id) ON DELETE CASCADE,quote_id uuid NOT NULL UNIQUE REFERENCES ayuzee_commerce.checkout_quotes(id),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,request_key uuid NOT NULL,
 coupon_code text REFERENCES ayuzee_commerce.checkout_coupons(code),state text NOT NULL DEFAULT 'held' CHECK(state IN ('held','released','expired','committed')),
 expires_at timestamptz NOT NULL,created_at timestamptz NOT NULL DEFAULT clock_timestamp(),UNIQUE(user_id,request_key)
);
CREATE TABLE ayuzee_commerce.stock_hold_lines(
 order_id uuid NOT NULL REFERENCES ayuzee_commerce.stock_holds(order_id) ON DELETE CASCADE,
 product_id uuid NOT NULL REFERENCES public.products(id),quantity integer NOT NULL CHECK(quantity BETWEEN 1 AND 99),PRIMARY KEY(order_id,product_id)
);
CREATE TABLE ayuzee_commerce.checkout_events(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),order_id uuid NOT NULL,actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
 kind text NOT NULL CHECK(kind IN ('reserved','released','expired')),created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX checkout_holds_active ON ayuzee_commerce.stock_holds(expires_at,order_id) WHERE state='held';
CREATE INDEX checkout_holds_coupon ON ayuzee_commerce.stock_holds(coupon_code,user_id,state,expires_at);
CREATE INDEX checkout_hold_product ON ayuzee_commerce.stock_hold_lines(product_id,order_id);
DO $$ DECLARE t text;BEGIN
 FOREACH t IN ARRAY ARRAY['checkout_policy','checkout_coupons','checkout_quotes','stock_holds','stock_hold_lines','checkout_events'] LOOP
  EXECUTE format('ALTER TABLE ayuzee_commerce.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('REVOKE ALL ON ayuzee_commerce.%I FROM PUBLIC,anon,authenticated',t);
 END LOOP;
END $$;
CREATE FUNCTION ayuzee_commerce.checkout_cart(p_items jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE item jsonb;result jsonb;
BEGIN
 IF p_items IS NULL OR jsonb_typeof(p_items)<>'array' OR jsonb_array_length(p_items) NOT BETWEEN 1 AND 20 THEN RAISE EXCEPTION 'Invalid cart' USING ERRCODE='22023';END IF;
 FOR item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
  IF jsonb_typeof(item)<>'object' OR item-ARRAY['product_id','quantity']<>'{}'::jsonb OR item->>'product_id' IS NULL
   OR jsonb_typeof(item->'quantity') IS DISTINCT FROM 'number' OR (item->>'quantity') !~ '^[1-9][0-9]?$' THEN RAISE EXCEPTION 'Invalid cart line' USING ERRCODE='22023';END IF;
  PERFORM (item->>'product_id')::uuid;
 END LOOP;
 IF (SELECT count(DISTINCT (x->>'product_id')::uuid) FROM jsonb_array_elements(p_items)x)<>jsonb_array_length(p_items) THEN RAISE EXCEPTION 'Duplicate cart lines' USING ERRCODE='22023';END IF;
 SELECT jsonb_agg(jsonb_build_object('product_id',(x->>'product_id')::uuid,'quantity',(x->>'quantity')::integer) ORDER BY (x->>'product_id')::uuid) INTO result FROM jsonb_array_elements(p_items)x;
 RETURN result;
END $$;
CREATE FUNCTION ayuzee_commerce.checkout_available(p_id uuid) RETURNS integer LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path='' AS $$
 SELECT GREATEST(0,COALESCE(p.stock,0)-COALESCE((SELECT sum(l.quantity) FROM ayuzee_commerce.stock_hold_lines l JOIN ayuzee_commerce.stock_holds h USING(order_id)
 WHERE l.product_id=p.id AND h.state='held' AND h.expires_at>clock_timestamp()),0))::integer FROM public.products p WHERE p.id=p_id
$$;
-- Called by the checked API only, as its owner. Never grant a browser this helper.
CREATE FUNCTION ayuzee_commerce.checkout_pricing(p_user uuid,p_items jsonb,p_postal text,p_code text) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY INVOKER SET search_path='' AS $$
DECLARE rules ayuzee_commerce.checkout_policy;coupon ayuzee_commerce.checkout_coupons;item jsonb;product public.products;
 lines jsonb:='[]';unit_price bigint;line_total bigint;subtotal bigint:=0;discount bigint:=0;shipping bigint;total bigint;v_code text:=upper(trim(COALESCE(p_code,'')));v_ids uuid[];q integer;
BEGIN
 SELECT * INTO rules FROM ayuzee_commerce.checkout_policy WHERE singleton FOR SHARE;
 IF NOT FOUND OR NOT rules.enabled OR rules.tax_mode IS NULL OR rules.shipping_paise IS NULL OR cardinality(rules.delivery_prefixes)=0 THEN RAISE EXCEPTION 'Checkout rules are not configured' USING ERRCODE='P5100';END IF;
 IF p_postal IS NULL OR p_postal !~ '^[1-9][0-9]{5}$' THEN RAISE EXCEPTION 'Invalid postal code' USING ERRCODE='22023';END IF;
 IF NOT EXISTS(SELECT 1 FROM unnest(rules.delivery_prefixes)prefix WHERE prefix ~ '^[1-9][0-9]{0,5}$' AND left(p_postal,length(prefix))=prefix) THEN RAISE EXCEPTION 'Delivery area unavailable' USING ERRCODE='P5110';END IF;
 IF v_code<>'' THEN
  SELECT * INTO coupon FROM ayuzee_commerce.checkout_coupons WHERE checkout_coupons.code=v_code FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Coupon unavailable' USING ERRCODE='P5107';END IF;
 END IF;
 SELECT array_agg((x->>'product_id')::uuid ORDER BY (x->>'product_id')::uuid) INTO v_ids FROM jsonb_array_elements(p_items)x;
 -- Lock first, then inspect holds in a separate volatile statement/snapshot. A
 -- concurrent request must see a reservation committed while it waited here.
 PERFORM p.id FROM public.products p WHERE p.id=ANY(v_ids) ORDER BY p.id FOR UPDATE;
 -- Coupon validity must be checked after product lock waits as well.
 IF v_code<>'' THEN
  IF NOT coupon.enabled OR (coupon.starts_at IS NOT NULL AND coupon.starts_at>clock_timestamp()) OR (coupon.expires_at IS NOT NULL AND coupon.expires_at<=clock_timestamp()) OR (coupon.bound_user IS NOT NULL AND coupon.bound_user<>p_user) THEN RAISE EXCEPTION 'Coupon unavailable' USING ERRCODE='P5107';END IF;
  IF (SELECT count(*) FROM ayuzee_commerce.stock_holds h WHERE h.coupon_code=v_code AND (h.state='committed' OR (h.state='held' AND h.expires_at>clock_timestamp())))>=COALESCE(coupon.global_limit,2147483647)
   OR (SELECT count(*) FROM ayuzee_commerce.stock_holds h WHERE h.coupon_code=v_code AND h.user_id=p_user AND (h.state='committed' OR (h.state='held' AND h.expires_at>clock_timestamp())))>=coupon.per_user_limit THEN RAISE EXCEPTION 'Coupon allocation exhausted' USING ERRCODE='P5108';END IF;
 END IF;
 FOR item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
  SELECT * INTO product FROM public.products WHERE id=(item->>'product_id')::uuid;q:=(item->>'quantity')::integer;
  IF NOT FOUND OR product.is_active IS NOT TRUE OR product.approval_status IS DISTINCT FROM 'approved' OR product.price<=0 OR product.price>1000000 OR product.price<>round(product.price,2) OR product.price::text ~ 'NaN|Infinity' THEN RAISE EXCEPTION 'Product unavailable' USING ERRCODE='P5101';END IF;
  IF product.is_prescription_required IS NOT FALSE THEN RAISE EXCEPTION 'Prescription review is required' USING ERRCODE='P5103';END IF;
  IF ayuzee_commerce.checkout_available(product.id)<q THEN RAISE EXCEPTION 'Insufficient stock' USING ERRCODE='P5102';END IF;
  unit_price:=round(product.price*100)::bigint;line_total:=unit_price*q;subtotal:=subtotal+line_total;
  IF subtotal>1000000000 THEN RAISE EXCEPTION 'Cart exceeds supported amount' USING ERRCODE='22023';END IF;
  lines:=lines||jsonb_build_array(jsonb_build_object('product_id',product.id,'name',product.name,'quantity',q,'unit_paise',unit_price,'line_paise',line_total,'catalog_revision',product.catalog_revision));
 END LOOP;
 IF v_code<>'' THEN
  IF subtotal<coupon.min_subtotal_paise THEN RAISE EXCEPTION 'Coupon minimum not met' USING ERRCODE='P5107';END IF;
  IF coupon.kind='fixed' THEN discount:=LEAST(subtotal,coupon.value_paise);
  ELSIF coupon.kind='percent' THEN discount:=LEAST(subtotal,(subtotal*coupon.rate_bps+5000)/10000,COALESCE(coupon.max_discount_paise,subtotal));END IF;
 END IF;
 shipping:=CASE WHEN (rules.free_shipping_min_paise IS NOT NULL AND subtotal-discount>=rules.free_shipping_min_paise) OR (v_code<>'' AND coupon.kind='free_shipping') THEN 0 ELSE rules.shipping_paise END;
 total:=subtotal-discount+shipping;
 IF total NOT BETWEEN 1 AND 1000000000 THEN RAISE EXCEPTION 'Unsupported order total' USING ERRCODE='22023';END IF;
 RETURN jsonb_build_object('currency',rules.currency,'tax_mode',rules.tax_mode,'policy_revision',rules.revision,'coupon_revision',coupon.revision,'coupon_code',NULLIF(v_code,''),'postal_code',p_postal,
 'lines',lines,'subtotal_paise',subtotal,'discount_paise',discount,'shipping_paise',shipping,'total_paise',total);
END $$;
CREATE FUNCTION ayuzee_commerce.checkout_public_pricing(p_pricing jsonb) RETURNS jsonb LANGUAGE sql IMMUTABLE SECURITY INVOKER SET search_path='' AS $$
 SELECT (p_pricing-ARRAY['policy_revision','coupon_revision'])||jsonb_build_object('lines',(SELECT jsonb_agg(x-'catalog_revision') FROM jsonb_array_elements(p_pricing->'lines')x))
$$;
CREATE FUNCTION ayuzee_commerce.checkout_address(p_address jsonb) RETURNS jsonb LANGUAGE plpgsql IMMUTABLE SECURITY INVOKER SET search_path='' AS $$
DECLARE result jsonb;BEGIN
 IF p_address IS NULL OR jsonb_typeof(p_address)<>'object' OR p_address-ARRAY['full_name','phone','address_line1','address_line2','city','state','pincode']<>'{}'::jsonb THEN RAISE EXCEPTION 'Invalid delivery address' USING ERRCODE='22023';END IF;
 SELECT jsonb_object_agg(k,trim(COALESCE(p_address->>k,''))) INTO result FROM unnest(ARRAY['full_name','phone','address_line1','address_line2','city','state','pincode'])k;
 IF length(result->>'full_name') NOT BETWEEN 2 AND 100 OR result->>'phone' !~ '^\+?[0-9]{10,15}$' OR length(result->>'address_line1') NOT BETWEEN 4 AND 200 OR length(result->>'address_line2')>200
 OR length(result->>'city') NOT BETWEEN 2 AND 80 OR length(result->>'state') NOT BETWEEN 2 AND 80 OR result->>'pincode' !~ '^[1-9][0-9]{5}$' THEN RAISE EXCEPTION 'Invalid delivery address' USING ERRCODE='22023';END IF;
 RETURN result;
END $$;
CREATE FUNCTION ayuzee_commerce.checkout_receipt(p_order uuid,p_user uuid) RETURNS jsonb LANGUAGE sql VOLATILE SECURITY INVOKER SET search_path='' AS $$
 SELECT jsonb_build_object('order_id',o.id,'quote_id',h.quote_id,'request_key',h.request_key,'payment_status',o.payment_status,'order_status',o.order_status,
 'reservation_state',CASE WHEN h.state='held' AND h.expires_at<=clock_timestamp() THEN 'expired' ELSE h.state END,'expires_at',h.expires_at,
 'pricing',ayuzee_commerce.checkout_public_pricing(q.pricing)) FROM public.orders o JOIN ayuzee_commerce.stock_holds h ON h.order_id=o.id JOIN ayuzee_commerce.checkout_quotes q ON q.id=h.quote_id WHERE o.id=p_order AND o.user_id=p_user
$$;
CREATE FUNCTION ayuzee_commerce.checkout_live_session() RETURNS boolean LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path='' AS $$
 SELECT ayuzee_private.rbac_actor() AND EXISTS(SELECT 1 FROM auth.users u WHERE u.id=auth.uid() AND u.email_confirmed_at IS NOT NULL) AND EXISTS(SELECT 1 FROM auth.sessions s
 WHERE s.id=NULLIF(NULLIF(current_setting('request.jwt.claims',true),'')::jsonb->>'session_id','')::uuid
 AND s.user_id=auth.uid() AND (s.not_after IS NULL OR s.not_after>clock_timestamp()))
$$;
REVOKE ALL ON FUNCTION ayuzee_commerce.checkout_live_session() FROM PUBLIC,anon,authenticated;
CREATE FUNCTION ayuzee_commerce.checkout_api(p_action text,p_payload jsonb) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path='' SET lock_timeout='5s' AS $$
DECLARE u uuid:=auth.uid();w text:=p_payload->>'workspace';cart jsonb;pricing jsonb;address jsonb;quote ayuzee_commerce.checkout_quotes;ord public.orders;hold ayuzee_commerce.stock_holds;
 target uuid;key uuid;v_code text;line jsonb;result jsonb;inspection jsonb:='[]';product jsonb;issue text;
BEGIN
 IF NOT ayuzee_commerce.checkout_live_session() OR w IS NULL OR NOT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=u AND role::text=w) THEN RAISE EXCEPTION 'Checkout access denied' USING ERRCODE='42501';END IF;
 IF p_payload IS NULL OR jsonb_typeof(p_payload)<>'object' OR pg_column_size(p_payload)>32000 THEN RAISE EXCEPTION 'Invalid checkout payload' USING ERRCODE='22023';END IF;
 IF p_action='orders' THEN
  IF p_payload-ARRAY['workspace','page']<>'{}'::jsonb OR COALESCE((p_payload->>'page')::integer,1) NOT BETWEEN 1 AND 1000 THEN RAISE EXCEPTION 'Invalid order page' USING ERRCODE='22023';END IF;
  WITH selected AS (SELECT o.id,o.created_at FROM public.orders o JOIN ayuzee_commerce.stock_holds h ON h.order_id=o.id WHERE o.user_id=u ORDER BY o.created_at DESC,o.id DESC OFFSET(COALESCE((p_payload->>'page')::integer,1)-1)*12 LIMIT 13),numbered AS(SELECT id,row_number()OVER(ORDER BY created_at DESC,id DESC) rn FROM selected)
  SELECT jsonb_build_object('reservations',COALESCE(jsonb_agg(ayuzee_commerce.checkout_receipt(id,u) ORDER BY rn) FILTER(WHERE rn<=12),'[]'::jsonb),'hasMore',count(*)>12) INTO result FROM numbered;
  RETURN result;
 END IF;
 IF p_action='recover' THEN
  IF p_payload-ARRAY['workspace','quote_id','request_key']<>'{}'::jsonb THEN RAISE EXCEPTION 'Invalid recovery request' USING ERRCODE='22023';END IF;
  key:=(p_payload->>'request_key')::uuid;target:=(p_payload->>'quote_id')::uuid;
  IF key IS NULL OR target IS NULL THEN RAISE EXCEPTION 'Missing request identity' USING ERRCODE='22023';END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('checkout:'||u::text||':'||key::text,0));
  SELECT * INTO ord FROM public.orders WHERE idempotency_key='checkout:'||u::text||':'||key::text AND user_id=u;
  IF FOUND THEN
   SELECT * INTO hold FROM ayuzee_commerce.stock_holds WHERE order_id=ord.id;
   IF hold.quote_id IS DISTINCT FROM target THEN RAISE EXCEPTION 'Request identity does not match' USING ERRCODE='P5109';END IF;
   RETURN jsonb_build_object('reservation',ayuzee_commerce.checkout_receipt(ord.id,u),'quote',NULL);
  END IF;
  SELECT * INTO quote FROM ayuzee_commerce.checkout_quotes WHERE id=target AND user_id=u;
  RETURN jsonb_build_object('reservation',NULL,'quote',CASE WHEN quote.id IS NOT NULL THEN ayuzee_commerce.checkout_public_pricing(quote.pricing)||jsonb_build_object('id',quote.id,'expires_at',quote.expires_at) ELSE NULL END);
 END IF;
 IF p_action IN ('inspect','quote') THEN
  IF p_payload-ARRAY['workspace','items','postal_code','coupon_code']<>'{}'::jsonb THEN RAISE EXCEPTION 'Browser pricing fields are not accepted' USING ERRCODE='22023';END IF;
  cart:=ayuzee_commerce.checkout_cart(p_payload->'items');
  IF p_action='inspect' THEN
   FOR line IN SELECT * FROM jsonb_array_elements(cart) LOOP
    SELECT to_jsonb(p) INTO product FROM public.products_public p WHERE id=(line->>'product_id')::uuid;
    issue:=CASE WHEN product IS NULL THEN 'unavailable' WHEN (product->>'prescription_required')::boolean THEN 'prescription' WHEN ayuzee_commerce.checkout_available((line->>'product_id')::uuid)<(line->>'quantity')::integer THEN 'stock' ELSE NULL END;
    inspection:=inspection||jsonb_build_array(line||jsonb_build_object('product',product,'issue',issue));
   END LOOP;RETURN jsonb_build_object('lines',inspection);
  END IF;
  pricing:=ayuzee_commerce.checkout_pricing(u,cart,p_payload->>'postal_code',p_payload->>'coupon_code');
  INSERT INTO ayuzee_commerce.checkout_quotes(user_id,items,pricing,expires_at) VALUES(u,cart,pricing,clock_timestamp()+interval '10 minutes') RETURNING * INTO quote;
  RETURN jsonb_build_object('quote',ayuzee_commerce.checkout_public_pricing(pricing)||jsonb_build_object('id',quote.id,'expires_at',quote.expires_at));
 ELSIF p_action='reserve' THEN
  IF p_payload-ARRAY['workspace','quote_id','request_key','address']<>'{}'::jsonb THEN RAISE EXCEPTION 'Browser order fields are not accepted' USING ERRCODE='22023';END IF;
  key:=(p_payload->>'request_key')::uuid;target:=(p_payload->>'quote_id')::uuid;address:=ayuzee_commerce.checkout_address(p_payload->'address');
  IF key IS NULL OR target IS NULL THEN RAISE EXCEPTION 'Missing request identity' USING ERRCODE='22023';END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('checkout:'||u::text||':'||key::text,0));
  SELECT * INTO ord FROM public.orders WHERE idempotency_key='checkout:'||u::text||':'||key::text FOR UPDATE;
  IF FOUND THEN
   SELECT * INTO hold FROM ayuzee_commerce.stock_holds WHERE order_id=ord.id;
   IF ord.user_id IS DISTINCT FROM u OR hold.quote_id IS DISTINCT FROM target OR ord.address IS DISTINCT FROM address THEN RAISE EXCEPTION 'Request key reused for another payload' USING ERRCODE='P5109';END IF;
   RETURN jsonb_build_object('reservation',ayuzee_commerce.checkout_receipt(ord.id,u));
  END IF;
  SELECT * INTO quote FROM ayuzee_commerce.checkout_quotes WHERE id=target AND user_id=u FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Quote unavailable' USING ERRCODE='42501';END IF;
  IF EXISTS(SELECT 1 FROM ayuzee_commerce.stock_holds WHERE quote_id=quote.id) THEN RAISE EXCEPTION 'Quote already used by another request' USING ERRCODE='P5109';END IF;
  IF quote.expires_at<=clock_timestamp() THEN RAISE EXCEPTION 'Quote expired' USING ERRCODE='P5104';END IF;
  IF address->>'pincode' IS DISTINCT FROM quote.pricing->>'postal_code' THEN RAISE EXCEPTION 'Delivery address changed' USING ERRCODE='P5106';END IF;
  pricing:=ayuzee_commerce.checkout_pricing(u,quote.items,quote.pricing->>'postal_code',quote.pricing->>'coupon_code');
  IF quote.expires_at<=clock_timestamp() THEN RAISE EXCEPTION 'Quote expired while waiting' USING ERRCODE='P5104';END IF;
  IF pricing IS DISTINCT FROM quote.pricing THEN RAISE EXCEPTION 'Pricing changed; review a new quote' USING ERRCODE='P5105';END IF;
  IF NOT ayuzee_commerce.checkout_live_session() OR NOT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=u AND role::text=w) THEN RAISE EXCEPTION 'Checkout session revoked' USING ERRCODE='42501';END IF;
  INSERT INTO public.orders(user_id,full_name,email,phone,address,items,total,order_status,payment_status,idempotency_key)
   VALUES(u,address->>'full_name',(SELECT email FROM auth.users WHERE id=u),address->>'phone',address,pricing->'lines',(pricing->>'total_paise')::numeric/100,'pending','unpaid','checkout:'||u::text||':'||key::text) RETURNING * INTO ord;
  INSERT INTO ayuzee_commerce.stock_holds(order_id,quote_id,user_id,request_key,coupon_code,expires_at)
   VALUES(ord.id,quote.id,u,key,pricing->>'coupon_code',clock_timestamp()+interval '15 minutes');
  INSERT INTO ayuzee_commerce.stock_hold_lines(order_id,product_id,quantity) SELECT ord.id,(x->>'product_id')::uuid,(x->>'quantity')::integer FROM jsonb_array_elements(quote.items)x;
  INSERT INTO ayuzee_commerce.checkout_events(order_id,actor_id,kind) VALUES(ord.id,u,'reserved');
  RETURN jsonb_build_object('reservation',ayuzee_commerce.checkout_receipt(ord.id,u));
 ELSIF p_action IN ('status','release') THEN
  IF p_payload-ARRAY['workspace','order_id']<>'{}'::jsonb OR p_payload->>'order_id' IS NULL THEN RAISE EXCEPTION 'Invalid order request' USING ERRCODE='22023';END IF;
  SELECT * INTO ord FROM public.orders WHERE id=(p_payload->>'order_id')::uuid AND user_id=u FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order unavailable' USING ERRCODE='42501';END IF;
  SELECT * INTO hold FROM ayuzee_commerce.stock_holds WHERE order_id=ord.id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Reservation unavailable' USING ERRCODE='42501';END IF;
  IF p_action='release' AND hold.state='held' THEN
   IF ord.payment_status<>'unpaid' OR ord.order_status<>'pending' THEN RAISE EXCEPTION 'Cannot release a processed order' USING ERRCODE='42501';END IF;
   UPDATE ayuzee_commerce.stock_holds SET state=CASE WHEN expires_at<=clock_timestamp() THEN 'expired' ELSE 'released' END WHERE order_id=ord.id;
   UPDATE public.orders SET order_status='cancelled',updated_at=clock_timestamp() WHERE id=ord.id;
   INSERT INTO ayuzee_commerce.checkout_events(order_id,actor_id,kind) VALUES(ord.id,u,CASE WHEN hold.expires_at<=clock_timestamp() THEN 'expired' ELSE 'released' END);
  END IF;
  RETURN jsonb_build_object('reservation',ayuzee_commerce.checkout_receipt(ord.id,u));
 ELSE RAISE EXCEPTION 'Unknown checkout action' USING ERRCODE='22023';END IF;
END $$;
CREATE FUNCTION public.commerce_checkout(p_action text,p_payload jsonb) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$SELECT ayuzee_commerce.checkout_api(p_action,p_payload)$$;
CREATE FUNCTION ayuzee_commerce.expire_checkout_holds(p_limit integer) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE target record;n integer:=0;BEGIN
 IF NOT ayuzee_private.rbac_server() OR p_limit NOT BETWEEN 1 AND 1000 THEN RAISE EXCEPTION 'Expiry worker denied' USING ERRCODE='42501';END IF;
 FOR target IN SELECT o.id FROM public.orders o JOIN ayuzee_commerce.stock_holds h ON h.order_id=o.id WHERE h.state='held' AND h.expires_at<=clock_timestamp() AND o.order_status='pending' AND o.payment_status='unpaid' ORDER BY o.id LIMIT p_limit FOR UPDATE OF o,h SKIP LOCKED LOOP
  UPDATE ayuzee_commerce.stock_holds SET state='expired' WHERE order_id=target.id;
  UPDATE public.orders SET order_status='cancelled',updated_at=clock_timestamp() WHERE id=target.id;
  INSERT INTO ayuzee_commerce.checkout_events(order_id,kind) VALUES(target.id,'expired');n:=n+1;
 END LOOP;RETURN n;
END $$;
CREATE FUNCTION public.expire_checkout_holds(p_limit integer DEFAULT 100) RETURNS integer LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$SELECT ayuzee_commerce.expire_checkout_holds(p_limit)$$;
REVOKE ALL ON FUNCTION ayuzee_commerce.bump_checkout_revision(),ayuzee_commerce.checkout_cart(jsonb),ayuzee_commerce.checkout_available(uuid),ayuzee_commerce.checkout_pricing(uuid,jsonb,text,text),ayuzee_commerce.checkout_public_pricing(jsonb),ayuzee_commerce.checkout_address(jsonb),ayuzee_commerce.checkout_receipt(uuid,uuid),ayuzee_commerce.checkout_api(text,jsonb),public.commerce_checkout(text,jsonb),ayuzee_commerce.expire_checkout_holds(integer),public.expire_checkout_holds(integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION ayuzee_commerce.checkout_api(text,jsonb),public.commerce_checkout(text,jsonb) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION ayuzee_commerce.expire_checkout_holds(integer),public.expire_checkout_holds(integer) TO service_role;
-- Direct writes via the API are already fenced by phase3-catalog.sql. Private
-- tables have no browser policies/grants. Expired holds free capacity logically,
-- even before a separately configured trusted expiry worker has run.
NOTIFY pgrst,'reload schema';
COMMIT;
