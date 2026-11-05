-- Phase 3.6 LOCAL ONLY. Requires catalog, checkout and payment candidates.
-- Fictional courier integration only. No courier endpoint/key/scheduler is configured.
BEGIN;
CREATE TABLE ayuzee_commerce.fulfilment_policy(
 singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton),enabled boolean NOT NULL DEFAULT false,
 integration text CHECK(integration ~ '^fixture_[A-Za-z0-9_-]{3,60}$'),pickup_code text CHECK(length(pickup_code) BETWEEN 2 AND 80)
);
INSERT INTO ayuzee_commerce.fulfilment_policy DEFAULT VALUES;
CREATE TABLE ayuzee_commerce.fulfilments(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),order_id uuid NOT NULL UNIQUE,
 state text NOT NULL DEFAULT 'packing' CHECK(state IN('packing','packed','queued','creating','uncertain','booked','in_transit','out_for_delivery','delivery_exception','delivered','return_in_transit','returned')),
 revision bigint NOT NULL DEFAULT 1,parcel jsonb,integration text,pickup_code text,address_hash text,
 requested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,workspace text,session_id uuid,claim_token uuid,
 booking_id text UNIQUE CHECK(booking_id ~ '^fixture_[A-Za-z0-9_-]{3,80}$'),tracking_code text UNIQUE CHECK(tracking_code ~ '^[A-Za-z0-9-]{4,40}$'),
 needs_review boolean NOT NULL DEFAULT false,last_event_at timestamptz,last_checked_at timestamptz,last_sync_code text CHECK(last_sync_code IN('ok','retry','uncertain','binding_error')),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX fulfilments_work ON ayuzee_commerce.fulfilments(updated_at,id) WHERE state IN('creating','uncertain','booked','in_transit','out_for_delivery','delivery_exception','return_in_transit');
CREATE TABLE ayuzee_commerce.fulfilment_audit(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),fulfilment_id uuid NOT NULL REFERENCES ayuzee_commerce.fulfilments(id) ON DELETE CASCADE,
 actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,kind text NOT NULL,reason text,created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX fulfilment_audit_parent ON ayuzee_commerce.fulfilment_audit(fulfilment_id);
CREATE TABLE ayuzee_commerce.delivery_events(
 integration text NOT NULL,event_id text NOT NULL CHECK(length(event_id) BETWEEN 1 AND 100),body_hash text NOT NULL CHECK(body_hash ~ '^[a-f0-9]{64}$'),
 fulfilment_id uuid NOT NULL REFERENCES ayuzee_commerce.fulfilments(id) ON DELETE CASCADE,
 state text NOT NULL CHECK(state IN('booked','in_transit','out_for_delivery','delivery_exception','delivered','return_in_transit','returned')),
 occurred_at timestamptz NOT NULL,applied boolean NOT NULL,created_at timestamptz NOT NULL DEFAULT clock_timestamp(),PRIMARY KEY(integration,event_id)
);
CREATE INDEX delivery_events_parent ON ayuzee_commerce.delivery_events(fulfilment_id,occurred_at DESC,event_id);
DO $$ DECLARE t text;BEGIN FOREACH t IN ARRAY ARRAY['fulfilment_policy','fulfilments','fulfilment_audit','delivery_events'] LOOP
 EXECUTE format('ALTER TABLE ayuzee_commerce.%I ENABLE ROW LEVEL SECURITY',t);EXECUTE format('REVOKE ALL ON ayuzee_commerce.%I FROM PUBLIC,anon,authenticated',t);
END LOOP;END $$;
CREATE FUNCTION ayuzee_commerce.fulfilment_eligible(p_order uuid) RETURNS boolean LANGUAGE sql VOLATILE SECURITY INVOKER SET search_path='' AS $$
 SELECT EXISTS(SELECT 1 FROM public.orders o JOIN ayuzee_commerce.stock_holds h ON h.order_id=o.id JOIN ayuzee_commerce.payment_attempts a ON a.order_id=o.id
 WHERE o.id=p_order AND o.payment_status='paid' AND o.order_status IN('confirmed','processing','shipped','delivered','returned') AND h.state='committed' AND a.state='verified'
 AND EXISTS(SELECT 1 FROM ayuzee_commerce.payment_receipts r WHERE r.attempt_id=a.id AND r.disposition='confirmed') AND NOT EXISTS(SELECT 1 FROM ayuzee_commerce.payment_receipts r WHERE r.attempt_id=a.id AND r.disposition='review_required'))
$$;
CREATE FUNCTION ayuzee_commerce.fulfilment_public(p_order uuid) RETURNS jsonb LANGUAGE sql VOLATILE SECURITY INVOKER SET search_path='' AS $$
 SELECT jsonb_build_object('order_id',o.id,'order_status',o.order_status,'payment_status',o.payment_status,'total_paise',(o.total*100)::bigint,'created_at',o.created_at,
 'eligible',ayuzee_commerce.fulfilment_eligible(o.id),'fulfilment',CASE WHEN f.id IS NULL THEN NULL ELSE jsonb_build_object('id',f.id,'state',f.state,'revision',f.revision::text,'tracking_code',f.tracking_code,'mode','fixture',
 'needs_review',f.needs_review,'last_event_at',f.last_event_at,'last_checked_at',f.last_checked_at,'last_sync_code',f.last_sync_code,'events',(SELECT COALESCE(jsonb_agg(jsonb_build_object('event_id',e.event_id,'state',e.state,'occurred_at',e.occurred_at) ORDER BY e.occurred_at DESC,e.event_id),'[]'::jsonb) FROM(SELECT * FROM ayuzee_commerce.delivery_events WHERE fulfilment_id=f.id AND applied ORDER BY occurred_at DESC,event_id LIMIT 20)e)) END)
 FROM public.orders o LEFT JOIN ayuzee_commerce.fulfilments f ON f.order_id=o.id WHERE o.id=p_order
$$;
CREATE FUNCTION ayuzee_commerce.fulfilment_api(p_action text,p_payload jsonb) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path='' SET lock_timeout='5s' AS $$
DECLARE u uuid:=auth.uid();w text:=p_payload->>'workspace';ord public.orders;f ayuzee_commerce.fulfilments;cfg ayuzee_commerce.fulfilment_policy;
 result jsonb;v_parcel jsonb;v_reason text;v_target uuid;v_page integer;
BEGIN
 IF NOT ayuzee_commerce.checkout_live_session() OR NOT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=u AND role::text=w) THEN RAISE EXCEPTION 'Fulfilment access denied' USING ERRCODE='42501';END IF;
 IF p_payload IS NULL OR jsonb_typeof(p_payload)<>'object' OR pg_column_size(p_payload)>8000 THEN RAISE EXCEPTION 'Invalid fulfilment request' USING ERRCODE='22023';END IF;
 IF p_action='status' THEN
  IF p_payload-ARRAY['workspace','order_id']<>'{}'::jsonb THEN RAISE EXCEPTION 'Invalid status request' USING ERRCODE='22023';END IF;
  SELECT * INTO ord FROM public.orders WHERE id=(p_payload->>'order_id')::uuid AND user_id=u;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order unavailable' USING ERRCODE='42501';END IF;
  RETURN ayuzee_commerce.fulfilment_public(ord.id);
 END IF;
 IF w NOT IN('orders_admin','admin','super_admin') THEN RAISE EXCEPTION 'Order operations denied' USING ERRCODE='42501';END IF;
 IF p_action='queue' THEN
  IF p_payload-ARRAY['workspace','page']<>'{}'::jsonb THEN RAISE EXCEPTION 'Invalid queue request' USING ERRCODE='22023';END IF;
  v_page:=COALESCE((p_payload->>'page')::integer,1);IF v_page NOT BETWEEN 1 AND 1000 THEN RAISE EXCEPTION 'Invalid page' USING ERRCODE='22023';END IF;
  WITH selected AS(SELECT o.id,o.created_at FROM public.orders o WHERE ayuzee_commerce.fulfilment_eligible(o.id) OR EXISTS(SELECT 1 FROM ayuzee_commerce.fulfilments x WHERE x.order_id=o.id) ORDER BY o.created_at DESC,o.id DESC OFFSET(v_page-1)*12 LIMIT 13),numbered AS(SELECT id,row_number()OVER(ORDER BY created_at DESC,id DESC) rn FROM selected)
  SELECT jsonb_build_object('orders',COALESCE(jsonb_agg(ayuzee_commerce.fulfilment_public(id) ORDER BY rn) FILTER(WHERE rn<=12),'[]'::jsonb),'hasMore',count(*)>12) INTO result FROM numbered;RETURN result;
 END IF;
 v_target:=(p_payload->>'order_id')::uuid;
 SELECT * INTO ord FROM public.orders WHERE id=v_target FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Order unavailable' USING ERRCODE='42501';END IF;
 SELECT * INTO f FROM ayuzee_commerce.fulfilments WHERE order_id=ord.id FOR UPDATE;
 IF NOT ayuzee_commerce.checkout_live_session() OR NOT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=u AND role::text=w AND role::text IN('orders_admin','admin','super_admin')) THEN RAISE EXCEPTION 'Order operation access revoked' USING ERRCODE='42501';END IF;
 IF p_action='detail' THEN
  IF p_payload-ARRAY['workspace','order_id']<>'{}'::jsonb THEN RAISE EXCEPTION 'Invalid detail request' USING ERRCODE='22023';END IF;
  RETURN jsonb_build_object('order',ayuzee_commerce.fulfilment_public(ord.id),'delivery',ayuzee_commerce.checkout_address(ord.address),'items',(SELECT pricing->'lines' FROM ayuzee_commerce.checkout_quotes WHERE id=(SELECT quote_id FROM ayuzee_commerce.stock_holds WHERE order_id=ord.id)));
 END IF;
 IF NOT ayuzee_commerce.fulfilment_eligible(ord.id) OR ord.order_status NOT IN('confirmed','processing') THEN RAISE EXCEPTION 'Payment or order needs review' USING ERRCODE='P5301';END IF;
 IF p_action='start' THEN
  IF p_payload-ARRAY['workspace','order_id']<>'{}'::jsonb THEN RAISE EXCEPTION 'Invalid processing request' USING ERRCODE='22023';END IF;
  IF f.id IS NULL THEN INSERT INTO ayuzee_commerce.fulfilments(order_id) VALUES(ord.id) RETURNING * INTO f;UPDATE public.orders SET order_status='processing',updated_at=clock_timestamp() WHERE id=ord.id;INSERT INTO ayuzee_commerce.fulfilment_audit(fulfilment_id,actor_id,kind) VALUES(f.id,u,'packing_started');END IF;
  RETURN ayuzee_commerce.fulfilment_public(ord.id);
 END IF;
 IF f.id IS NULL OR f.revision::text IS DISTINCT FROM p_payload->>'revision' THEN RAISE EXCEPTION 'Order changed; refresh' USING ERRCODE='P5303';END IF;
 IF p_action='pack' THEN
  IF p_payload-ARRAY['workspace','order_id','revision','parcel','reason']<>'{}'::jsonb OR f.state<>'packing' THEN RAISE EXCEPTION 'Invalid packing transition' USING ERRCODE='22023';END IF;
  v_parcel:=p_payload->'parcel';v_reason:=trim(p_payload->>'reason');
  IF v_reason IS NULL OR length(v_reason) NOT BETWEEN 10 AND 500 OR jsonb_typeof(v_parcel) IS DISTINCT FROM 'object' OR v_parcel-ARRAY['weight_g','length_cm','width_cm','height_cm']<>'{}'::jsonb THEN RAISE EXCEPTION 'Invalid parcel' USING ERRCODE='22023';END IF;
  IF EXISTS(SELECT 1 FROM unnest(ARRAY['weight_g','length_cm','width_cm','height_cm'])k WHERE jsonb_typeof(v_parcel->k) IS DISTINCT FROM 'number' OR COALESCE(v_parcel->>k,'')!~'^[1-9][0-9]{0,5}$') THEN RAISE EXCEPTION 'Invalid parcel dimensions' USING ERRCODE='22023';END IF;
  IF (v_parcel->>'weight_g')::integer>100000 OR (v_parcel->>'length_cm')::integer>200 OR (v_parcel->>'width_cm')::integer>200 OR (v_parcel->>'height_cm')::integer>200 THEN RAISE EXCEPTION 'Unsupported parcel' USING ERRCODE='22023';END IF;
  UPDATE ayuzee_commerce.fulfilments SET parcel=v_parcel,state='packed',revision=revision+1,updated_at=clock_timestamp() WHERE id=f.id;
  INSERT INTO ayuzee_commerce.fulfilment_audit(fulfilment_id,actor_id,kind,reason) VALUES(f.id,u,'packed',v_reason);
 ELSIF p_action='reauthorize' THEN
  IF p_payload-ARRAY['workspace','order_id','revision']<>'{}'::jsonb OR f.state<>'queued' THEN RAISE EXCEPTION 'Only an unclaimed request can be reauthorized' USING ERRCODE='22023';END IF;
  UPDATE ayuzee_commerce.fulfilments SET requested_by=u,workspace=w,session_id=(NULLIF(current_setting('request.jwt.claims',true),'')::jsonb->>'session_id')::uuid,revision=revision+1,updated_at=clock_timestamp() WHERE id=f.id;
  INSERT INTO ayuzee_commerce.fulfilment_audit(fulfilment_id,actor_id,kind) VALUES(f.id,u,'booking_reauthorized');
 ELSIF p_action='request' THEN
  IF p_payload-ARRAY['workspace','order_id','revision']<>'{}'::jsonb OR f.state<>'packed' THEN RAISE EXCEPTION 'Invalid booking request' USING ERRCODE='22023';END IF;
  SELECT * INTO cfg FROM ayuzee_commerce.fulfilment_policy WHERE singleton FOR SHARE;
  IF NOT cfg.enabled OR cfg.integration IS NULL OR cfg.pickup_code IS NULL THEN RAISE EXCEPTION 'Courier configuration unavailable' USING ERRCODE='P5300';END IF;
  PERFORM ayuzee_commerce.checkout_address(ord.address);
  UPDATE ayuzee_commerce.fulfilments SET state='queued',integration=cfg.integration,pickup_code=cfg.pickup_code,address_hash=md5(ord.address::text),requested_by=u,workspace=w,
   session_id=(NULLIF(current_setting('request.jwt.claims',true),'')::jsonb->>'session_id')::uuid,revision=revision+1,updated_at=clock_timestamp() WHERE id=f.id;
  INSERT INTO ayuzee_commerce.fulfilment_audit(fulfilment_id,actor_id,kind) VALUES(f.id,u,'booking_requested');
 ELSE RAISE EXCEPTION 'Invalid fulfilment action' USING ERRCODE='22023';END IF;
 RETURN ayuzee_commerce.fulfilment_public(ord.id);
END $$;
CREATE FUNCTION public.commerce_fulfilment(p_action text,p_payload jsonb) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$SELECT ayuzee_commerce.fulfilment_api(p_action,p_payload)$$;
CREATE FUNCTION ayuzee_commerce.fulfilment_worker(p_action text,p_payload jsonb) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path='' SET lock_timeout='5s' AS $$
DECLARE f ayuzee_commerce.fulfilments;ord public.orders;cfg ayuzee_commerce.fulfilment_policy;e ayuzee_commerce.delivery_events;result jsonb;
 target uuid;v_state text;v_time timestamptz;v_applied boolean:=false;v_review boolean;v_inserted boolean;
BEGIN
 IF NOT ayuzee_private.rbac_server() THEN RAISE EXCEPTION 'Courier worker denied' USING ERRCODE='42501';END IF;
 IF p_payload IS NULL OR jsonb_typeof(p_payload)<>'object' OR pg_column_size(p_payload)>8000 THEN RAISE EXCEPTION 'Invalid worker request' USING ERRCODE='22023';END IF;
 IF p_action='list' THEN
  SELECT COALESCE(jsonb_agg(to_jsonb(x)),'[]'::jsonb) INTO result FROM(SELECT * FROM ayuzee_commerce.fulfilments WHERE integration=p_payload->>'integration' AND state IN('queued','creating','uncertain','booked','in_transit','out_for_delivery','delivery_exception','return_in_transit') ORDER BY updated_at,id LIMIT 20)x;RETURN result;
 END IF;
 SELECT * INTO f FROM ayuzee_commerce.fulfilments WHERE id=(p_payload->>'id')::uuid;
 IF NOT FOUND THEN RAISE EXCEPTION 'Shipment unavailable' USING ERRCODE='42501';END IF;
 SELECT * INTO ord FROM public.orders WHERE id=f.order_id FOR UPDATE;
 SELECT * INTO f FROM ayuzee_commerce.fulfilments WHERE id=f.id FOR UPDATE;
 IF f.integration IS DISTINCT FROM p_payload->>'integration' THEN RAISE EXCEPTION 'Courier integration mismatch' USING ERRCODE='42501';END IF;
 IF p_action='get' THEN RETURN to_jsonb(f);
 ELSIF p_action='checked' THEN
  IF p_payload->>'code' NOT IN('ok','retry','uncertain','binding_error') THEN RAISE EXCEPTION 'Invalid check outcome' USING ERRCODE='22023';END IF;
  UPDATE ayuzee_commerce.fulfilments SET last_checked_at=clock_timestamp(),last_sync_code=p_payload->>'code',updated_at=clock_timestamp() WHERE id=f.id;RETURN jsonb_build_object('checked',true);
 ELSIF p_action='claim' THEN
  IF f.state<>'queued' THEN RETURN jsonb_build_object('claimed',false,'shipment',to_jsonb(f));END IF;
  SELECT * INTO cfg FROM ayuzee_commerce.fulfilment_policy WHERE singleton FOR SHARE;
  IF NOT cfg.enabled OR cfg.integration IS DISTINCT FROM f.integration OR cfg.pickup_code IS DISTINCT FROM f.pickup_code THEN RAISE EXCEPTION 'Courier configuration unavailable' USING ERRCODE='P5300';END IF;
  IF NOT EXISTS(SELECT 1 FROM auth.users u JOIN auth.sessions s ON s.user_id=u.id JOIN public.user_roles r ON r.user_id=u.id WHERE u.id=f.requested_by AND u.deleted_at IS NULL AND u.email_confirmed_at IS NOT NULL AND s.id=f.session_id AND(s.not_after IS NULL OR s.not_after>clock_timestamp()) AND r.role::text=f.workspace AND r.role::text IN('orders_admin','admin','super_admin')) THEN RAISE EXCEPTION 'Staff permission revoked' USING ERRCODE='42501';END IF;
  IF ord.id IS NULL OR NOT ayuzee_commerce.fulfilment_eligible(f.order_id) OR ord.order_status<>'processing' OR f.address_hash IS DISTINCT FROM md5(ord.address::text) THEN RAISE EXCEPTION 'Dispatch needs review' USING ERRCODE='P5301';END IF;
  UPDATE ayuzee_commerce.fulfilments SET state='creating',claim_token=gen_random_uuid(),revision=revision+1,updated_at=clock_timestamp() WHERE id=f.id RETURNING * INTO f;
  RETURN jsonb_build_object('claimed',true,'shipment',to_jsonb(f),'delivery',ayuzee_commerce.checkout_address(ord.address));
 ELSIF p_action='uncertain' THEN
  UPDATE ayuzee_commerce.fulfilments SET state='uncertain',revision=revision+1,last_sync_code='uncertain',updated_at=clock_timestamp() WHERE id=f.id AND state='creating' AND claim_token=(p_payload->>'claim_token')::uuid;RETURN jsonb_build_object('recorded',FOUND);
 ELSIF p_action='bind' THEN
  IF f.claim_token IS NULL OR f.claim_token IS DISTINCT FROM(p_payload->>'claim_token')::uuid OR f.id::text IS DISTINCT FROM p_payload->>'reference' OR(p_payload->>'booking_id'~'^fixture_[A-Za-z0-9_-]{3,80}$') IS NOT TRUE OR(p_payload->>'tracking_code'~'^[A-Za-z0-9-]{4,40}$') IS NOT TRUE THEN RAISE EXCEPTION 'Shipment binding mismatch' USING ERRCODE='P5302';END IF;
  IF f.booking_id IS NOT NULL THEN IF f.booking_id IS DISTINCT FROM p_payload->>'booking_id' OR f.tracking_code IS DISTINCT FROM p_payload->>'tracking_code' THEN RAISE EXCEPTION 'Shipment already bound' USING ERRCODE='P5302';END IF;RETURN to_jsonb(f);END IF;
  IF f.state NOT IN('creating','uncertain') THEN RAISE EXCEPTION 'Invalid booking state' USING ERRCODE='P5302';END IF;
  v_review:=ord.id IS NULL OR NOT ayuzee_commerce.fulfilment_eligible(f.order_id) OR f.address_hash IS DISTINCT FROM md5(ord.address::text);
  UPDATE ayuzee_commerce.fulfilments SET state='booked',booking_id=p_payload->>'booking_id',tracking_code=p_payload->>'tracking_code',needs_review=v_review,revision=revision+1,last_sync_code='ok',updated_at=clock_timestamp() WHERE id=f.id RETURNING * INTO f;
  INSERT INTO ayuzee_commerce.fulfilment_audit(fulfilment_id,kind) VALUES(f.id,'courier_booked');RETURN to_jsonb(f);
 ELSIF p_action='tracking' THEN
  IF f.booking_id IS NULL OR f.booking_id IS DISTINCT FROM p_payload->>'booking_id' OR f.tracking_code IS DISTINCT FROM p_payload->>'tracking_code' OR f.id::text IS DISTINCT FROM p_payload->>'reference' THEN RAISE EXCEPTION 'Tracking binding mismatch' USING ERRCODE='P5302';END IF;
  v_state:=p_payload->>'state';v_time:=(p_payload->>'occurred_at')::timestamptz;
  IF v_state IS NULL OR v_state NOT IN('booked','in_transit','out_for_delivery','delivery_exception','delivered','return_in_transit','returned') OR v_time IS NULL OR v_time>clock_timestamp()+interval '5 minutes' OR v_time<f.created_at-interval '5 minutes' THEN RAISE EXCEPTION 'Invalid courier observation' USING ERRCODE='22023';END IF;
  INSERT INTO ayuzee_commerce.delivery_events(integration,event_id,body_hash,fulfilment_id,state,occurred_at,applied) VALUES(f.integration,p_payload->>'event_id',p_payload->>'body_hash',f.id,v_state,v_time,false) ON CONFLICT DO NOTHING;v_inserted:=FOUND;
  SELECT * INTO e FROM ayuzee_commerce.delivery_events WHERE integration=f.integration AND event_id=p_payload->>'event_id' FOR UPDATE;
  IF e.body_hash IS DISTINCT FROM p_payload->>'body_hash' OR e.fulfilment_id<>f.id THEN RAISE EXCEPTION 'Courier event conflict' USING ERRCODE='P5302';END IF;
  -- Already applied or stale/equal-time conflicts cannot reverse a newer result.
  IF NOT v_inserted OR e.applied OR(f.last_event_at IS NOT NULL AND v_time<=f.last_event_at) THEN RETURN to_jsonb(f);END IF;
  v_applied:=CASE WHEN f.state IN('delivered','returned') THEN v_state=f.state WHEN f.state='return_in_transit' THEN v_state IN('return_in_transit','returned') WHEN f.state<>'booked' AND v_state='booked' THEN false ELSE true END;
  v_review:=f.needs_review OR ord.id IS NULL OR NOT ayuzee_commerce.fulfilment_eligible(f.order_id) OR f.address_hash IS DISTINCT FROM md5(ord.address::text);
  UPDATE ayuzee_commerce.delivery_events SET applied=v_applied WHERE integration=f.integration AND event_id=e.event_id;
  UPDATE ayuzee_commerce.fulfilments SET state=CASE WHEN v_applied THEN v_state ELSE state END,last_event_at=CASE WHEN v_applied THEN v_time ELSE last_event_at END,needs_review=v_review,revision=revision+1,updated_at=clock_timestamp() WHERE id=f.id RETURNING * INTO f;
  IF v_applied AND NOT v_review THEN
   UPDATE public.orders SET order_status=CASE WHEN v_state='delivered' THEN 'delivered' WHEN v_state='returned' THEN 'returned' WHEN v_state='booked' THEN order_status ELSE 'shipped' END,tracking_id=f.tracking_code,courier='local-fixture',updated_at=clock_timestamp() WHERE id=f.order_id;
  END IF;
  INSERT INTO ayuzee_commerce.fulfilment_audit(fulfilment_id,kind) VALUES(f.id,CASE WHEN v_applied THEN 'tracking_applied' ELSE 'tracking_ignored' END);RETURN to_jsonb(f);
 ELSE RAISE EXCEPTION 'Invalid worker action' USING ERRCODE='22023';END IF;
END $$;
CREATE FUNCTION public.commerce_fulfilment_worker(p_action text,p_payload jsonb) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$SELECT ayuzee_commerce.fulfilment_worker(p_action,p_payload)$$;
REVOKE ALL ON FUNCTION ayuzee_commerce.fulfilment_eligible(uuid),ayuzee_commerce.fulfilment_public(uuid),ayuzee_commerce.fulfilment_api(text,jsonb),public.commerce_fulfilment(text,jsonb),ayuzee_commerce.fulfilment_worker(text,jsonb),public.commerce_fulfilment_worker(text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION ayuzee_commerce.fulfilment_api(text,jsonb),public.commerce_fulfilment(text,jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION ayuzee_commerce.fulfilment_worker(text,jsonb),public.commerce_fulfilment_worker(text,jsonb) TO service_role;
NOTIFY pgrst,'reload schema';
COMMIT;
