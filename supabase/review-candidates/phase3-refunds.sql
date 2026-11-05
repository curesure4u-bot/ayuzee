-- Phase 3.7 LOCAL candidate. Requires catalog, checkout, payments and fulfilment.
-- No provider endpoint/keys. A fixture-only worker must be explicitly enabled.
BEGIN;
CREATE TABLE ayuzee_commerce.refund_policy(singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton),enabled boolean NOT NULL DEFAULT false,integration text CHECK(integration ~ '^fixture_[A-Za-z0-9_]{3,80}$'));
INSERT INTO ayuzee_commerce.refund_policy DEFAULT VALUES;
CREATE TABLE ayuzee_commerce.cancellations(
 order_id uuid PRIMARY KEY,actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
 reason text NOT NULL CHECK(length(reason) BETWEEN 10 AND 500),restocked boolean NOT NULL,created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE ayuzee_commerce.refunds(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),order_id uuid NOT NULL,attempt_id uuid NOT NULL REFERENCES ayuzee_commerce.payment_attempts(id),
 payment_id text NOT NULL,payment_integration text NOT NULL,integration text NOT NULL,request_key uuid NOT NULL UNIQUE,
 amount_paise bigint NOT NULL CHECK(amount_paise BETWEEN 1 AND 1000000000),currency text NOT NULL CHECK(currency='INR'),
 state text NOT NULL DEFAULT 'requested' CHECK(state IN('requested','creating','uncertain','pending','processed','failed')),
 requested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,workspace text NOT NULL,session_id uuid NOT NULL,
 reason text NOT NULL CHECK(length(reason) BETWEEN 10 AND 500),claim_token uuid,provider_refund_id text UNIQUE,
 last_code text,last_checked_at timestamptz,created_at timestamptz NOT NULL DEFAULT clock_timestamp(),updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 FOREIGN KEY(payment_integration,payment_id) REFERENCES ayuzee_commerce.payment_receipts(integration,payment_id)
);
CREATE INDEX refunds_payment ON ayuzee_commerce.refunds(payment_integration,payment_id,state);
CREATE INDEX refunds_order ON ayuzee_commerce.refunds(order_id,created_at,id);
CREATE INDEX refunds_work ON ayuzee_commerce.refunds(updated_at,id) WHERE state IN('requested','creating','uncertain','pending');
CREATE TABLE ayuzee_commerce.refund_audit(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),order_id uuid NOT NULL,refund_id uuid REFERENCES ayuzee_commerce.refunds(id),actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,kind text NOT NULL,created_at timestamptz NOT NULL DEFAULT clock_timestamp());
CREATE INDEX refund_audit_order ON ayuzee_commerce.refund_audit(order_id,created_at);
DO $$DECLARE t text;BEGIN FOREACH t IN ARRAY ARRAY['refund_policy','cancellations','refunds','refund_audit'] LOOP
 EXECUTE format('ALTER TABLE ayuzee_commerce.%I ENABLE ROW LEVEL SECURITY',t);EXECUTE format('REVOKE ALL ON ayuzee_commerce.%I FROM PUBLIC,anon,authenticated',t);
END LOOP;END $$;
CREATE FUNCTION ayuzee_commerce.refund_public(p_order uuid) RETURNS jsonb LANGUAGE sql VOLATILE SECURITY INVOKER SET search_path='' AS $$
 SELECT jsonb_build_object('order_id',p_order,'order_status',(SELECT order_status FROM public.orders WHERE id=p_order),
 'cancelled',EXISTS(SELECT 1 FROM ayuzee_commerce.cancellations WHERE order_id=p_order),
 'payments',(SELECT COALESCE(jsonb_agg(jsonb_build_object('payment_id',r.payment_id,'captured_paise',a.amount_paise,'review_required',r.disposition='review_required',
 'reserved_paise',COALESCE((SELECT sum(x.amount_paise) FROM ayuzee_commerce.refunds x WHERE x.payment_integration=r.integration AND x.payment_id=r.payment_id AND x.state<>'failed'),0),
 'processed_paise',COALESCE((SELECT sum(x.amount_paise) FROM ayuzee_commerce.refunds x WHERE x.payment_integration=r.integration AND x.payment_id=r.payment_id AND x.state='processed'),0)) ORDER BY r.payment_id),'[]'::jsonb) FROM ayuzee_commerce.payment_attempts a JOIN ayuzee_commerce.payment_receipts r ON r.attempt_id=a.id WHERE a.order_id=p_order),
 'refunds',(SELECT COALESCE(jsonb_agg(jsonb_build_object('id',x.id,'payment_id',x.payment_id,'amount_paise',x.amount_paise,'currency',x.currency,'state',x.state,'created_at',x.created_at,'last_checked_at',x.last_checked_at,'last_code',x.last_code) ORDER BY x.created_at DESC,x.id),'[]'::jsonb) FROM(SELECT * FROM ayuzee_commerce.refunds WHERE order_id=p_order ORDER BY created_at DESC,id LIMIT 50)x))
$$;
CREATE FUNCTION ayuzee_commerce.refund_api(p_action text,p_payload jsonb) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path='' SET lock_timeout='5s' AS $$
DECLARE u uuid:=auth.uid();w text:=p_payload->>'workspace';target uuid;ord public.orders;a ayuzee_commerce.payment_attempts;f ayuzee_commerce.fulfilments;h ayuzee_commerce.stock_holds;
 r ayuzee_commerce.payment_receipts;x ayuzee_commerce.refunds;cfg ayuzee_commerce.refund_policy;v_amount bigint;v_reason text;v_reserved bigint;staff boolean;
BEGIN
 IF NOT ayuzee_commerce.checkout_live_session() OR NOT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=u AND role::text=w) THEN RAISE EXCEPTION 'Order access denied' USING ERRCODE='42501';END IF;
 IF p_payload IS NULL OR jsonb_typeof(p_payload)<>'object' OR pg_column_size(p_payload)>4000 THEN RAISE EXCEPTION 'Invalid resolution request' USING ERRCODE='22023';END IF;
 staff:=w IN('orders_admin','admin','super_admin');target:=(p_payload->>'order_id')::uuid;
 -- All commerce mutations lock order -> payment attempt -> fulfilment -> hold -> sorted products.
 SELECT * INTO ord FROM public.orders WHERE id=target FOR UPDATE;
 SELECT * INTO a FROM ayuzee_commerce.payment_attempts WHERE order_id=target FOR UPDATE;
 IF NOT ayuzee_commerce.checkout_live_session() OR NOT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=u AND role::text=w) THEN RAISE EXCEPTION 'Order access revoked' USING ERRCODE='42501';END IF;
 IF (ord.id IS NULL AND (NOT staff OR a.id IS NULL)) OR (NOT staff AND ord.user_id IS DISTINCT FROM u) THEN RAISE EXCEPTION 'Order unavailable' USING ERRCODE='42501';END IF;
 IF p_action='status' THEN
  IF p_payload-ARRAY['workspace','order_id']<>'{}'::jsonb THEN RAISE EXCEPTION 'Invalid status request' USING ERRCODE='22023';END IF;RETURN ayuzee_commerce.refund_public(target);
 END IF;
 IF p_action='cancel' THEN
  IF p_payload-ARRAY['workspace','order_id','reason']<>'{}'::jsonb THEN RAISE EXCEPTION 'Invalid cancellation request' USING ERRCODE='22023';END IF;
  IF EXISTS(SELECT 1 FROM ayuzee_commerce.cancellations WHERE order_id=target) THEN RETURN ayuzee_commerce.refund_public(target);END IF;
  v_reason:=trim(p_payload->>'reason');IF v_reason IS NULL OR length(v_reason) NOT BETWEEN 10 AND 500 THEN RAISE EXCEPTION 'A cancellation reason is required' USING ERRCODE='22023';END IF;
  SELECT * INTO f FROM ayuzee_commerce.fulfilments WHERE order_id=target FOR UPDATE;
  IF ord.id IS NULL OR ord.order_status NOT IN('pending','confirmed','processing') OR (f.id IS NOT NULL AND f.state NOT IN('packing','packed')) THEN RAISE EXCEPTION 'Courier or order review required before cancellation' USING ERRCODE='P5401';END IF;
  SELECT * INTO h FROM ayuzee_commerce.stock_holds WHERE order_id=target FOR UPDATE;
  IF h.order_id IS NULL OR ord.payment_status NOT IN('unpaid','paid') THEN RAISE EXCEPTION 'Unsupported cancellation' USING ERRCODE='P5401';END IF;
  IF h.state='committed' THEN
   PERFORM p.id FROM public.products p JOIN ayuzee_commerce.stock_hold_lines l ON l.product_id=p.id WHERE l.order_id=target ORDER BY p.id FOR UPDATE OF p;
   UPDATE public.products p SET stock=p.stock+l.quantity FROM ayuzee_commerce.stock_hold_lines l WHERE l.order_id=target AND l.product_id=p.id;
  ELSIF h.state='held' THEN UPDATE ayuzee_commerce.stock_holds SET state='released' WHERE order_id=target;
  END IF;
  INSERT INTO ayuzee_commerce.cancellations(order_id,actor_id,reason,restocked) VALUES(target,u,v_reason,h.state='committed');
  UPDATE public.orders SET order_status='cancelled',updated_at=clock_timestamp() WHERE id=target;
  INSERT INTO ayuzee_commerce.refund_audit(order_id,actor_id,kind) VALUES(target,u,'order_cancelled');
  RETURN ayuzee_commerce.refund_public(target);
 END IF;
 IF NOT staff THEN RAISE EXCEPTION 'Refund operations denied' USING ERRCODE='42501';END IF;
 IF p_action='reauthorize' THEN
  IF p_payload-ARRAY['workspace','order_id','id']<>'{}'::jsonb THEN RAISE EXCEPTION 'Invalid reauthorization' USING ERRCODE='22023';END IF;
  UPDATE ayuzee_commerce.refunds SET requested_by=u,workspace=w,session_id=(NULLIF(current_setting('request.jwt.claims',true),'')::jsonb->>'session_id')::uuid,updated_at=clock_timestamp() WHERE id=(p_payload->>'id')::uuid AND order_id=target AND state='requested' RETURNING * INTO x;
  IF NOT FOUND THEN RAISE EXCEPTION 'Only an unclaimed refund may be reauthorized' USING ERRCODE='P5401';END IF;
  INSERT INTO ayuzee_commerce.refund_audit(order_id,refund_id,actor_id,kind) VALUES(target,x.id,u,'refund_reauthorized');RETURN ayuzee_commerce.refund_public(target);
 END IF;
 IF p_action<>'request' OR p_payload-ARRAY['workspace','order_id','payment_id','amount_paise','request_key','reason']<>'{}'::jsonb THEN RAISE EXCEPTION 'Invalid refund request' USING ERRCODE='22023';END IF;
 IF jsonb_typeof(p_payload->'amount_paise') IS DISTINCT FROM 'number' OR COALESCE(p_payload->>'amount_paise','')!~'^[1-9][0-9]{0,9}$' THEN RAISE EXCEPTION 'Invalid refund amount' USING ERRCODE='22023';END IF;
 v_amount:=(p_payload->>'amount_paise')::bigint;v_reason:=trim(p_payload->>'reason');IF v_reason IS NULL OR length(v_reason) NOT BETWEEN 10 AND 500 OR p_payload->>'request_key' IS NULL THEN RAISE EXCEPTION 'Refund reason and durable request key required' USING ERRCODE='22023';END IF;
 SELECT * INTO x FROM ayuzee_commerce.refunds WHERE request_key=(p_payload->>'request_key')::uuid;
 IF FOUND THEN
  IF x.order_id<>target OR x.payment_id IS DISTINCT FROM p_payload->>'payment_id' OR x.amount_paise<>v_amount OR x.reason<>v_reason THEN RAISE EXCEPTION 'Refund retry changed' USING ERRCODE='P5402';END IF;RETURN ayuzee_commerce.refund_public(target);
 END IF;
 SELECT * INTO r FROM ayuzee_commerce.payment_receipts WHERE attempt_id=a.id AND payment_id=p_payload->>'payment_id' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Captured payment unavailable' USING ERRCODE='P5402';END IF;
 -- Confirmed fulfilments require cancellation or completed delivery/return. Late/additional captures may be refunded independently.
 IF r.disposition='confirmed' AND COALESCE(ord.order_status,'') NOT IN('cancelled','delivered','returned') THEN RAISE EXCEPTION 'Resolve fulfilment before refunding this payment' USING ERRCODE='P5401';END IF;
 SELECT * INTO cfg FROM ayuzee_commerce.refund_policy WHERE singleton FOR SHARE;
 IF NOT cfg.enabled OR cfg.integration IS NULL THEN RAISE EXCEPTION 'Refund processing is not configured' USING ERRCODE='P5400';END IF;
 SELECT COALESCE(sum(amount_paise),0) INTO v_reserved FROM ayuzee_commerce.refunds WHERE payment_integration=r.integration AND payment_id=r.payment_id AND state<>'failed';
 IF v_amount<1 OR v_amount+v_reserved>a.amount_paise THEN RAISE EXCEPTION 'Refund exceeds remaining captured amount' USING ERRCODE='P5402';END IF;
 INSERT INTO ayuzee_commerce.refunds(order_id,attempt_id,payment_id,payment_integration,integration,request_key,amount_paise,currency,requested_by,workspace,session_id,reason)
 VALUES(target,a.id,r.payment_id,r.integration,cfg.integration,(p_payload->>'request_key')::uuid,v_amount,a.currency,u,w,(NULLIF(current_setting('request.jwt.claims',true),'')::jsonb->>'session_id')::uuid,v_reason) RETURNING * INTO x;
 INSERT INTO ayuzee_commerce.refund_audit(order_id,refund_id,actor_id,kind) VALUES(target,x.id,u,'refund_requested');RETURN ayuzee_commerce.refund_public(target);
END $$;
CREATE FUNCTION public.commerce_resolution(p_action text,p_payload jsonb) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$SELECT ayuzee_commerce.refund_api(p_action,p_payload)$$;
CREATE FUNCTION ayuzee_commerce.refund_worker(p_action text,p_payload jsonb) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path='' SET lock_timeout='5s' AS $$
DECLARE x ayuzee_commerce.refunds;a ayuzee_commerce.payment_attempts;cfg ayuzee_commerce.refund_policy;result jsonb;v_state text;v_total bigint;
BEGIN
 IF NOT ayuzee_private.rbac_server() THEN RAISE EXCEPTION 'Refund worker denied' USING ERRCODE='42501';END IF;
 IF p_payload IS NULL OR jsonb_typeof(p_payload)<>'object' OR pg_column_size(p_payload)>8000 THEN RAISE EXCEPTION 'Invalid worker request' USING ERRCODE='22023';END IF;
 IF p_action='list' THEN SELECT COALESCE(jsonb_agg(to_jsonb(y)),'[]'::jsonb) INTO result FROM(SELECT * FROM ayuzee_commerce.refunds WHERE integration=p_payload->>'integration' AND state IN('requested','creating','uncertain','pending') ORDER BY updated_at,id LIMIT 20)y;RETURN result;END IF;
 SELECT * INTO x FROM ayuzee_commerce.refunds WHERE id=(p_payload->>'id')::uuid;
 IF NOT FOUND OR x.integration IS DISTINCT FROM p_payload->>'integration' THEN RAISE EXCEPTION 'Refund unavailable' USING ERRCODE='42501';END IF;
 PERFORM id FROM public.orders WHERE id=x.order_id FOR UPDATE;
 SELECT * INTO a FROM ayuzee_commerce.payment_attempts WHERE id=x.attempt_id FOR UPDATE;
 SELECT * INTO x FROM ayuzee_commerce.refunds WHERE id=x.id FOR UPDATE;
 IF p_action='get' THEN RETURN to_jsonb(x)||jsonb_build_object('provider_order_id',a.provider_order_id,'captured_paise',a.amount_paise,'processed_paise',(SELECT COALESCE(sum(amount_paise),0) FROM ayuzee_commerce.refunds WHERE payment_integration=x.payment_integration AND payment_id=x.payment_id AND state='processed'));END IF;
 IF p_action='claim' THEN
  IF x.state<>'requested' THEN RETURN jsonb_build_object('claimed',false);END IF;
  -- One provider mutation at a time per captured payment, including uncertain results.
  IF EXISTS(SELECT 1 FROM ayuzee_commerce.refunds WHERE payment_integration=x.payment_integration AND payment_id=x.payment_id AND id<>x.id AND state IN('creating','uncertain','pending')) THEN RETURN jsonb_build_object('claimed',false);END IF;
  SELECT * INTO cfg FROM ayuzee_commerce.refund_policy WHERE singleton FOR SHARE;
  IF NOT cfg.enabled OR cfg.integration IS DISTINCT FROM x.integration THEN RAISE EXCEPTION 'Refund processing unavailable' USING ERRCODE='P5400';END IF;
  IF NOT EXISTS(SELECT 1 FROM auth.users u JOIN auth.sessions s ON s.user_id=u.id JOIN public.user_roles r ON r.user_id=u.id WHERE u.id=x.requested_by AND u.deleted_at IS NULL AND u.email_confirmed_at IS NOT NULL AND s.id=x.session_id AND(s.not_after IS NULL OR s.not_after>clock_timestamp()) AND r.role::text=x.workspace AND r.role::text IN('orders_admin','admin','super_admin')) THEN RAISE EXCEPTION 'Refund permission revoked' USING ERRCODE='42501';END IF;
  UPDATE ayuzee_commerce.refunds SET state='creating',claim_token=gen_random_uuid(),updated_at=clock_timestamp() WHERE id=x.id RETURNING * INTO x;
  RETURN jsonb_build_object('claimed',true,'refund',to_jsonb(x),'provider_order_id',a.provider_order_id,'captured_paise',a.amount_paise,'processed_paise',(SELECT COALESCE(sum(amount_paise),0) FROM ayuzee_commerce.refunds WHERE payment_integration=x.payment_integration AND payment_id=x.payment_id AND state='processed'));
 ELSIF p_action='checked' THEN
  IF p_payload->>'code' NOT IN('ok','retry','uncertain','binding_error') THEN RAISE EXCEPTION 'Invalid check result' USING ERRCODE='22023';END IF;
  UPDATE ayuzee_commerce.refunds SET last_checked_at=clock_timestamp(),last_code=p_payload->>'code',updated_at=clock_timestamp() WHERE id=x.id;RETURN jsonb_build_object('checked',true);
 ELSIF p_action='uncertain' THEN
  UPDATE ayuzee_commerce.refunds SET state='uncertain',last_code='uncertain',updated_at=clock_timestamp() WHERE id=x.id AND state='creating' AND claim_token=(p_payload->>'claim_token')::uuid;RETURN jsonb_build_object('recorded',FOUND);
 ELSIF p_action='observe' THEN
  v_state:=p_payload->>'state';
  IF x.claim_token IS NULL OR x.claim_token IS DISTINCT FROM(p_payload->>'claim_token')::uuid OR x.id::text IS DISTINCT FROM p_payload->>'reference' OR x.payment_id IS DISTINCT FROM p_payload->>'payment_id' OR a.provider_order_id IS DISTINCT FROM p_payload->>'provider_order_id' OR x.amount_paise IS DISTINCT FROM(p_payload->>'amount_paise')::bigint OR x.currency IS DISTINCT FROM p_payload->>'currency' OR(p_payload->>'provider_refund_id'~'^fixture_ref_[A-Za-z0-9]{3,80}$') IS NOT TRUE OR v_state IS NULL OR v_state NOT IN('pending','processed','failed') THEN RAISE EXCEPTION 'Refund evidence mismatch' USING ERRCODE='P5402';END IF;
  IF x.provider_refund_id IS NOT NULL AND x.provider_refund_id IS DISTINCT FROM p_payload->>'provider_refund_id' THEN RAISE EXCEPTION 'Refund already bound' USING ERRCODE='P5402';END IF;
  IF x.state IN('processed','failed') THEN
   IF x.state<>v_state THEN RAISE EXCEPTION 'Terminal refund conflict requires review' USING ERRCODE='P5402';END IF;RETURN to_jsonb(x);
  END IF;
  IF x.state NOT IN('creating','uncertain','pending') THEN RAISE EXCEPTION 'Refund was not claimed' USING ERRCODE='P5402';END IF;
  UPDATE ayuzee_commerce.refunds SET state=v_state,provider_refund_id=p_payload->>'provider_refund_id',last_code='ok',last_checked_at=clock_timestamp(),updated_at=clock_timestamp() WHERE id=x.id RETURNING * INTO x;
  -- Only a completely returned confirmed capture changes canonical payment_status.
  SELECT COALESCE(sum(amount_paise),0) INTO v_total FROM ayuzee_commerce.refunds WHERE payment_integration=x.payment_integration AND payment_id=x.payment_id AND state='processed';
  IF v_total=a.amount_paise AND EXISTS(SELECT 1 FROM ayuzee_commerce.payment_receipts WHERE integration=x.payment_integration AND payment_id=x.payment_id AND disposition='confirmed') THEN UPDATE public.orders SET payment_status='refunded',updated_at=clock_timestamp() WHERE id=x.order_id;END IF;
  INSERT INTO ayuzee_commerce.refund_audit(order_id,refund_id,kind) VALUES(x.order_id,x.id,'refund_'||v_state);RETURN to_jsonb(x);
 ELSE RAISE EXCEPTION 'Invalid refund worker action' USING ERRCODE='22023';END IF;
END $$;
CREATE FUNCTION public.commerce_refund_worker(p_action text,p_payload jsonb) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$SELECT ayuzee_commerce.refund_worker(p_action,p_payload)$$;
REVOKE ALL ON FUNCTION ayuzee_commerce.refund_public(uuid),ayuzee_commerce.refund_api(text,jsonb),public.commerce_resolution(text,jsonb),ayuzee_commerce.refund_worker(text,jsonb),public.commerce_refund_worker(text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION ayuzee_commerce.refund_api(text,jsonb),public.commerce_resolution(text,jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION ayuzee_commerce.refund_worker(text,jsonb),public.commerce_refund_worker(text,jsonb) TO service_role;
NOTIFY pgrst,'reload schema';
COMMIT;
